import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LeadForm } from '@/components/LeadForm'

function Page({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="section-head">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        {children}
      </div>
    </section>
  )
}

export function AboutPage() {
  return (
    <Page eyebrow="About" title="A desk for tax, corporate, and compliance work">
      <p>
        TaxLegalPro helps individuals and businesses organise registrations, filings, and
        professional services through one platform — with a client portal for documents, cases, and
        invoices.
      </p>
      <p className="muted">Presence: Lahore · Karachi · Islamabad. Hours published on the contact page.</p>
    </Page>
  )
}

export function ContactPage() {
  return (
    <Page eyebrow="Contact" title="Talk to the desk">
      <p>Share your requirement and we will follow up with next steps.</p>
      <LeadForm source="contact" />
    </Page>
  )
}

export function ConsultationPage() {
  return (
    <Page eyebrow="Consultation" title="Book a consultation">
      <p>Tell us what you need. We will confirm timing and documents required.</p>
      <LeadForm source="consultation" />
    </Page>
  )
}

export function FaqPage() {
  const faqs = [
    ['Do I need an account to browse services?', 'No. Public pages are open. An account is required for the client portal.'],
    ['How are prices finalised?', 'Catalog prices are starting guides. Quotes reflect scope and filings.'],
    ['Where are documents stored?', 'Client documents use private storage with signed access once Supabase is connected.'],
  ] as const
  return (
    <Page eyebrow="FAQ" title="Frequently asked questions">
      <div className="stack">
        {faqs.map(([q, a]) => (
          <div key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </div>
    </Page>
  )
}

export function ResourcesPage() {
  return (
    <Page eyebrow="Resources" title="Guides and calculators">
      <p>Practical resources for Pakistani tax and business workflows.</p>
      <ul>
        <li>
          <Link to="/faq">FAQ</Link>
        </li>
        <li>
          <Link to="/services">Service catalog</Link>
        </li>
        <li>
          <Link to="/consultation">Book a consultation</Link>
        </li>
      </ul>
    </Page>
  )
}

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'refund' }) {
  const title =
    kind === 'privacy' ? 'Privacy policy' : kind === 'terms' ? 'Terms of use' : 'Refund policy'
  return (
    <Page eyebrow="Legal" title={title}>
      <p>
        This is a working policy stub for the TaxLegalPro platform. Replace with counsel-reviewed
        text before production launch. We do not invent customer-facing legal claims.
      </p>
    </Page>
  )
}

export function NotFoundPage() {
  return (
    <Page eyebrow="404" title="Page not found">
      <p>
        <Link to="/">Return home</Link>
      </p>
    </Page>
  )
}
