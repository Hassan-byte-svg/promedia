import { useEffect, useState, type FormEvent } from 'react'
import { WorkspaceShell, type NavGroup } from '@/components/layout/WorkspaceShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/Input'
import {
  listAccounts,
  listCases,
  listEmployees,
  listInvoices,
  listLeads,
  listServices,
  listTaxProfiles,
} from '@/lib/servicesApi'
import { supabase } from '@/lib/supabase'
import type { Lead, Service, ServiceCase } from '@/types/database'
import { formatPkr } from '@/data/catalog'

const adminNav: NavGroup[] = [
  {
    title: 'Finance',
    items: [
      { to: '/app', label: 'Dashboard', end: true },
      { to: '/app/invoices', label: 'Invoicing & Billing' },
      { to: '/app/expenses', label: 'Expenses & Vendor Bills' },
      { to: '/app/banks', label: 'Bank & Cash' },
      { to: '/app/petty-cash', label: 'Petty cash' },
      { to: '/app/payments', label: 'Payments' },
      { to: '/app/journals', label: 'Accounting & Ledger' },
      { to: '/app/finance', label: 'Chart of accounts' },
      { to: '/app/reports', label: 'Reports & Compliance' },
    ],
  },
  {
    title: 'People & tax',
    items: [
      { to: '/app/payroll', label: 'Payroll Accounting' },
      { to: '/app/hr', label: 'HR Management' },
      { to: '/app/attendance', label: 'Attendance & leave' },
      { to: '/app/assets', label: 'Fixed Assets' },
      { to: '/app/budgets', label: 'Budgets' },
      { to: '/app/tax-compliance', label: 'Tax Center' },
      { to: '/app/tax', label: 'Tax profiles' },
    ],
  },
  {
    title: 'Practice',
    items: [
      { to: '/app/leads', label: 'Leads / CRM' },
      { to: '/app/cases', label: 'Service cases' },
      { to: '/app/services', label: 'Services' },
      { to: '/app/tasks', label: 'Tasks' },
      { to: '/portal', label: 'Client portal' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/app/documents', label: 'Documents' },
      { to: '/app/notifications', label: 'Notifications' },
      { to: '/app/settings', label: 'Settings' },
    ],
  },
]

export function AdminLayout() {
  return (
    <WorkspaceShell title="Finance & operations" homeTo="/app" groups={adminNav} variant="finance" />
  )
}

export function AdminDashboard() {
  const [counts, setCounts] = useState({ leads: 0, cases: 0, services: 0, invoices: 0 })
  useEffect(() => {
    void (async () => {
      const [leads, cases, services, invoices] = await Promise.all([
        listLeads(),
        listCases(),
        listServices(),
        listInvoices(),
      ])
      setCounts({
        leads: leads.length,
        cases: cases.length,
        services: services.length,
        invoices: invoices.length,
      })
    })()
  }, [])

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Operations overview</h1>
          <p className="muted">Live counts from Supabase when connected.</p>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi">
          <span>Leads</span>
          <strong>{counts.leads}</strong>
        </div>
        <div className="kpi">
          <span>Cases</span>
          <strong>{counts.cases}</strong>
        </div>
        <div className="kpi">
          <span>Services</span>
          <strong>{counts.services}</strong>
        </div>
        <div className="kpi">
          <span>Invoices</span>
          <strong>{counts.invoices}</strong>
        </div>
      </div>
      <div className="module-stub">
        Quick create and deeper analytics land in later slices. Sidebar modules below already route to
        working list/create screens where schema exists.
      </div>
    </>
  )
}

