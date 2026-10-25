import { FALLBACK_SERVICES } from '@/data/catalog'
import { supabase } from '@/lib/supabase'
import type { Database, Lead, Service, ServiceCase } from '@/types/database'

export async function listServices(): Promise<Service[]> {
  if (!supabase) return FALLBACK_SERVICES as unknown as Service[]
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error || !data?.length) return FALLBACK_SERVICES as unknown as Service[]
  return data
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const all = await listServices()
  return all.find((s) => s.slug === slug) ?? null
}

export async function createLead(
  input: Pick<
    Lead,
    'full_name' | 'email' | 'phone' | 'company' | 'service_interest' | 'notes' | 'source'
  >,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase is not configured. Lead was not stored. Add env vars and re-submit.',
    }
  }
  const { error } = await supabase.from('leads').insert({
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    service_interest: input.service_interest,
    notes: input.notes,
    source: input.source ?? 'website',
    status: 'new',
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function listLeads(): Promise<Lead[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.warn(error.message)
    return []
  }
  return data ?? []
}

export async function listCases(): Promise<ServiceCase[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('service_cases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.warn(error.message)
    return []
  }
  return data ?? []
}

export async function listAccounts(): Promise<Database['public']['Tables']['chart_of_accounts']['Row'][]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .order('code')
  if (error) {
    console.warn(error.message)
    return []
  }
  return data ?? []
}

export async function listEmployees(): Promise<Database['public']['Tables']['employees']['Row'][]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('employees').select('*').order('full_name')
  if (error) {
    console.warn(error.message)
    return []
  }
  return data ?? []
}

export async function listTaxProfiles(): Promise<Database['public']['Tables']['tax_profiles']['Row'][]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('tax_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn(error.message)
    return []
  }
  return data ?? []
}

export async function listInvoices(): Promise<Database['public']['Tables']['invoices']['Row'][]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.warn(error.message)
    return []
  }
  return data ?? []
}
