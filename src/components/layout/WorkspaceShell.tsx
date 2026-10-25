import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { SetupBanner } from './SetupBanner'
import './workspace.css'

export type NavItem = { to: string; label: string }
export type NavGroup = { title: string; items: NavItem[] }

export function WorkspaceShell({
  title,
  homeTo,
  groups,
}: {
  title: string
  homeTo: string
  groups: NavGroup[]
}) {
  const { profile, signOut, user } = useAuth()

  return (
    <div className="ws-frame">
      <SetupBanner />
      <div className="ws-shell">
        <aside className="ws-sidebar">
          <Link to={homeTo} className="brand ws-brand">
            <span className="brand-mark" aria-hidden />
            <span>
              <strong>TaxLegalPro</strong>
              <small>{title}</small>
            </span>
          </Link>
          <nav className="ws-nav" aria-label={title}>
            {groups.map((g) => (
              <div key={g.title} className="ws-group">
                <div className="ws-group-title">{g.title}</div>
                {g.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.to === homeTo}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        <div className="ws-main">
          <header className="ws-top">
            <div>
              <div className="eyebrow" style={{ marginBottom: 0 }}>
                {profile?.role ?? 'guest'}
              </div>
              <strong>{profile?.full_name ?? user?.email ?? 'Signed out'}</strong>
            </div>
            <div className="row">
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
