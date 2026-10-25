import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { formatPkr } from '@/data/catalog'
import { listServices } from '@/lib/servicesApi'
import type { Service } from '@/types/database'

export function ServicesPage() {
  const [rows, setRows] = useState<Service[]>([])

  useEffect(() => {
    void listServices().then(setRows)
  }, [])

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Catalog</p>
          <h1>Services</h1>
          <p>Browse tax, registration, compliance, and legal services.</p>
        </div>
        <div className="grid-3">
          {rows.map((s) => (
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
  )
}