export function AdminLeadsPage() {
  const [rows, setRows] = useState<Lead[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function refresh() {
    setRows(await listLeads())
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const { error: err } = await supabase.from('leads').insert({
      full_name: String(fd.get('full_name')),
      email: String(fd.get('email')),
      phone: String(fd.get('phone') || '') || null,
      status: 'new',
      source: 'manual',
      notes: String(fd.get('notes') || '') || null,
    })
    setPending(false)
    if (err) {
      setError(err.message)
      return
    }
    e.currentTarget.reset()
    await refresh()
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Leads / CRM</h1>
          <p className="muted">Pipeline statuses start at new → qualify → won/lost in later work.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={(e) => void onCreate(e)} style={{ marginBottom: '1rem' }}>
        <h3>Add lead</h3>
        <div className="grid-2">
          <TextField label="Full name" name="full_name" required />
          <TextField label="Email" name="email" type="email" required />
          <TextField label="Phone" name="phone" />
          <TextAreaField label="Notes" name="notes" />
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit" disabled={pending}>
          Save lead
        </Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>No leads yet.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.full_name}</td>
                  <td>{r.email}</td>
                  <td>
                    <Badge>{r.status}</Badge>
                  </td>
                  <td>{r.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminCasesPage() {
  const [rows, setRows] = useState<ServiceCase[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listCases().then(setRows)
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    const fd = new FormData(e.currentTarget)
    const { error: err } = await supabase.from('service_cases').insert({
      title: String(fd.get('title')),
      status: 'intake',
      priority: 'normal',
    })
    if (err) {
      setError(err.message)
      return
    }
    e.currentTarget.reset()
    setRows(await listCases())
  }

  return (
    <>
      <div className="page-title">
        <h1>Service cases</h1>
      </div>
      <form className="card row" onSubmit={(e) => void onCreate(e)} style={{ marginBottom: '1rem' }}>
        <TextField label="Case title" name="title" required />
        <Button type="submit">Create case</Button>
      </form>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.case_number}</td>
                <td>{r.title}</td>
                <td>{r.status}</td>
                <td>{r.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminServicesPage() {
  const [rows, setRows] = useState<Service[]>([])
  useEffect(() => {
    void listServices().then(setRows)
  }, [])
  return (
    <>
      <div className="page-title">
        <h1>Service catalog</h1>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Featured</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{formatPkr(s.base_price)}</td>
                <td>{s.is_featured ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminFinancePage() {
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof listAccounts>>>([])
  useEffect(() => {
    void listAccounts().then(setAccounts)
  }, [])
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Finance</h1>
          <p className="muted">Chart of accounts seeded in migrations. Journal posting UI next.</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={3}>No accounts yet — apply migrations or check RLS/role.</td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.code}</td>
                  <td>{a.name}</td>
                  <td>{a.account_type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminInvoicesPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listInvoices>>>([])
  useEffect(() => {
    void listInvoices().then(setRows)
  }, [])
  return (
    <>
      <div className="page-title">
        <h1>Invoices</h1>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Status</th>
              <th>Total</th>
              <th>Issue date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>No invoices yet.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.invoice_number}</td>
                  <td>{r.status}</td>
                  <td>{formatPkr(r.total)}</td>
                  <td>{r.issue_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminTaxPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listTaxProfiles>>>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setRows(await listTaxProfiles())
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    const fd = new FormData(e.currentTarget)
    const { error: err } = await supabase.from('tax_profiles').insert({
      tax_year: String(fd.get('tax_year')),
      ntn: String(fd.get('ntn') || '') || null,
      filer_status: String(fd.get('filer_status') || '') || null,
      notes: String(fd.get('notes') || '') || null,
    })
    if (err) {
      setError(err.message)
      return
    }
    e.currentTarget.reset()
    await refresh()
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Tax profiles</h1>
          <p className="muted">Pakistani tax year profiles. FBR adapters stay secure and unverified until wired.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={(e) => void onCreate(e)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <TextField label="Tax year" name="tax_year" placeholder="2026-27" required />
          <TextField label="NTN" name="ntn" />
          <TextField label="Filer status" name="filer_status" />
          <TextAreaField label="Notes" name="notes" />
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit">Save profile</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Tax year</th>
              <th>NTN</th>
              <th>Filer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.tax_year}</td>
                <td>{r.ntn ?? '—'}</td>
                <td>{r.filer_status ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminHrPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listEmployees>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listEmployees().then(setRows)
  }, [])

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    const fd = new FormData(e.currentTarget)
    const { error: err } = await supabase.from('employees').insert({
      employee_code: String(fd.get('employee_code')),
      full_name: String(fd.get('full_name')),
      department: String(fd.get('department') || '') || null,
      job_title: String(fd.get('job_title') || '') || null,
      status: 'active',
    })
    if (err) {
      setError(err.message)
      return
    }
    e.currentTarget.reset()
    setRows(await listEmployees())
  }

  return (
    <>
      <div className="page-title">
        <h1>Employees</h1>
      </div>
      <form className="card stack" onSubmit={(e) => void onCreate(e)} style={{ marginBottom: '1rem' }}>
        <div className="grid-2">
          <TextField label="Employee code" name="employee_code" required />
          <TextField label="Full name" name="full_name" required />
          <TextField label="Department" name="department" />
          <TextField label="Job title" name="job_title" />
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit">Add employee</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.employee_code}</td>
                <td>{r.full_name}</td>
                <td>{r.department ?? '—'}</td>
                <td>{r.job_title ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function ModulePlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <>
      <div className="page-title">
        <h1>{title}</h1>
      </div>
      <div className="module-stub">{body}</div>
    </>
  )
}
