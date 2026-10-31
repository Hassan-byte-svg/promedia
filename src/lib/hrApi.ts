import { buildPayrollJournalLines } from '@/lib/journal'
import { postJournal } from '@/lib/financeApi'
import { sbOrNull } from '@/lib/sb'
import { listAccounts } from '@/lib/servicesApi'
import { enqueueNotification } from '@/lib/notificationsApi'

export async function markAttendance(input: {
  employee_id: string
  work_date: string
  status?: string
  check_in?: string | null
  check_out?: string | null
  notes?: string | null
}) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { error } = await client.from('attendance_records').upsert(
    {
      employee_id: input.employee_id,
      work_date: input.work_date,
      status: input.status ?? 'present',
      check_in: input.check_in ?? new Date().toISOString(),
      check_out: input.check_out ?? null,
      notes: input.notes ?? null,
    },
    { onConflict: 'employee_id,work_date' },
  )
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function listAttendance(workDate?: string) {
  const client = sbOrNull()
  if (!client) return []
  let q = client.from('attendance_records').select('*').order('work_date', { ascending: false })
  if (workDate) q = q.eq('work_date', workDate)
  const { data } = await q.limit(100)
  return data ?? []
}

export async function createLeaveRequest(input: {
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  days: number
  reason?: string
}) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { data, error } = await client
    .from('leave_requests')
    .insert({
      employee_id: input.employee_id,
      leave_type: input.leave_type,
      start_date: input.start_date,
      end_date: input.end_date,
      days: input.days,
      reason: input.reason ?? null,
      status: 'pending',
    })
    .select('id')
    .single()
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, id: (data as { id: string }).id }
}

export async function listLeaveRequests() {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('leave_requests').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function setLeaveStatus(id: string, status: 'approved' | 'rejected' | 'cancelled') {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { error } = await client.from('leave_requests').update({ status }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function listPayrollRuns() {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('payroll_runs').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function createPayrollRun(input: {
  run_code: string
  period_start: string
  period_end: string
  lines: { employee_id: string; gross: number; deductions?: number }[]
}) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }

  const { data: dup } = await client.from('payroll_runs').select('id').eq('run_code', input.run_code).maybeSingle()
  if (dup) return { ok: false as const, error: `Payroll run ${input.run_code} already exists` }

  const totalGross = input.lines.reduce((s, l) => s + l.gross, 0)
  const totalNet = input.lines.reduce((s, l) => s + (l.gross - (l.deductions ?? 0)), 0)

  const { data: run, error } = await client
    .from('payroll_runs')
    .insert({
      run_code: input.run_code,
      period_start: input.period_start,
      period_end: input.period_end,
      status: 'draft',
      total_gross: totalGross,
      total_net: totalNet,
    })
    .select('id')
    .single()
  if (error) return { ok: false as const, error: error.message }
  const runId = (run as { id: string }).id

  if (input.lines.length) {
    const { error: lineErr } = await client.from('payroll_lines').insert(
      input.lines.map((l) => ({
        run_id: runId,
        employee_id: l.employee_id,
        gross: l.gross,
        deductions: l.deductions ?? 0,
        net: l.gross - (l.deductions ?? 0),
      })),
    )
    if (lineErr) return { ok: false as const, error: lineErr.message }
  }

  return { ok: true as const, id: runId }
}

export async function postPayrollRun(runId: string) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { data: run, error } = await client.from('payroll_runs').select('*').eq('id', runId).single()
  if (error || !run) return { ok: false as const, error: error?.message ?? 'Run not found' }
  const row = run as {
    id: string
    run_code: string
    status: string
    total_gross: number
    period_end: string
    journal_entry_id: string | null
  }
  if (row.status === 'posted' || row.journal_entry_id) {
    return { ok: false as const, error: 'Payroll already posted (no duplicate post)' }
  }

  const accounts = await listAccounts()
  const expense = accounts.find((a) => a.code === '5100')
  const payable = accounts.find((a) => a.code === '2100')
  if (!expense || !payable) {
    return { ok: false as const, error: 'Missing GL accounts 5100/2100 — apply migrations' }
  }

  const posted = await postJournal({
    entry_date: row.period_end,
    memo: `Payroll ${row.run_code}`,
    status: 'posted',
    idempotency_key: `payroll-post-${row.run_code}`,
    lines: buildPayrollJournalLines({
      expenseAccountId: expense.id,
      payableAccountId: payable.id,
      gross: Number(row.total_gross),
    }),
  })
  if (!posted.ok) return posted

  const { error: updErr } = await client
    .from('payroll_runs')
    .update({
      status: 'posted',
      journal_entry_id: posted.id,
      posted_at: new Date().toISOString(),
    })
    .eq('id', runId)
    .eq('status', 'draft')
  if (updErr) return { ok: false as const, error: updErr.message }

  await enqueueNotification({
    title: `Payroll posted: ${row.run_code}`,
    entity: 'payroll_runs',
    entity_id: runId,
    idempotency_key: `notify-payroll-${row.run_code}`,
  })

  return { ok: true as const, journal_id: posted.id }
}
