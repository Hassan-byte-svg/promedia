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
    ['How are prices finalised?', 'Catalog prices are starting guides. Quotes reflect scope, filings, and government charges quoted separately.'],
    ['Where are documents stored?', 'Client documents use a private Supabase Storage bucket with short-lived signed download URLs — never public permanent links.'],
    ['What tax years do you support?', 'We track deadlines and filing cases per tax year. Acknowledgment is recorded only when you provide a real FBR reference.'],
    ['Can staff see my portal data?', 'Yes, authorised staff can assist on your matters. Row Level Security keeps other clients from reading your records.'],
    ['How do I book a consultation?', 'Use Book a Consultation or Contact — enquiries create CRM leads for the desk.'],
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
  const body =
    kind === 'privacy'
      ? [
          'TaxLegalPro processes account, service, and document data to deliver professional services.',
          'Access is role-restricted. Client documents are stored privately and shared via signed links.',
          'Contact hello@taxlegalpro.pk for data requests. Replace this stub with counsel-reviewed language before launch.',
        ]
      : kind === 'terms'
        ? [
            'Public site content is informational. Engagement letters and quotations govern paid work.',
            'Government fees are separate from professional fees and are disclosed when known.',
            'Replace this stub with counsel-reviewed terms before production launch.',
          ]
        : [
            'Refund eligibility depends on the engagement letter and work already performed.',
            'Government charges and third-party fees are generally non-refundable once paid.',
            'Replace this stub with counsel-reviewed refund policy before launch.',
          ]
  return (
    <Page eyebrow="Legal" title={title}>
      {body.map((p) => (
        <p key={p}>{p}</p>
      ))}
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
