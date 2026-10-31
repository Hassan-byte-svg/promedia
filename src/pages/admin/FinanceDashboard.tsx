import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPkr } from '@/data/catalog'
import {
  listBankAccounts,
  listJournalEntries,
  listPayments,
  listPettyCashAccounts,
} from '@/lib/financeApi'
import { listInvoices, listTaxProfiles } from '@/lib/servicesApi'
import { listTaxDeadlines, listTaxFilings } from '@/lib/taxApi'
import { isSupabaseConfigured } from '@/lib/supabase'

type Je = {
  id: string
  entry_number: string
  entry_date: string
  memo: string | null
  status: string
  journal_lines?: { debit: number; credit: number }[]
}

function sumLines(entry: Je) {
  const lines = entry.journal_lines ?? []
  return lines.reduce((s, l) => s + Number(l.debit || 0), 0)
}

export function FinanceDashboard() {
  const [banks, setBanks] = useState<Awaited<ReturnType<typeof listBankAccounts>>>([])
  const [petty, setPetty] = useState<Awaited<ReturnType<typeof listPettyCashAccounts>>>([])
  const [invoices, setInvoices] = useState<Awaited<ReturnType<typeof listInvoices>>>([])
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof listPayments>>>([])
  const [journals, setJournals] = useState<Je[]>([])
  const [deadlines, setDeadlines] = useState<Awaited<ReturnType<typeof listTaxDeadlines>>>([])
  const [filings, setFilings] = useState<Awaited<ReturnType<typeof listTaxFilings>>>([])
  const [profiles, setProfiles] = useState<Awaited<ReturnType<typeof listTaxProfiles>>>([])

  useEffect(() => {
    void (async () => {
      const [b, p, inv, pay, je, dl, fl, tp] = await Promise.all([
        listBankAccounts(),
        listPettyCashAccounts(),
        listInvoices(),
        listPayments(),
        listJournalEntries(),
        listTaxDeadlines(),
        listTaxFilings(),
        listTaxProfiles(),
      ])
      setBanks(b)
      setPetty(p)
      setInvoices(inv)
      setPayments(pay)
      setJournals(je as Je[])
      setDeadlines(dl)
      setFilings(fl)
      setProfiles(tp)
    })()
  }, [])

  const cashBank = useMemo(() => {
    const bankSum = banks.reduce((s, a) => s + Number(a.opening_balance || 0), 0)
    const pettySum = petty.reduce((s, a) => s + Number(a.balance || 0), 0)
    return bankSum + pettySum
  }, [banks, petty])

  const arOpen = useMemo(() => {
    return invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'void')
      .reduce((s, i) => s + Number(i.total || 0), 0)
  }, [invoices])

  const paymentsTotal = useMemo(
    () => payments.reduce((s, p) => s + Number(p.amount || 0), 0),
    [payments],
  )

  const drafts = journals.filter((j) => j.status === 'draft').slice(0, 8)
  const openDeadlines = deadlines.filter((d) => {
    const row = d as { status: string }
    return row.status === 'upcoming' || row.status === 'due' || row.status === 'overdue'
  }).length

  const connected = isSupabaseConfigured

  return (
    <>
      {!connected ? (
        <div className="alert alert-warn" style={{ marginBottom: '1rem' }}>
          KPI money figures show <strong>ledger totals from connected data only</strong>. Without
          Supabase they stay at zero — we do not invent balances.
        </div>
      ) : null}

      <div className="kpi-grid">
        <div className="kpi">
          <span>Total cash &amp; bank</span>
          <strong>{formatPkr(cashBank)}</strong>
          <div className="hint">
            {banks.length + petty.length} account{banks.length + petty.length === 1 ? '' : 's'} · opening /
            float balances
          </div>
        </div>
        <div className="kpi">
          <span>Accounts receivable</span>
          <strong>{formatPkr(arOpen)}</strong>
          <div className="hint warn">
            Open invoices (not paid/void) · {invoices.filter((i) => i.status !== 'paid').length} docs
          </div>
        </div>
        <div className="kpi">
          <span>Payments recorded</span>
          <strong>{formatPkr(paymentsTotal)}</strong>
          <div className="hint">{payments.length} receipts in ledger</div>
        </div>
        <div className="kpi">
          <span>Net profit (MTD)</span>
          <strong>—</strong>
          <div className="hint">Placeholder · needs posted P&amp;L from journals</div>
        </div>
        <div className="kpi">
          <span>Tax center load</span>
          <strong>{openDeadlines}</strong>
          <div className="hint warn">
            Open deadlines · {filings.length} filings · {profiles.length} profiles (not a fake FBR
            amount)
          </div>
        </div>
      </div>

      <div className="fin-grid-2">
        <div className="fin-panel">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Cash movement</h3>
            <span className="muted" style={{ fontSize: 14 }}>
              Waiting on journals
            </span>
          </div>
          <p className="empty-note" style={{ marginTop: 0 }}>
            Cash movement by month appears here once posted journals are aggregated. Until then the
            panel stays empty. No invented bars.
          </p>
          <div className="chart-placeholder chart-awaiting">No monthly cash series yet</div>
        </div>
        <div className="fin-panel">
          <h3>Revenue vs expenses</h3>
          <p className="empty-note" style={{ marginTop: 0 }}>
            Needs a posted P&amp;L from the ledger. Figures stay as a dash until then.
          </p>
          <div className="legend-row">
            <span className="swatch" style={{ background: '#1d5fbf' }} /> Revenue{' '}
            <strong style={{ marginLeft: 'auto' }}>—</strong>
          </div>
          <div className="legend-row">
            <span className="swatch" style={{ background: '#8a8a8a' }} /> Expenses{' '}
            <strong style={{ marginLeft: 'auto' }}>—</strong>
          </div>
          <div className="legend-row">
            <span className="swatch" style={{ background: '#141414' }} /> Net{' '}
            <strong style={{ marginLeft: 'auto' }}>—</strong>
          </div>
          <div className="chart-placeholder" style={{ minHeight: 120, marginTop: '0.75rem' }}>
            No posted P&amp;L series yet
          </div>
        </div>
      </div>

      <div className="fin-grid-2">
        <div className="fin-panel">
          <h3>Receivables snapshot</h3>
          {invoices.length === 0 ? (
            <p className="empty-note">No invoices yet. Create billing docs under Invoicing.</p>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 5).map((i) => (
                    <tr key={i.id}>
                      <td>{i.invoice_number}</td>
                      <td>
                        <Badge>{i.status}</Badge>
                      </td>
                      <td>{formatPkr(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="fin-panel">
          <h3>Quick tax summary</h3>
          <div className="legend-row">
            <span>Open deadlines</span>
            <strong style={{ marginLeft: 'auto' }}>{openDeadlines}</strong>
          </div>
          <div className="legend-row">
            <span>Filing cases</span>
            <strong style={{ marginLeft: 'auto' }}>{filings.length}</strong>
          </div>
          <div className="legend-row">
            <span>Tax profiles</span>
            <strong style={{ marginLeft: 'auto' }}>{profiles.length}</strong>
          </div>
          <p className="empty-note">
            No “File with FBR” success claims here — acknowledgments require a real reference in Tax
            Center.
          </p>
          <Link to="/app/tax-compliance">
            <Button className="btn-teal" size="sm">
              Open Tax Center
            </Button>
          </Link>
        </div>
      </div>

      <div className="fin-panel" style={{ marginBottom: '1rem', padding: 0, overflow: 'hidden' }}>
        <div
          className="row"
          style={{ justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Drafts to post</h3>
            <p className="empty-note" style={{ margin: '0.25rem 0 0' }}>
              Journal entries awaiting posting
            </p>
          </div>
          <Link to="/app/journals" className="header-link">
            View journals →
          </Link>
        </div>
        <div className="table-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Entry #</th>
                <th>Date</th>
                <th>Memo</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drafts.length === 0 ? (
                <tr>
                  <td colSpan={5}>No draft journals. Create one under Accounting &amp; Ledger.</td>
                </tr>
              ) : (
                drafts.map((r) => (
                  <tr key={r.id}>
                    <td>{r.entry_number}</td>
                    <td>{r.entry_date}</td>
                    <td>{r.memo ?? '—'}</td>
                    <td>{formatPkr(sumLines(r))}</td>
                    <td>
                      <Badge tone="warn">{r.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fin-panel">
        <h3>Quick actions</h3>
        <div className="quick-actions">
          <Link to="/app/invoices">
            <Button className="btn-teal" size="sm">
              Invoices
            </Button>
          </Link>
          <Link to="/app/expenses">
            <Button variant="ghost" size="sm">
              Record expense
            </Button>
          </Link>
          <Link to="/app/banks">
            <Button variant="ghost" size="sm">
              Bank &amp; cash
            </Button>
          </Link>
          <Link to="/app/journals">
            <Button variant="ghost" size="sm">
              Post journal
            </Button>
          </Link>
          <Link to="/app/tax-compliance">
            <Button variant="ghost" size="sm">
              Tax report / filings
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
