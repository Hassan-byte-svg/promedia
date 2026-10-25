import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/** Untyped client for tables added after the initial typed schema. */
export function sb(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase as unknown as SupabaseClient
}

export function sbOrNull(): SupabaseClient | null {
  return supabase ? (supabase as unknown as SupabaseClient) : null
}
