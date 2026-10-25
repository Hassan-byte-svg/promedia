import { useEffect, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/Input'
import { formatPkr } from '@/data/catalog'
import { getSignedDownloadUrl, listDocuments, uploadDocument } from '@/lib/documentsApi'
import {
  createLeaveRequest,
  createPayrollRun,
  listAttendance,
  listLeaveRequests,
  listPayrollRuns,
  markAttendance,
  postPayrollRun,
  setLeaveStatus,
} from '@/lib/hrApi'
import { ensureDeadlineReminders, listNotifications } from '@/lib/notificationsApi'
import { listEmployees } from '@/lib/servicesApi'
import { useAuth } from '@/lib/auth'
import {
  addTaskComment,
  createTask,
  listTaskComments,
  listTasks,
  updateTaskStatus,
} from '@/lib/tasksApi'
import {
  advanceFilingStatus,
  createTaxDeadline,
  createTaxFiling,
  listTaxDeadlines,
  listTaxFilings,
  type FilingStatus,
} from '@/lib/taxApi'

export function AttendancePage() {
  const [employees, setEmployees] = useState<Awaited<ReturnType<typeof listEmployees>>>([])
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAttendance>>>([])
  const [error, setError] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  async function refresh() {
    setEmployees(await listEmployees())
    setRows(await listAttendance())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await markAttendance({
      employee_id: String(fd.get('employee_id')),
      work_date: String(fd.get('work_date')),
      status: String(fd.get('status') || 'present'),
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    await refresh()
  }

  return (
    <>
      <div className="page-title">
        <h1>Attendance</h1>
      </div>
      <form className="card row" onSubmit={(ev) => void onSubmit(ev)} style={{ marginBottom: '1rem' }}>
        <label className="field">
          <span className="field-label">Employee</span>
          <select className="field-control" name="employee_id" required>
            <option value="">Select…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Date" name="work_date" type="date" defaultValue={today} required />
        <label className="field">
          <span className="field-label">Status</span>
          <select className="field-control" name="status">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>
        </label>
        <Button type="submit">Mark</Button>
      </form>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Check-in</th>
            </tr>
          </thead>
          <tbody>
            {(rows as { id: string; work_date: string; employee_id: string; status: string; check_in: string | null }[]).map(
              (r) => (
                <tr key={r.id}>
                  <td>{r.work_date}</td>
                  <td>{employees.find((e) => e.id === r.employee_id)?.full_name ?? r.employee_id}</td>
                  <td>{r.status}</td>
                  <td>{r.check_in ? new Date(r.check_in).toLocaleString() : '—'}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <LeaveSection employees={employees} />
    </>
  )
}

function LeaveSection({
  employees,
}: {
  employees: Awaited<ReturnType<typeof listEmployees>>
}) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listLeaveRequests>>>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    void listLeaveRequests().then(setRows)
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await createLeaveRequest({
      employee_id: String(fd.get('employee_id')),
      leave_type: String(fd.get('leave_type') || 'annual'),
      start_date: String(fd.get('start_date')),
      end_date: String(fd.get('end_date')),
      days: Number(fd.get('days')),
      reason: String(fd.get('reason') || '') || undefined,
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    setRows(await listLeaveRequests())
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Leave requests</h2>
      <form className="card stack" onSubmit={(ev) => void onSubmit(ev)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <label className="field">
            <span className="field-label">Employee</span>
            <select className="field-control" name="employee_id" required>
              <option value="">Select…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Type" name="leave_type" defaultValue="annual" />
          <TextField label="Start" name="start_date" type="date" required />
          <TextField label="End" name="end_date" type="date" required />
          <TextField label="Days" name="days" type="number" step="0.5" min="0.5" required />
          <TextField label="Reason" name="reason" />
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit">Request leave</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(rows as { id: string; employee_id: string; start_date: string; end_date: string; days: number; status: string }[]).map(
              (r) => (
                <tr key={r.id}>
                  <td>{employees.find((e) => e.id === r.employee_id)?.full_name ?? r.employee_id}</td>
                  <td>
                    {r.start_date} → {r.end_date}
                  </td>
                  <td>{r.days}</td>
                  <td>
                    <Badge>{r.status}</Badge>
                  </td>
                  <td className="row">
                    {r.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void setLeaveStatus(r.id, 'approved').then(() => listLeaveRequests().then(setRows))}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void setLeaveStatus(r.id, 'rejected').then(() => listLeaveRequests().then(setRows))}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function PayrollPage() {
  const [employees, setEmployees] = useState<Awaited<ReturnType<typeof listEmployees>>>([])
  const [runs, setRuns] = useState<Awaited<ReturnType<typeof listPayrollRuns>>>([])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function refresh() {
    setEmployees(await listEmployees())
    setRuns(await listPayrollRuns())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const employeeId = String(fd.get('employee_id'))
    const gross = Number(fd.get('gross'))
    const res = await createPayrollRun({
      run_code: String(fd.get('run_code')),
      period_start: String(fd.get('period_start')),
      period_end: String(fd.get('period_end')),
      lines: employeeId ? [{ employee_id: employeeId, gross, deductions: Number(fd.get('deductions') || 0) }] : [],
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    setMsg(`Created run ${res.id}`)
    e.currentTarget.reset()
    await refresh()
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Payroll</h1>
          <p className="muted">Create draft runs, then post once — duplicate posts are blocked.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={(ev) => void onCreate(ev)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <TextField label="Run code" name="run_code" placeholder="PR-2026-10" required />
          <TextField label="Period start" name="period_start" type="date" required />
          <TextField label="Period end" name="period_end" type="date" required />
          <label className="field">
            <span className="field-label">Employee (optional first line)</span>
            <select className="field-control" name="employee_id">
              <option value="">None</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Gross" name="gross" type="number" step="0.01" defaultValue="0" />
          <TextField label="Deductions" name="deductions" type="number" step="0.01" defaultValue="0" />
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {msg ? <div className="alert">{msg}</div> : null}
        <Button type="submit">Create draft run</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Period</th>
              <th>Gross</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(runs as { id: string; run_code: string; period_start: string; period_end: string; total_gross: number; status: string }[]).map(
              (r) => (
                <tr key={r.id}>
                  <td>{r.run_code}</td>
                  <td>
                    {r.period_start} → {r.period_end}
                  </td>
                  <td>{formatPkr(r.total_gross)}</td>
                  <td>
                    <Badge tone={r.status === 'posted' ? 'good' : 'neutral'}>{r.status}</Badge>
                  </td>
                  <td>
                    {r.status === 'draft' ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          void postPayrollRun(r.id).then(async (res) => {
                            if (!res.ok) setError(res.error)
                            else setMsg(`Posted ${r.run_code}`)
                            await refresh()
                          })
                        }
                      >
                        Post journal
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function TaxCompliancePage() {
  const [deadlines, setDeadlines] = useState<Awaited<ReturnType<typeof listTaxDeadlines>>>([])
  const [filings, setFilings] = useState<Awaited<ReturnType<typeof listTaxFilings>>>([])
  const [error, setError] = useState<string | null>(null)
  const [ack, setAck] = useState('')

  async function refresh() {
    setDeadlines(await listTaxDeadlines())
    setFilings(await listTaxFilings())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onDeadline(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await createTaxDeadline({
      title: String(fd.get('title')),
      due_date: String(fd.get('due_date')),
      tax_year: String(fd.get('tax_year') || '') || undefined,
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    await refresh()
  }

  async function onFiling(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await createTaxFiling({
      tax_year: String(fd.get('tax_year')),
      filing_type: String(fd.get('filing_type') || 'income_tax_return'),
      notes: String(fd.get('notes') || '') || undefined,
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
          <h1>Tax compliance</h1>
          <p className="muted">Filings move through draft → review → ready → submitted → acknowledged. No fake FBR success.</p>
        </div>
      </div>
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <form className="card stack" onSubmit={(ev) => void onDeadline(ev)}>
          <h3>Deadline</h3>
          <TextField label="Title" name="title" required />
          <TextField label="Due date" name="due_date" type="date" required />
          <TextField label="Tax year" name="tax_year" />
          <Button type="submit">Add deadline</Button>
        </form>
        <form className="card stack" onSubmit={(ev) => void onFiling(ev)}>
          <h3>Filing case</h3>
          <TextField label="Tax year" name="tax_year" required />
          <TextField label="Type" name="filing_type" defaultValue="income_tax_return" />
          <TextAreaField label="Notes" name="notes" />
          <Button type="submit">Create filing</Button>
        </form>
      </div>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <h3>Calendar</h3>
      <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
        <table className="data">
          <thead>
            <tr>
              <th>Due</th>
              <th>Title</th>
              <th>Year</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(deadlines as { id: string; due_date: string; title: string; tax_year: string | null; status: string }[]).map(
              (d) => (
                <tr key={d.id}>
                  <td>{d.due_date}</td>
                  <td>{d.title}</td>
                  <td>{d.tax_year ?? '—'}</td>
                  <td>{d.status}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <h3>Filings</h3>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Year</th>
              <th>Status</th>
              <th>Ack ref</th>
              <th>Advance</th>
            </tr>
          </thead>
          <tbody>
            {(filings as { id: string; filing_number: string; tax_year: string; status: string; acknowledgment_ref: string | null }[]).map(
              (f) => (
                <tr key={f.id}>
                  <td>{f.filing_number}</td>
                  <td>{f.tax_year}</td>
                  <td>
                    <Badge>{f.status}</Badge>
                  </td>
                  <td>{f.acknowledgment_ref ?? '—'}</td>
                  <td className="row">
                    {(
                      [
                        ['in_review', 'Review'],
                        ['ready_to_file', 'Ready'],
                        ['submitted', 'Submitted'],
                      ] as [FilingStatus, string][]
                    ).map(([st, label]) => (
                      <Button
                        key={st}
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void advanceFilingStatus(f.id, st).then(async (res) => {
                            if (!res.ok) setError(res.error)
                            await refresh()
                          })
                        }
                      >
                        {label}
                      </Button>
                    ))}
                    <TextField
                      label="FBR ack ref"
                      name={`ack-${f.id}`}
                      value={ack}
                      onChange={(ev) => setAck(ev.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        void advanceFilingStatus(f.id, 'acknowledged', ack).then(async (res) => {
                          if (!res.ok) setError(res.error)
                          else setAck('')
                          await refresh()
                        })
                      }
                    >
                      Acknowledge
                    </Button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function DocumentsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listDocuments>>>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setRows(await listDocuments())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const file = fd.get('file')
    if (!(file instanceof File) || !file.size) {
      setError('Choose a file')
      return
    }
    const res = await uploadDocument({
      file,
      title: String(fd.get('title') || file.name),
      ownerFolder: user?.id ?? 'staff',
      case_id: String(fd.get('case_id') || '') || null,
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
          <h1>Documents</h1>
          <p className="muted">Private bucket `client-documents` — downloads use short-lived signed URLs.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={(ev) => void onUpload(ev)} style={{ marginBottom: '1rem' }}>
        <TextField label="Title" name="title" />
        <TextField label="Case ID (optional)" name="case_id" />
        <label className="field">
          <span className="field-label">File</span>
          <input className="field-control" type="file" name="file" required />
        </label>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit">Upload</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Title</th>
              <th>Path</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(rows as { id: string; title: string; storage_path: string }[]).map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td className="muted">{r.storage_path}</td>
                <td>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void getSignedDownloadUrl(r.storage_path).then((res) => {
                        if (!res.ok) setError(res.error)
                        else window.open(res.url, '_blank', 'noopener,noreferrer')
                      })
                    }
                  >
                    Download
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function TasksPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listTasks>>>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [comments, setComments] = useState<Awaited<ReturnType<typeof listTaskComments>>>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setRows(await listTasks())
  }
  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    if (!selected) {
      setComments([])
      return
    }
    void listTaskComments(selected).then(setComments)
  }, [selected])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await createTask({
      title: String(fd.get('title')),
      description: String(fd.get('description') || '') || undefined,
      due_date: String(fd.get('due_date') || '') || null,
      priority: String(fd.get('priority') || 'normal'),
      assignee_id: String(fd.get('assignee_id') || '') || null,
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    await refresh()
  }

  async function onComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    const fd = new FormData(e.currentTarget)
    const res = await addTaskComment(selected, String(fd.get('body')))
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    setComments(await listTaskComments(selected))
  }

  return (
    <>
      <div className="page-title">
        <h1>Tasks</h1>
      </div>
      <form className="card stack" onSubmit={(ev) => void onCreate(ev)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <TextField label="Title" name="title" required />
          <TextField label="Due date" name="due_date" type="date" />
          <TextField label="Priority" name="priority" defaultValue="normal" />
          <TextField label="Assignee profile UUID" name="assignee_id" />
          <TextAreaField label="Description" name="description" />
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit">Create task</Button>
      </form>
      <div className="grid-2">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Title</th>
                <th>Due</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(rows as { id: string; title: string; due_date: string | null; status: string }[]).map((r) => (
                <tr key={r.id}>
                  <td>
                    <button type="button" className="header-link" onClick={() => setSelected(r.id)}>
                      {r.title}
                    </button>
                  </td>
                  <td>{r.due_date ?? '—'}</td>
                  <td>{r.status}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void updateTaskStatus(r.id, r.status === 'done' ? 'todo' : 'done').then(refresh)
                      }
                    >
                      Toggle done
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card stack">
          <h3>Comments {selected ? '' : '(select a task)'}</h3>
          <ul>
            {(comments as { id: string; body: string; created_at: string }[]).map((c) => (
              <li key={c.id}>
                {c.body} <span className="muted">· {new Date(c.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <form className="stack" onSubmit={(ev) => void onComment(ev)}>
            <TextAreaField label="Comment" name="body" required />
            <Button type="submit" disabled={!selected}>
              Add comment
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}

export function NotificationsPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listNotifications>>>([])
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    void listNotifications().then(setRows)
  }, [])

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Notifications</h1>
          <p className="muted">Idempotent reminder inserts for due tax deadlines.</p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            void ensureDeadlineReminders().then(async (r) => {
              setMsg(`Processed reminders (created/seen ${r.created})`)
              setRows(await listNotifications())
            })
          }
        >
          Run deadline reminders
        </Button>
      </div>
      {msg ? <div className="alert">{msg}</div> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Title</th>
              <th>Body</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {(rows as { id: string; title: string; body: string | null; created_at: string }[]).map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.body ?? '—'}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
