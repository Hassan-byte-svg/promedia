import { isSupabaseConfigured } from '@/lib/supabase'

export function SetupBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div className="setup-banner" role="status">
      Supabase env vars are not set. UI runs locally; auth and data APIs activate after you add{' '}
      <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see <code>.env.example</code>
      ) and apply <code>supabase/migrations</code>.
    </div>
  )
}
