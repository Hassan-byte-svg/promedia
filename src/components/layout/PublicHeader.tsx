import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import './public-layout.css'

const links = [
  { to: '/services', label: 'Services' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/resources', label: 'Resources' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">TaxLegalPro</span>
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
          <Link to="/consultation" onClick={() => setOpen(false)}>
            <Button size="sm" variant="secondary">
              Book a Consultation
            </Button>
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
