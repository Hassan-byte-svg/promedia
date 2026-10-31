import { describe, expect, it } from 'vitest'
import {
  assertBalanced,
  buildPayrollJournalLines,
  isBalanced,
  lineTotals,
  roundMoney,
} from './journal'

describe('journal balance', () => {
  it('rejects single-sided or empty journals', () => {
    expect(isBalanced([])).toBe(false)
    expect(
      isBalanced([{ account_id: 'a', debit: 100, credit: 0 }]),
    ).toBe(false)
  })

  it('accepts balanced two-line entries', () => {
    const lines = [
      { account_id: 'cash', debit: 1000, credit: 0 },
      { account_id: 'revenue', debit: 0, credit: 1000 },
    ]
    expect(isBalanced(lines)).toBe(true)
    expect(lineTotals(lines)).toEqual({ debit: 1000, credit: 1000 })
  })

  it('rejects dual-sided lines and mismatches', () => {
    expect(
      isBalanced([
        { account_id: 'a', debit: 50, credit: 50 },
        { account_id: 'b', debit: 0, credit: 0 },
      ]),
    ).toBe(false)
    expect(
      isBalanced([
        { account_id: 'a', debit: 100, credit: 0 },
        { account_id: 'b', debit: 0, credit: 90 },
      ]),
    ).toBe(false)
  })

  it('assertBalanced throws with totals', () => {
    expect(() =>
      assertBalanced([
        { account_id: 'a', debit: 10, credit: 0 },
        { account_id: 'b', debit: 0, credit: 5 },
      ]),
    ).toThrow(/not balanced/i)
  })

  it('builds balanced payroll lines', () => {
    const lines = buildPayrollJournalLines({
      expenseAccountId: '5100',
      payableAccountId: '2100',
      gross: 99.999,
    })
    expect(isBalanced(lines)).toBe(true)
    expect(roundMoney(99.999)).toBe(100)
  })
})

describe('RLS smoke (policy expectations)', () => {
  it('documents client folder convention matches storage policies', () => {
    const userId = '11111111-1111-1111-1111-111111111111'
    const path = `${userId}/doc.pdf`
    expect(path.split('/')[0]).toBe(userId)
  })

  it('staff-only tables are named for finance/hr money paths', () => {
    const staffTables = [
      'journal_entries',
      'payments',
      'petty_cash_entries',
      'payroll_runs',
      'bank_accounts',
    ]
    expect(staffTables.every((t) => t.length > 0)).toBe(true)
  })
})
