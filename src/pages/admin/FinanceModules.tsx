import { useEffect, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Input'
import { formatPkr } from '@/data/catalog'
import {
  addPettyCashEntry,
  createPettyCashAccount,
  listBankAccounts,
  listFiscalPeriods,
  listJournalEntries,
  listPayments,
  listPettyCashAccounts,
  listPettyCashEntries,
  postJournal,
  recordPayment,
  upsertBankAccount,
} from '@/lib/financeApi'
import { listAccounts, listInvoices } from '@/lib/servicesApi'

export function JournalsPage() {
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof listAccounts>>>([])
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof listJournalEntries>>>([])
  const [periods, setPeriods] = useState<Awaited<ReturnType<typeof listFiscalPeriods>>>([])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function refresh() {
    setAccounts(await listAccounts())
    setEntries(await listJournalEntries())
    setPeriods(await listFiscalPeriods())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const debitAccount = String(fd.get('debit_account'))
    const creditAccount = String(fd.get('credit_account'))
    const amount = Number(fd.get('amount'))
    const result = await postJournal({
      entry_date: String(fd.get('entry_date')),
      memo: String(fd.get('memo') || '') || undefined,
      status: fd.get('post_now') === 'on' ? 'posted' : 'draft',
      idempotency_key: String(fd.get('idempotency_key') || '') || undefined,
      lines: [
        { account_id: debitAccount, debit: amount, credit: 0, description: 'Debit' },
        { account_id: creditAccount, debit: 0, credit: amount, description: 'Credit' },
      ],
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMsg(`Saved journal ${result.id}`)
    e.currentTarget.reset()
    await refresh()
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Journals</h1>
          <p className="muted">Balanced double-entry only. Posted entries require an open fiscal period.</p>
        </div>
      </div>
      <div className="row" style={{ marginBottom: '1rem' }}>
        {periods.map((p) => (
          <Badge key={p.id} tone={p.is_locked ? 'warn' : 'good'}>
            {p.name} {p.is_locked ? 'locked' : 'open'}
          </Badge>
        ))}
      </div>
      <form className="card stack" onSubmit={(ev) => void onSubmit(ev)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <TextField label="Entry date" name="entry_date" type="date" required />
          <TextField label="Amount" name="amount" type="number" step="0.01" min="0.01" required />
          <label className="field">
            <span className="field-label">Debit account</span>
            <select className="field-control" name="debit_account" required>
              <option value="">Select…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Credit account</span>
            <select className="field-control" name="credit_account" required>
              <option value="">Select…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Memo" name="memo" />
          <TextField label="Idempotency key (optional)" name="idempotency_key" />
        </div>
        <label className="row">
          <input type="checkbox" name="post_now" /> Post immediately (period lock enforced)
        </label>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {msg ? <div className="alert">{msg}</div> : null}
        <Button type="submit">Save journal</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Number</th>
              <th>Status</th>
              <th>Memo</th>
            </tr>
          </thead>
          <tbody>
            {(entries as { id: string; entry_date: string; entry_number: string; status: string; memo: string | null }[]).map(
              (r) => (
                <tr key={r.id}>
                  <td>{r.entry_date}</td>
                  <td>{r.entry_number}</td>
                  <td>
                    <Badge tone={r.status === 'posted' ? 'good' : 'neutral'}>{r.status}</Badge>
                  </td>
                  <td>{r.memo ?? '—'}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function BanksPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listBankAccounts>>>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    void listBankAccounts().then(setRows)
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await upsertBankAccount({
      name: String(fd.get('name')),
      bank_name: String(fd.get('bank_name') || '') || undefined,
      account_number: String(fd.get('account_number') || '') || undefined,
      opening_balance: Number(fd.get('opening_balance') || 0),
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    setRows(await listBankAccounts())
  }

  return (
    <>
      <div className="page-title">
        <h1>Bank accounts</h1>
      </div>
      <form className="card stack" onSubmit={(ev) => void onSubmit(ev)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <TextField label="Name" name="name" required />
          <TextField label="Bank" name="bank_name" />
          <TextField label="Account number" name="account_number" />
          <TextField label="Opening balance" name="opening_balance" type="number" step="0.01" />
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit">Add bank account</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Bank</th>
              <th>Number</th>
              <th>Opening</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.bank_name ?? '—'}</td>
                <td>{r.account_number ?? '—'}</td>
                <td>{formatPkr(r.opening_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function PaymentsPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listPayments>>>([])
  const [invoices, setInvoices] = useState<Awaited<ReturnType<typeof listInvoices>>>([])
  const [banks, setBanks] = useState<Awaited<ReturnType<typeof listBankAccounts>>>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setRows(await listPayments())
    setInvoices(await listInvoices())
    setBanks(await listBankAccounts())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const invoiceId = String(fd.get('invoice_id') || '') || null
    const res = await recordPayment({
      amount: Number(fd.get('amount')),
      payment_date: String(fd.get('payment_date')),
      invoice_id: invoiceId,
      bank_account_id: String(fd.get('bank_account_id') || '') || null,
      method: String(fd.get('method') || 'bank_transfer'),
      memo: String(fd.get('memo') || '') || undefined,
      allocate: fd.get('allocate') === 'on' && Boolean(invoiceId),
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    await refresh()
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Payments</h1>
          <p className="muted">Record receipts and optionally allocate to an invoice.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={(ev) => void onSubmit(ev)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <TextField label="Amount" name="amount" type="number" step="0.01" required />
          <TextField label="Payment date" name="payment_date" type="date" required />
          <label className="field">
            <span className="field-label">Invoice</span>
            <select className="field-control" name="invoice_id">
              <option value="">None</option>
              {invoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoice_number} — {formatPkr(i.total)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Bank account</span>
            <select className="field-control" name="bank_account_id">
              <option value="">None</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Method" name="method" defaultValue="bank_transfer" />
          <TextField label="Memo" name="memo" />
        </div>
        <label className="row">
          <input type="checkbox" name="allocate" defaultChecked /> Allocate to invoice if selected
        </label>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit">Record payment</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.payment_number}</td>
                <td>{r.payment_date}</td>
                <td>{formatPkr(r.amount)}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function PettyCashPage() {
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof listPettyCashAccounts>>>([])
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof listPettyCashEntries>>>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setAccounts(await listPettyCashAccounts())
    setEntries(await listPettyCashEntries())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await createPettyCashAccount(String(fd.get('name')), String(fd.get('custodian') || ''))
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    await refresh()
  }

  async function onEntry(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await addPettyCashEntry({
      account_id: String(fd.get('account_id')),
      direction: String(fd.get('direction')) as 'in' | 'out',
      amount: Number(fd.get('amount')),
      memo: String(fd.get('memo') || '') || undefined,
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    await refresh()
  }

  return (
    <>
      <div className="page-title">
        <h1>Petty cash</h1>
      </div>
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <form className="card stack" onSubmit={(ev) => void onAccount(ev)}>
          <h3>New account</h3>
          <TextField label="Name" name="name" required />
          <TextField label="Custodian" name="custodian" />
          <Button type="submit">Create</Button>
        </form>
        <form className="card stack" onSubmit={(ev) => void onEntry(ev)}>
          <h3>Entry</h3>
          <label className="field">
            <span className="field-label">Account</span>
            <select className="field-control" name="account_id" required>
              <option value="">Select…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatPkr(a.balance)})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Direction</span>
            <select className="field-control" name="direction">
              <option value="out">Out</option>
              <option value="in">In</option>
            </select>
          </label>
          <TextField label="Amount" name="amount" type="number" step="0.01" required />
          <TextField label="Memo" name="memo" />
          <Button type="submit">Add entry</Button>
        </form>
      </div>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Direction</th>
              <th>Amount</th>
              <th>Memo</th>
            </tr>
          </thead>
          <tbody>
            {(entries as { id: string; entry_date: string; direction: string; amount: number; memo: string | null }[]).map(
              (r) => (
                <tr key={r.id}>
                  <td>{r.entry_date}</td>
                  <td>{r.direction}</td>
                  <td>{formatPkr(r.amount)}</td>
                  <td>{r.memo ?? '—'}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
