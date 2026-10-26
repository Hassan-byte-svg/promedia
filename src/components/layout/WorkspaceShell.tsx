import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { SetupBanner } from './SetupBanner'
import './workspace.css'

export type NavItem = { to: string; label: string; icon?: string; end?: boolean; external?: boolean }
export type NavGroup = { title: string; items: NavItem[] }

const TITLE_MAP: Record<string, { title: string; subtitle: string }> = {
  '/app': {
    title: 'Finance Dashboard',
    subtitle: 'Overview of TaxLegalPro financials · Pakistan',
  },
  '/app/invoices': {
    title: 'Invoicing & Billing',
    subtitle: 'Sales invoices · receipts · client balances',
  },
  '/app/expenses': {
    title: 'Expenses & Vendor Bills',
    subtitle: 'AP and vendor spend',
  },
  '/app/banks': {
    title: 'Bank & Cash Management',
    subtitle: 'Bank accounts · petty cash · reconciliation',
  },
  '/app/petty-cash': {
    title: 'Petty cash',
    subtitle: 'Cash floats and entries',
  },
  '/app/journals': {
    title: 'Accounting & Ledger',
    subtitle: 'Journals · double-entry posting',
  },
  '/app/finance': {
    title: 'Chart of accounts',
    subtitle: 'GL structure',
  },
  '/app/reports': {
    title: 'Reports & Compliance',
    subtitle: 'Financial and ops exports',
  },
  '/app/payroll': {
    title: 'Payroll Accounting',
    subtitle: 'Runs · posting · no duplicate journals',
  },
  '/app/hr': {
    title: 'HR Management',
    subtitle: 'Employees · org structure',
  },
  '/app/attendance': {
    title: 'Attendance & leave',
    subtitle: 'Daily marks and leave requests',
  },
  '/app/assets': {
    title: 'Fixed Assets',
    subtitle: 'Register and depreciation (stub)',
  },
  '/app/budgets': {
    title: 'Budgets',
    subtitle: 'Planning envelopes (stub)',
  },
  '/app/tax-compliance': {
    title: 'Tax Center',
    subtitle: 'Filings · deadlines · acknowledgments',
  },
  '/app/tax': {
    title: 'Tax profiles',
    subtitle: 'Client tax year profiles',
  },
  '/app/settings': {
    title: 'Settings',
    subtitle: 'Workspace and access',
  },
  '/app/leads': { title: 'Leads / CRM', subtitle: 'Pipeline' },
  '/app/cases': { title: 'Service cases', subtitle: 'Delivery work' },
  '/app/services': { title: 'Services', subtitle: 'Catalog' },
  '/app/tasks': { title: 'Tasks', subtitle: 'Assignments' },
  '/app/documents': { title: 'Documents', subtitle: 'Private storage' },
  '/app/notifications': { title: 'Notifications', subtitle: 'Reminders' },
  '/app/payments': { title: 'Payments', subtitle: 'Receipts and allocations' },
}

function pageMeta(pathname: string) {
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname]
  const base = Object.keys(TITLE_MAP).find((k) => pathname.startsWith(k) && k !== '/app')
  return TITLE_MAP[base ?? '/app']
}

export function WorkspaceShell({
  title,
  homeTo,
  groups,
  variant = 'default',
}: {
  title: string
  homeTo: string
  groups: NavGroup[]
  variant?: 'default' | 'finance'
}) {
  const { profile, signOut, user } = useAuth()
  const { pathname } = useLocation()
  const meta = pageMeta(pathname)
  const initials = (profile?.full_name || user?.email || 'TL')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="ws-frame">
      <SetupBanner />
      <div className={`ws-shell ${variant === 'finance' ? 'finance' : ''}`}>
        <aside className="ws-sidebar">
          <div className="ws-brand-block">
            <Link to={homeTo} className="brand ws-brand">
              <span className="brand-mark" aria-hidden />
              <span>
                <strong>TaxLegalPro</strong>
                <small>{title}</small>
              </span>
            </Link>
          </div>
          <nav className="ws-nav" aria-label={title}>
            {groups.map((g) => (
              <div key={g.title} className="ws-group">
                <div className="ws-group-title">{g.title}</div>
                {g.items.map((item) =>
                  item.external ? (
                    <a key={item.to} href={item.to} target="_blank" rel="noreferrer">
                      {item.icon ? <span className="ws-nav-icon">{item.icon}</span> : null}
                      {item.label}
                    </a>
                  ) : (
                    <NavLink key={item.to} to={item.to} end={item.end ?? item.to === homeTo}>
                      {item.icon ? <span className="ws-nav-icon">{item.icon}</span> : null}
                      {item.label}
                    </NavLink>
                  ),
                )}
              </div>
            ))}
          </nav>
          <div className="ws-user">
            <div className="ws-avatar">{initials}</div>
            <div>
              <strong>{profile?.full_name ?? user?.email ?? 'Staff'}</strong>
              <span>{profile?.role ?? 'admin workspace'}</span>
            </div>
          </div>
        </aside>
        <div className="ws-main">
          <header className="ws-top">
            <div>
              <h1>{meta.title}</h1>
              <p className="sub">{meta.subtitle}</p>
            </div>
            <div className="ws-top-tools">
              <input className="ws-search" placeholder="Search invoices, journals, vendors…" aria-label="Search" />
              <span className="ws-pill">
                <span className="dot" /> PKR
              </span>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  Public site
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          </header>
          <div className="ws-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
