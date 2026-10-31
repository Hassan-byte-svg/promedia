import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FALLBACK_SERVICES, formatPkr } from '@/data/catalog'
import { listServices } from '@/lib/servicesApi'
import type { Service } from '@/types/database'
import { useReveal } from '@/hooks/useReveal'

type ChipKey = 'weight' | 'tracking' | 'case'

const HOW = [
  {
    clause: 'First it lands here.',
    title: 'New enquiry',
    meta: 'Open',
    owner: '—',
    due: '—',
    ticks: [
      { on: false, label: 'Scope captured' },
      { on: false, label: 'Documents requested' },
      { on: false, label: 'Quote issued' },
    ],
    figure: null as string | null,
  },
  {
    clause: 'Then someone takes it.',
    title: 'NTN registration',
    meta: 'Assigned',
    owner: 'Desk',
    due: '5 days',
    ticks: [
      { on: true, label: 'Scope captured' },
      { on: false, label: 'Documents requested' },
      { on: false, label: 'Quote issued' },
    ],
    figure: null,
  },
  {
    clause: 'Work moves in the portal.',
    title: 'NTN registration',
    meta: 'In progress',
    owner: 'Desk',
    due: '3 days',
    ticks: [
      { on: true, label: 'Scope captured' },
      { on: true, label: 'Documents requested' },
      { on: false, label: 'Quote issued' },
    ],
    figure: null,
  },
  {
    clause: 'Then it closes with a figure.',
    title: 'NTN registration',
    meta: 'Quoted',
    owner: 'Desk',
    due: 'Done',
    ticks: [
      { on: true, label: 'Scope captured' },
      { on: true, label: 'Documents requested' },
      { on: true, label: 'Quote issued' },
    ],
    figure: formatPkr(5000),
  },
]

const FEATURES = [
  {
    sentence: 'Browse the service catalog.',
    consequence: 'Starting fees from the catalog. Government charges quoted separately.',
    on: true,
  },
  {
    sentence: 'Open a case from enquiry.',
    consequence: 'Leads become tracked matters with owners and due dates.',
    on: true,
  },
  {
    sentence: 'Share documents on signed links.',
    consequence: 'Private storage with short-lived downloads, never permanent public URLs.',
    on: false,
  },
  {
    sentence: 'Approve a quote before work.',
    consequence: 'Scope and professional fees are confirmed before filing begins.',
    on: false,
  },
  {
    sentence: 'Follow filings in the portal.',
    consequence: 'Status, invoices, and acknowledgments live in one desk.',
    on: false,
  },
]

