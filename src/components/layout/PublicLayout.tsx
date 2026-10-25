import { Outlet } from 'react-router-dom'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'
import { SetupBanner } from './SetupBanner'
import './public-layout.css'

export function PublicLayout() {
  return (
    <div className="public-shell">
      <SetupBanner />
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
