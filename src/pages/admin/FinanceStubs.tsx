import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function ExpensesPage() {
  return (
    <div className="fin-panel stack">
      <p className="muted" style={{ marginTop: 0 }}>
        Vendor bills and expense claims will post through AP and the journal when the bills schema
        lands. No sample vendor spend is shown.
      </p>
      <div className="module-stub">
        <strong>Coming next:</strong> vendor bill CRUD, bill→journal posting, allocation to cases.
      </div>
      <div className="row">
        <Link to="/app/journals">
          <Button className="btn-teal" size="sm">
            Use journals meanwhile
          </Button>
        </Link>
        <Link to="/app/payments">
          <Button variant="ghost" size="sm">
            Payments
          </Button>
        </Link>
      </div>
    </div>
  )
}

export function FixedAssetsPage() {
  return (
    <div className="fin-panel stack">
      <p className="muted" style={{ marginTop: 0 }}>
        Fixed asset register, categories, and monthly depreciation drafts — stub only. Depreciation
        will create balanced journals (never silent).
      </p>
      <div className="module-stub">Empty register. Add schema + UI in a follow-up migration.</div>
    </div>
  )
}

export function BudgetsPage() {
  return (
    <div className="fin-panel stack">
      <p className="muted" style={{ marginTop: 0 }}>
        Budget envelopes by account/period. Stub — no invented targets.
      </p>
      <div className="module-stub">No budgets defined yet.</div>
    </div>
  )
}

export function ReportsPage() {
  return (
    <div className="fin-panel stack">
      <p className="muted" style={{ marginTop: 0 }}>
        Trial balance, P&amp;L, and compliance exports will read posted journals and invoices only.
      </p>
      <div className="module-stub">
        Export buttons intentionally disabled until report queries are implemented against posted
        data.
      </div>
      <Link to="/app/journals">
        <Button className="btn-teal" size="sm">
          Review journals
        </Button>
      </Link>
    </div>
  )
}