export function HomePage() {
  useReveal()
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES)
  const [weight, setWeight] = useState(600)
  const [tracking, setTracking] = useState(-0.04)
  const [upper, setUpper] = useState(false)
  const [drag, setDrag] = useState<ChipKey | null>(null)
  const [featOn, setFeatOn] = useState(FEATURES.map((f) => f.on))
  const [plan, setPlan] = useState(1)
  const [workspace, setWorkspace] = useState('Ahmad Traders')
  const [kind, setKind] = useState<'individual' | 'business'>('business')

  useEffect(() => {
    void listServices().then((rows) => {
      if (rows.length) setServices(rows)
    })
  }, [])

  const plans = useMemo(() => {
    const featured = services.filter((s) => s.is_featured).slice(0, 3)
    const pool = featured.length >= 3 ? featured : services.slice(0, 3)
    return pool.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.base_price,
      blurb: s.summary,
      slug: s.slug,
    }))
  }, [services])

  const selected = plans[plan] ?? plans[0]

  useEffect(() => {
    if (!drag) return
    const onMove = (e: PointerEvent) => {
      const dx = e.movementX
      if (drag === 'weight') setWeight((w) => Math.min(700, Math.max(400, w + dx * 0.8)))
      if (drag === 'tracking') setTracking((t) => Math.min(0.04, Math.max(-0.08, t + dx * 0.0004)))
    }
    const onUp = () => setDrag(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag])

  function onCreate(e: FormEvent) {
    e.preventDefault()
    const q = new URLSearchParams({
      name: workspace.trim() || 'Client',
      kind,
    })
    navigate(`/register?${q.toString()}`)
  }

  return (
    <>
      <section className="hero-poster" aria-label="TaxLegalPro">
        <div className="hero-poster-bar">
          <span>TaxLegalPro</span>
          <Link to="/consultation">Book a consultation</Link>
        </div>
        <div className="hero-poster-stage">
          <h1
            className="hero-sentence"
            style={{
              fontWeight: weight,
              letterSpacing: `${tracking}em`,
              textTransform: upper ? 'uppercase' : 'none',
              fontVariationSettings: `"wght" ${Math.round(weight)}`,
            }}
          >
            <span className="line">
              <span>Tax work,</span>
            </span>
            <span className="line">
              <span>tracked.</span>
            </span>
          </h1>

          <div className="hero-chips" aria-hidden={false}>
            <button
              type="button"
              className="hero-chip"
              data-ui
              data-pos="a"
              aria-label="Adjust headline weight"
              onPointerDown={() => setDrag('weight')}
            >
              <label>Weight</label>
              <strong>{Math.round(weight)}</strong>
            </button>
            <button
              type="button"
              className="hero-chip"
              data-ui
              data-pos="b"
              aria-label="Adjust letter spacing"
              onPointerDown={() => setDrag('tracking')}
            >
              <label>Tracking</label>
              <strong>{tracking.toFixed(3)}</strong>
            </button>
            <button
              type="button"
              className="hero-chip"
              data-ui
              data-pos="c"
              aria-label="Toggle uppercase"
              aria-pressed={upper}
              onClick={() => setUpper((v) => !v)}
            >
              <label>Case</label>
              <strong>{upper ? 'Upper' : 'Sentence'}</strong>
            </button>
          </div>

          <p className="hero-support">
            Pakistani tax, corporate registration, and compliance. One desk with a client portal for
            documents, quotes, and filings.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="hero-btn">
              Explore services
            </Link>
            <Link to="/consultation" className="hero-btn-ghost">
              Book a consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="how-fields" aria-label="How it works">
        {HOW.map((step, i) => (
          <div key={step.clause} className="how-field reveal">
            {i === 0 ? <h2>How a matter moves</h2> : <span aria-hidden />}
            <div className="how-card" data-ui>
              <header>
                <span>{step.meta}</span>
                <span>
                  {step.owner} · {step.due}
                </span>
              </header>
              <h3>{step.title}</h3>
              <ul>
                {step.ticks.map((t) => (
                  <li key={t.label}>
                    <span className={`tick ${t.on ? 'on' : ''}`} aria-hidden />
                    <span>{t.label}</span>
                  </li>
                ))}
              </ul>
              {step.figure ? (
                <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>{step.figure}</p>
              ) : null}
            </div>
            <p className="how-clause">{step.clause}</p>
          </div>
        ))}
      </section>

      <section aria-label="What the desk does">
        {FEATURES.map((f, i) => (
          <div key={f.sentence} className={`feat-band ${featOn[i] ? 'is-on' : ''}`}>
            <div className="feat-copy">
              <p className="feat-sentence">{f.sentence}</p>
              <p className="feat-consequence">{f.consequence}</p>
            </div>
            <div className="feat-toggle-wrap">
              <button
                type="button"
                className="ui-toggle"
                data-ui
                role="switch"
                aria-checked={featOn[i]}
                aria-label={f.sentence}
                onClick={() =>
                  setFeatOn((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setFeatOn((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                  }
                }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="place-band reveal" aria-label="Where we work">
        <div className="place-media">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/taste/city-street-poster.jpg"
            width={854}
            height={480}
            aria-label="Street traffic as a muted loop"
          >
            <source src="/taste/city-street.webm" type="video/webm" />
          </video>
        </div>
        <div className="place-copy">
          <h2>Three cities. One desk.</h2>
          <p>
            A Pakistan desk for registrations, returns, and statutory filings — not a generic
            overseas template. Presence across the three cities where most of the work concentrates.
          </p>
          <p className="place-credits">
            Street footage: “Traffic on a cobbled street - soundscape” by Sounds of Changes, CC BY
            3.0.
          </p>
        </div>
      </section>

      <section className="price-index" aria-label="Pricing">
        <div className="price-names">
          {plans.map((p, i) => (
            <div key={p.id}>
              <button
                type="button"
                className={`price-name ${i === plan ? 'is-selected' : ''}`}
                onClick={() => setPlan(i)}
                onFocus={() => setPlan(i)}
              >
                <span className="dot" aria-hidden />
                {p.name}
              </button>
              <div className={`price-mobile-stage ${i === plan ? 'is-open' : ''}`}>
                <div className="price-figure">{formatPkr(p.price)}</div>
                <p className="price-blurb">Starting guide price. {p.blurb}</p>
              </div>
            </div>
          ))}
        </div>
        {selected ? (
          <div className="price-stage reveal">
            <div className="price-figure">{formatPkr(selected.price)}</div>
            <p className="price-blurb">
              Starting guide price. {selected.blurb} Government fees are quoted separately.
            </p>
            <Link className="price-action" to={`/services/${selected.slug}`}>
              Open {selected.name}
            </Link>
          </div>
        ) : null}
      </section>

      <section className="gallery-strip" aria-label="Places around the work">
        <figure className="reveal">
          <img
            src="/taste/lahore-badshahi.jpg"
            width={1920}
            height={1280}
            alt="Badshahi Mosque courtyard and prayer hall, Lahore"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure className="reveal reveal-delay-1">
          <img
            src="/taste/islamabad-faisal.jpg"
            width={1920}
            height={1336}
            alt="Faisal Mosque under a clear sky, Islamabad"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <figure className="reveal reveal-delay-2">
          <img
            src="/taste/karachi-harbour-chart.jpg"
            width={1920}
            height={2866}
            alt="Historical Admiralty chart of Karachi Harbour, 1906 to 1918"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      <section className="cta-open" aria-label="Get started">
        <div className="cta-copy">
          <h2>Start here</h2>
          <p>Create a client account. Documents, quotes, and case status stay in one place.</p>
        </div>
        <form className="cta-dialog" data-ui onSubmit={onCreate}>
          <h3>Name your workspace</h3>
          <label htmlFor="ws-name">Client or business name</label>
          <input
            id="ws-name"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            autoComplete="organization"
          />
          <div className="cta-seg" role="group" aria-label="Account type">
            <button
              type="button"
              className={kind === 'individual' ? 'is-on' : ''}
              onClick={() => setKind('individual')}
            >
              Individual
            </button>
            <button
              type="button"
              className={kind === 'business' ? 'is-on' : ''}
              onClick={() => setKind('business')}
            >
              Business
            </button>
          </div>
          <button type="submit" className="primary">
            Continue to register
          </button>
        </form>
      </section>
    </>
  )
}
