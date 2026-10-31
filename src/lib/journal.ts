/** Pure accounting helpers — unit-tested; used before posting journals. */

export type JournalLineInput = {
  account_id: string
  debit: number
  credit: number
  description?: string | null
}

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function lineTotals(lines: JournalLineInput[]): { debit: number; credit: number } {
  return lines.reduce(
    (acc, line) => ({
      debit: roundMoney(acc.debit + (Number(line.debit) || 0)),
      credit: roundMoney(acc.credit + (Number(line.credit) || 0)),
    }),
    { debit: 0, credit: 0 },
  )
}

export function isBalanced(lines: JournalLineInput[], epsilon = 0.005): boolean {
  if (lines.length < 2) return false
  for (const line of lines) {
    const d = Number(line.debit) || 0
    const c = Number(line.credit) || 0
    if (d < 0 || c < 0) return false
    if (d > 0 && c > 0) return false
    if (!line.account_id) return false
  }
  const { debit, credit } = lineTotals(lines)
  if (debit <= 0) return false
  return Math.abs(debit - credit) <= epsilon
}

export function assertBalanced(lines: JournalLineInput[]): { debit: number; credit: number } {
  const totals = lineTotals(lines)
  if (!isBalanced(lines)) {
    throw new Error(
      `Journal not balanced: debit ${totals.debit} != credit ${totals.credit} (need ≥2 one-sided lines)`,
    )
  }
  return totals
}

export function buildPayrollJournalLines(opts: {
  expenseAccountId: string
  payableAccountId: string
  gross: number
}): JournalLineInput[] {
  const gross = roundMoney(opts.gross)
  return [
    {
      account_id: opts.expenseAccountId,
      debit: gross,
      credit: 0,
      description: 'Payroll gross',
    },
    {
      account_id: opts.payableAccountId,
      debit: 0,
      credit: gross,
      description: 'Salaries payable',
    },
  ]
}
