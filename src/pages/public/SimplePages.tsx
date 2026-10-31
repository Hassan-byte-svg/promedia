import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LeadForm } from '@/components/LeadForm'
import { PublicMediaStrip } from '@/components/PublicMediaStrip'
import { useReveal } from '@/hooks/useReveal'

const FAQS = [
  {
    q: 'Do I need an account to browse services?',
    a: 'No. Public pages are open. An account is required for the client portal where documents, cases, and invoices live.',
  },
  {
    q: 'How are prices finalised?',
    a: 'Catalog prices are starting guides. Quotes reflect scope, filings, and government charges quoted separately.',
  },
  {
    q: 'Where are documents stored?',
    a: 'Client documents use a private storage bucket with short-lived signed download URLs, never public permanent links.',
  },
  {
    q: 'What tax years do you support?',
    a: 'We track deadlines and filing cases per tax year. Acknowledgment is recorded only when you provide a real FBR reference.',
  },
  {
    q: 'Can staff see my portal data?',
    a: 'Authorised staff can assist on your matters. Row Level Security keeps other clients from reading your records.',
  },
  {
    q: 'How do I book a consultation?',
    a: 'Use Book a consultation or Contact. Enquiries create CRM leads for the desk.',
  },
] as const

function PageShell({ title, children }: { title: string; children: ReactNode }) {
  useReveal()
  return (
    <>
      <section className="page-hero">
        <h1 className="reveal">{title}</h1>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container reveal reveal-delay-1" style={{ maxWidth: 820 }}>
          {children}
        </div>
      </section>
      <PublicMediaStrip start={2} />
    </>
  )
}

export function AboutPage() {
  useReveal()
  return (
    <>
      <section className="page-hero page-hero-split">
        <div>
          <h1 className="reveal">About the TaxLegalPro desk</h1>
          <p className="lead reveal reveal-delay-1">
            Tax, corporate, and compliance work for individuals and businesses in Pakistan.
          </p>
        </div>
        <img
          className="page-hero-img reveal reveal-delay-2"
          src="/taste/lahore-1914.jpg"
          width={1519}
          height={2048}
          alt="Autochrome street scene in Lahore, circa 1914"
        />
      </section>
      <article className="letter reveal" style={{ paddingTop: '4rem' }}>
        <img
          className="letter-portrait"
          src="/taste/lahore-gcu.jpg"
          width={88}
          height={88}
          alt="Government College University facade, Lahore"
          loading="lazy"
          decoding="async"
        />
        <p>
          TaxLegalPro started as a practical response to how messy Pakistani tax and corporate work
          becomes when it lives in email threads and shared drives.
        </p>
        <p>
          We built a desk that keeps registrations, filings, and professional services in one place,
          with a client portal for documents, cases, and invoices.
        </p>
        <p>
          The work is still human: scoping, quoting, filing. The software is there so status is not a
          mystery and so government fees stay <mark>quoted separately</mark> from professional fees.
        </p>
        <p>
          We are present in Lahore, Karachi, and Islamabad. If you have a matter that needs a clear
          next step, write to the desk.
        </p>
        <p className="letter-sign">TaxLegalPro</p>
        <p className="letter-role">Tax, corporate, and compliance desk</p>
      </article>
      <PublicMediaStrip start={3} />
    </>
  )
}

export function ContactPage() {
  useReveal()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
    window.location.href = `/consultation?email=${encodeURIComponent(email.trim())}`
  }

  return (
    <>
      <section className="page-hero page-hero-split">
        <div>
          <h1 className="reveal">Contact the desk</h1>
          <p className="lead reveal reveal-delay-1">Leave an email. We will follow up with next steps.</p>
        </div>
        <img
          className="page-hero-img reveal reveal-delay-2"
          src="/taste/lahore-street.jpg"
          width={1920}
          height={1440}
          alt="A residential street in Lahore"
        />
      </section>
      <section className="contact-solo" style={{ paddingTop: '4rem' }} aria-label="Contact form">
        <form className="contact-field reveal" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            required
            placeholder="you@company.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button type="submit" className="contact-send" aria-label="Continue">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9h11M10 4l5 5-5 5" />
            </svg>
          </button>
        </form>
        <p className="contact-hint reveal reveal-delay-1">
          {sent ? 'Opening the consultation form…' : 'Next: a short form so the desk can scope your matter.'}
        </p>
        <dl className="contact-meta">
          <div className="reveal reveal-delay-1">
            <dt>Email</dt>
            <dd>
              <a href="mailto:hello@taxlegalpro.pk">hello@taxlegalpro.pk</a>
            </dd>
          </div>
          <div className="reveal reveal-delay-2">
            <dt>Phone</dt>
            <dd>Published on confirmed engagements</dd>
          </div>
          <div className="reveal reveal-delay-3">
            <dt>Presence</dt>
            <dd>Lahore · Karachi · Islamabad</dd>
          </div>
        </dl>
      </section>
      <PublicMediaStrip />
    </>
  )
}

export function ConsultationPage() {
  return (
    <PageShell title="Book a consultation">
      <p style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>
        Tell us what you need. We will confirm timing and documents required.
      </p>
      <LeadForm source="consultation" />
    </PageShell>
  )
}

export function FaqPage() {
  const [selected, setSelected] = useState(0)
  useReveal()

  return (
    <>
      <section className="page-hero">
        <h1 className="reveal">FAQ for the TaxLegalPro desk</h1>
        <p className="lead reveal reveal-delay-1">
          Accounts, pricing, documents, and how work moves through the portal.
        </p>
      </section>
      <section className="faq-index" aria-label="FAQ" style={{ paddingTop: 0, minHeight: 'auto' }}>
        <div className="faq-list">
          <p className="faq-label reveal">Questions</p>
          {FAQS.map((item, i) => (
            <div key={item.q} className={`reveal reveal-delay-${(i % 3) + 1}`}>
              <button
                type="button"
                className={`faq-q ${i === selected ? 'is-selected' : ''}`}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
              >
                <span className="dot" aria-hidden />
                {item.q}
              </button>
              <p className="faq-mobile-a">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="faq-pane reveal" aria-live="polite">
          {FAQS[selected]?.a}
        </div>
      </section>
      <PublicMediaStrip start={1} />
    </>
  )
}

export function ResourcesPage() {
  return (
    <PageShell title="Guides and calculators">
      <p style={{ marginBottom: '1rem' }}>Practical resources for Pakistani tax and business workflows.</p>
      <ul className="stack" style={{ listStyle: 'none', padding: 0 }}>
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
    </PageShell>
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
    <PageShell title={title}>
      {body.map((p) => (
        <p key={p} style={{ marginBottom: '1rem' }}>
          {p}
        </p>
      ))}
    </PageShell>
  )
}

export function NotFoundPage() {
  return (
    <PageShell title="Page not found">
      <p>
        <Link to="/">Return home</Link>
      </p>
    </PageShell>
  )
}
