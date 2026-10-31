import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicMediaStrip } from '@/components/PublicMediaStrip'
import { FALLBACK_SERVICES, formatPkr } from '@/data/catalog'
import { listServices } from '@/lib/servicesApi'
import type { Service } from '@/types/database'
import { useReveal } from '@/hooks/useReveal'

export function ServicesPage() {
  useReveal()
  const [rows, setRows] = useState<Service[]>(FALLBACK_SERVICES)

  useEffect(() => {
    void listServices().then((list) => {
      if (list.length) setRows(list)
    })
  }, [])

  return (
    <>
      <section className="page-hero">
        <h1 className="reveal">Service catalog</h1>
        <p className="lead reveal reveal-delay-1">
          Catalog starting prices for Pakistani tax, registration, compliance, and legal matters.
          Government charges are quoted separately.
        </p>
      </section>
      <section className="svc-page" style={{ paddingTop: 0 }}>
        <div>
          {rows.map((s) => (
            <Link key={s.id} to={`/services/${s.slug}`} className="svc-row reveal">
              <h2>
                {s.name}
                <span className="svc-cat"> · {s.category}</span>
              </h2>
              <p className="sum">
                {s.summary} Starting at {formatPkr(s.base_price)}.
              </p>
            </Link>
          ))}
        </div>
      </section>
      <PublicMediaStrip />
    </>
  )
}
