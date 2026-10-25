import { useEffect, useState } from 'react'
import { WorkspaceShell, type NavGroup } from '@/components/layout/WorkspaceShell'
import { useAuth } from '@/lib/auth'
import { listCases, listInvoices } from '@/lib/servicesApi'
import { formatPkr } from '@/data/catalog'
import { ModulePlaceholder } from '@/pages/admin/AdminRoutes'

const portalNav: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ to: '/portal', label: 'Dashboard' }],
  },
  {
    title: 'My work',
    items: [
      { to: '/portal/cases', label: 'Services & cases' },
      { to: '/portal/documents', label: 'Documents' },
      { to: '/portal/invoices', label: 'Invoices' },
      { to: '/portal/support', label: 'Support' },
    ],
  },
]

export function PortalLayout() {
  return <WorkspaceShell title="Client portal" homeTo="/portal" groups={portalNav} />
}

export function PortalDashboard() {
  const { profile } = useAuth()
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
          <p className="muted">Track services, documents, and invoices for your organisation.</p>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi">
          <span>Open cases</span>
          <strong>—</strong>
        </div>
        <div className="kpi">
          <span>Documents</span>
          <strong>—</strong>
        </div>
        <div className="kpi">
          <span>Outstanding</span>
          <strong>—</strong>
        </div>
        <div className="kpi">
          <span>Messages</span>
          <strong>—</strong>
        </div>
      </div>
      <div className="module-stub">
        Counts hydrate from RLS-scoped queries once your client profile owns cases and invoices.
      </div>
    </>
  )
}

export function PortalCasesPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listCases>>>([])
  useEffect(() => {
    void listCases().then(setRows)
  }, [])
  return (
    <>
      <div className="page-title">
        <h1>Your cases</h1>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Case</th>
              <th>Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3}>No cases visible for this account yet.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.case_number}</td>
                  <td>{r.title}</td>
                  <td>{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function PortalInvoicesPage() {
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
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3}>No invoices yet.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.invoice_number}</td>
                  <td>{r.status}</td>
                  <td>{formatPkr(r.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function PortalDocumentsPage() {
  return (
    <ModulePlaceholder
      title="Documents"
      body="Private Supabase Storage bucket `client-documents` is defined in migrations. Upload UI and signed URLs ship in the next document slice."
    />
  )
}

export function PortalSupportPage() {
  return (
    <ModulePlaceholder
      title="Support"
      body="Support tickets will attach to your client profile. For now use the public contact form."
    />
  )
}
