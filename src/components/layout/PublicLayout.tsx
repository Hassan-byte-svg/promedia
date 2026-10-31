import { Outlet, useLocation } from 'react-router-dom'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'
import { SetupBanner } from './SetupBanner'
import './public-layout.css'

export function PublicLayout() {
  const { pathname } = useLocation()
  const home = pathname === '/'

  return (
    <div className="public-shell">
      <SetupBanner />
      {!home ? <PublicHeader /> : null}
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
