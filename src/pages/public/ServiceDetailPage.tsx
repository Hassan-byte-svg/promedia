import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPkr } from '@/data/catalog'
import { getServiceBySlug } from '@/lib/servicesApi'
import type { Service } from '@/types/database'

export function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const [service, setService] = useState<Service | null>(null)

  useEffect(() => {
    void getServiceBySlug(slug).then(setService)
  }, [slug])

  if (!service) {
    return (
      <section className="section">
        <div className="container">
          <h1>Service not found</h1>
          <Link to="/services">Back to services</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <Badge tone="brass">{service.category}</Badge>
        <h1 style={{ marginTop: '0.75rem' }}>{service.name}</h1>
        <p>{service.summary}</p>
        {service.description ? <p>{service.description}</p> : null}
        <p>
          <strong>{formatPkr(service.base_price)}</strong>
          <span className="muted"> starting guide price</span>
        </p>
        <div className="row">
          <Link to={`/consultation?service=${service.slug}`}>
            <Button variant="secondary">Request this service</Button>
          </Link>
          <Link to="/services">
            <Button variant="ghost">All services</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
