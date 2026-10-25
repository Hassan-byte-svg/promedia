import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPkr } from '@/data/catalog'
import { listServices } from '@/lib/servicesApi'
import type { Service } from '@/types/database'

export function PricingPage() {
  const [rows, setRows] = useState<Service[]>([])
  useEffect(() => {
    void listServices().then(setRows)
  }, [])

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h1>Transparent starting prices</h1>
          <p>Final quotes depend on scope, filings, and complexity.</p>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/services/${s.slug}`}>{s.name}</Link>
                  </td>
                  <td>{s.category}</td>
                  <td>{formatPkr(s.base_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
