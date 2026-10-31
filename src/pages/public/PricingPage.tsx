import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicMediaStrip } from '@/components/PublicMediaStrip'
import { FALLBACK_SERVICES, formatPkr } from '@/data/catalog'
import { listServices } from '@/lib/servicesApi'
import type { Service } from '@/types/database'
import { useReveal } from '@/hooks/useReveal'

export function PricingPage() {
  useReveal()
  const [rows, setRows] = useState<Service[]>(FALLBACK_SERVICES)
  const [plan, setPlan] = useState(1)

  useEffect(() => {
    void listServices().then((list) => {
      if (list.length) setRows(list)
    })
  }, [])

  const plans = useMemo(() => {
    const featured = rows.filter((s) => s.is_featured)
    const pool = featured.length >= 3 ? featured.slice(0, 4) : rows.slice(0, 4)
    return pool
  }, [rows])

  const selected = plans[plan] ?? plans[0]

  return (
    <>
      <section className="page-hero">
        <h1 className="reveal">Pricing for the desk</h1>
        <p className="lead reveal reveal-delay-1">
          Starting guide prices from the catalog. Final quotes depend on scope.
        </p>
      </section>
      <section className="price-index" aria-label="Pricing" style={{ paddingTop: 0 }}>
        <div className="price-names">
          {plans.map((p, i) => (
            <div key={p.id} className={`reveal reveal-delay-${(i % 3) + 1}`}>
              <button
                type="button"
                className={`price-name ${i === plan ? 'is-selected' : ''}`}
                onClick={() => setPlan(i)}
                onFocus={() => setPlan(i)}
              >
                <span className="dot" aria-hidden />
                {p.name}
              </button>
              <div className="price-mobile-stage">
                <div className="price-figure">{formatPkr(p.base_price)}</div>
                <p className="price-blurb">Starting guide price. {p.summary}</p>
              </div>
            </div>
          ))}
        </div>
        {selected ? (
          <div className="price-stage reveal">
            <div className="price-figure">{formatPkr(selected.base_price)}</div>
            <p className="price-blurb">
              Starting guide price. {selected.summary} Government charges are quoted separately.
            </p>
            <Link className="price-action" to={`/services/${selected.slug}`}>
              View service
            </Link>
          </div>
        ) : null}
      </section>
      <PublicMediaStrip start={1} />
    </>
  )
}
