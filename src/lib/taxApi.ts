import { sbOrNull } from '@/lib/sb'

const FILING_FLOW = [
  'draft',
  'in_review',
  'ready_to_file',
  'submitted',
  'acknowledged',
  'rejected',
] as const

export type FilingStatus = (typeof FILING_FLOW)[number]

export async function listTaxDeadlines() {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('tax_deadlines').select('*').order('due_date')
  return data ?? []
}

export async function createTaxDeadline(input: {
  title: string
  due_date: string
  tax_year?: string
  category?: string
  notes?: string
}) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { data, error } = await client
    .from('tax_deadlines')
    .insert({
      title: input.title,
      due_date: input.due_date,
      tax_year: input.tax_year ?? null,
      category: input.category ?? 'filing',
      notes: input.notes ?? null,
      status: 'upcoming',
    })
    .select('id')
    .single()
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, id: (data as { id: string }).id }
}

export async function listTaxFilings() {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('tax_filings').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function createTaxFiling(input: {
  tax_year: string
  filing_type?: string
  tax_profile_id?: string | null
  deadline_id?: string | null
  notes?: string
}) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { data, error } = await client
    .from('tax_filings')
    .insert({
      tax_year: input.tax_year,
      filing_type: input.filing_type ?? 'income_tax_return',
      tax_profile_id: input.tax_profile_id ?? null,
      deadline_id: input.deadline_id ?? null,
      notes: input.notes ?? null,
      status: 'draft',
    })
    .select('id')
    .single()
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, id: (data as { id: string }).id }
}

export async function advanceFilingStatus(
  id: string,
  status: FilingStatus,
  acknowledgment_ref?: string | null,
) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }

  if (status === 'acknowledged' && !acknowledgment_ref?.trim()) {
    return {
      ok: false as const,
      error: 'Acknowledgment requires a real reference from FBR — do not fabricate success.',
    }
  }

  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'submitted') patch.submitted_at = new Date().toISOString()
  if (status === 'acknowledged') patch.acknowledgment_ref = acknowledgment_ref

  const { error } = await client.from('tax_filings').update(patch).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}
