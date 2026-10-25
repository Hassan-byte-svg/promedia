import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPkr } from '@/data/catalog'
import { listServices } from '@/lib/servicesApi'
import type { Service } from '@/types/database'
import './home.css'

const steps = [
  'Tell us what you need',
  'We scope the service',
  'Share documents securely',
  'Receive a quotation',
  'Approve and pay',
  'Track the case in your portal',
]

export function HomePage() {
  const [featured, setFeatured] = useState<Service[]>([])

  useEffect(() => {
    void listServices().then((rows) => setFeatured(rows.filter((s) => s.is_featured).slice(0, 4)))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden />
        <div className="container hero-copy">
          <p className="brand-hero">TaxLegalPro</p>
          <h1>Your Business, Tax &amp; Compliance — Managed in One Place.</h1>
          <p className="hero-sub">
            Manage essential tax, business registration, compliance, and professional service
            requirements through one organized platform.
          </p>
          <div className="row hero-cta">
            <Link to="/services">
              <Button variant="secondary">Explore Services</Button>
            </Link>
            <Link to="/consultation">
              <Button variant="ghost">Book a Consultation</Button>
            </Link>
            <Link to="/login" className="hero-login">
              Client Login
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Services</p>
            <h2>Tax, registration, compliance, and legal support</h2>
            <p>Featured offerings from the service catalog.</p>
          </div>
          <div className="grid-2">
            {featured.map((s) => (
              <Link key={s.id} to={`/services/${s.slug}`} className="service-tile">
                <Badge tone="brass">{s.category}</Badge>
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
                <strong>{formatPkr(s.base_price)}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>From enquiry to a tracked service case</h2>
          </div>
          <ol className="steps">
            {steps.map((step, i) => (
              <li key={step}>
                <span>{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <div>
            <h2>Ready to get started?</h2>
            <p>Talk to the desk or open a client account to track work and documents.</p>
          </div>
          <div className="row">
            <Link to="/contact">
              <Button>Contact us</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Create account</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
