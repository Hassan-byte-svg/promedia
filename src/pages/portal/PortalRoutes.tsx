import { useEffect, useState, type FormEvent } from 'react'
import { WorkspaceShell, type NavGroup } from '@/components/layout/WorkspaceShell'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Input'
import { useAuth } from '@/lib/auth'
import { getSignedDownloadUrl, listDocuments, uploadDocument } from '@/lib/documentsApi'
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
  const { user } = useAuth()
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listDocuments>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listDocuments().then(setRows)
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
      ownerFolder: user?.id ?? 'client',
      client_id: user?.id ?? null,
    })
    if (!res.ok) {
      setError(res.error)
      return
    }
    e.currentTarget.reset()
    setRows(await listDocuments())
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Your documents</h1>
          <p className="muted">Uploads go to private storage; downloads use signed URLs.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={(ev) => void onUpload(ev)} style={{ marginBottom: '1rem' }}>
        <TextField label="Title" name="title" />
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
              <th />
            </tr>
          </thead>
          <tbody>
            {(rows as { id: string; title: string; storage_path: string }[]).map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
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

export function PortalSupportPage() {
  return (
    <ModulePlaceholder
      title="Support"
      body="Support tickets will attach to your client profile. For now use the public contact form."
    />
  )
}
