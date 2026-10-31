import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/services', label: 'Services' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const dark = pathname === '/'

  return (
    <header className={`site-header ${dark ? 'is-dark' : ''}`}>
      <div className="site-header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          TaxLegalPro
        </Link>

        <nav className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-actions">
          <Link to="/login" className="header-link" onClick={() => setOpen(false)}>
            Client Login
          </Link>
          <Link to="/consultation" className="header-cta" onClick={() => setOpen(false)}>
            Book a consultation
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
