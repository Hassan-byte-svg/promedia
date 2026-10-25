import { assertBalanced, type JournalLineInput } from '@/lib/journal'
import { sb, sbOrNull } from '@/lib/sb'
import { enqueueNotification } from '@/lib/notificationsApi'

export type FiscalPeriod = {
  id: string
  name: string
  start_date: string
  end_date: string
  is_locked: boolean
}

export type BankAccount = {
  id: string
  name: string
  bank_name: string | null
  account_number: string | null
  currency: string
  opening_balance: number
  is_active: boolean
}

export type PettyCashAccount = {
  id: string
  name: string
  custodian: string | null
  balance: number
  is_active: boolean
}

export type Payment = {
  id: string
  payment_number: string
  invoice_id: string | null
  amount: number
  payment_date: string
  method: string
  status: string
  memo: string | null
}

export async function listFiscalPeriods(): Promise<FiscalPeriod[]> {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('fiscal_periods').select('*').order('start_date', { ascending: false })
  return (data as FiscalPeriod[]) ?? []
}

export async function findOpenPeriodForDate(date: string): Promise<FiscalPeriod | null> {
  const periods = await listFiscalPeriods()
  return periods.find((p) => p.start_date <= date && p.end_date >= date && !p.is_locked) ?? null
}

export async function listBankAccounts(): Promise<BankAccount[]> {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('bank_accounts').select('*').order('name')
  return (data as BankAccount[]) ?? []
}

export async function upsertBankAccount(input: {
  id?: string
  name: string
  bank_name?: string
  account_number?: string
  opening_balance?: number
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const db = sb()
    if (input.id) {
      const { error } = await db
        .from('bank_accounts')
        .update({
          name: input.name,
          bank_name: input.bank_name ?? null,
          account_number: input.account_number ?? null,
          opening_balance: input.opening_balance ?? 0,
        })
        .eq('id', input.id)
      if (error) return { ok: false, error: error.message }
      return { ok: true, id: input.id }
    }
    const { data, error } = await db
      .from('bank_accounts')
      .insert({
        name: input.name,
        bank_name: input.bank_name ?? null,
        account_number: input.account_number ?? null,
        opening_balance: input.opening_balance ?? 0,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: (data as { id: string }).id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function listPettyCashAccounts(): Promise<PettyCashAccount[]> {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('petty_cash_accounts').select('*').order('name')
  return (data as PettyCashAccount[]) ?? []
}

export async function listJournalEntries() {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client
    .from('journal_entries')
    .select('*, journal_lines(*)')
    .order('entry_date', { ascending: false })
    .limit(50)
  return data ?? []
}

export async function postJournal(input: {
  entry_date: string
  memo?: string
  lines: JournalLineInput[]
  status?: 'draft' | 'posted'
  idempotency_key?: string
  created_by?: string | null
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const db = sb()
    const totals = assertBalanced(input.lines)
    const period = await findOpenPeriodForDate(input.entry_date)
    if (!period && input.status === 'posted') {
      return { ok: false, error: 'No open fiscal period for entry date (locked or missing).' }
    }

    if (input.idempotency_key) {
      const { data: existing } = await db
        .from('journal_entries')
        .select('id')
        .eq('idempotency_key', input.idempotency_key)
        .maybeSingle()
      if (existing) return { ok: true, id: (existing as { id: string }).id }
    }

    const status = input.status ?? 'draft'
    const { data: entry, error } = await db
      .from('journal_entries')
      .insert({
        entry_date: input.entry_date,
        memo: input.memo ?? null,
        status,
        fiscal_period_id: period?.id ?? null,
        idempotency_key: input.idempotency_key ?? null,
        created_by: input.created_by ?? null,
        posted_at: status === 'posted' ? new Date().toISOString() : null,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }

    const entryId = (entry as { id: string }).id
    const { error: lineErr } = await db.from('journal_lines').insert(
      input.lines.map((l) => ({
        entry_id: entryId,
        account_id: l.account_id,
        debit: l.debit,
        credit: l.credit,
        description: l.description ?? null,
      })),
    )
    if (lineErr) {
      await db.from('journal_entries').delete().eq('id', entryId)
      return { ok: false, error: lineErr.message }
    }

    if (status === 'posted') {
      await enqueueNotification({
        title: 'Journal posted',
        body: `Entry balanced at ${totals.debit}`,
        entity: 'journal_entries',
        entity_id: entryId,
        idempotency_key: input.idempotency_key
          ? `notify-je-${input.idempotency_key}`
          : `notify-je-${entryId}`,
      })
    }

    return { ok: true, id: entryId }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to post journal' }
  }
}

export async function listPayments(): Promise<Payment[]> {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('payments').select('*').order('payment_date', { ascending: false })
  return (data as Payment[]) ?? []
}

export async function recordPayment(input: {
  amount: number
  payment_date: string
  invoice_id?: string | null
  bank_account_id?: string | null
  method?: string
  memo?: string
  client_id?: string | null
  allocate?: boolean
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const db = sb()
    const { data, error } = await db
      .from('payments')
      .insert({
        amount: input.amount,
        payment_date: input.payment_date,
        invoice_id: input.invoice_id ?? null,
        bank_account_id: input.bank_account_id ?? null,
        method: input.method ?? 'bank_transfer',
        memo: input.memo ?? null,
        client_id: input.client_id ?? null,
        status: input.allocate && input.invoice_id ? 'allocated' : 'recorded',
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }
    const paymentId = (data as { id: string }).id

    if (input.allocate && input.invoice_id) {
      const { error: allocErr } = await db.from('payment_allocations').insert({
        payment_id: paymentId,
        invoice_id: input.invoice_id,
        amount: input.amount,
      })
      if (allocErr) return { ok: false, error: allocErr.message }
      await db.from('invoices').update({ status: 'paid' }).eq('id', input.invoice_id)
    }

    return { ok: true, id: paymentId }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function createPettyCashAccount(name: string, custodian?: string) {
  try {
    const db = sb()
    const { data, error } = await db
      .from('petty_cash_accounts')
      .insert({ name, custodian: custodian ?? null })
      .select('id')
      .single()
    if (error) return { ok: false as const, error: error.message }
    return { ok: true as const, id: (data as { id: string }).id }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function addPettyCashEntry(input: {
  account_id: string
  direction: 'in' | 'out'
  amount: number
  memo?: string
  entry_date?: string
}) {
  try {
    const db = sb()
    const { error } = await db.from('petty_cash_entries').insert({
      account_id: input.account_id,
      direction: input.direction,
      amount: input.amount,
      memo: input.memo ?? null,
      entry_date: input.entry_date ?? new Date().toISOString().slice(0, 10),
    })
    if (error) return { ok: false as const, error: error.message }

    const delta = input.direction === 'in' ? input.amount : -input.amount
    const { data: acct } = await db
      .from('petty_cash_accounts')
      .select('balance')
      .eq('id', input.account_id)
      .single()
    const balance = Number((acct as { balance: number } | null)?.balance ?? 0) + delta
    await db.from('petty_cash_accounts').update({ balance }).eq('id', input.account_id)
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function listPettyCashEntries(accountId?: string) {
  const client = sbOrNull()
  if (!client) return []
  let q = client.from('petty_cash_entries').select('*').order('entry_date', { ascending: false })
  if (accountId) q = q.eq('account_id', accountId)
  const { data } = await q.limit(100)
  return data ?? []
}
