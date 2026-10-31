import { isSupabaseConfigured } from '@/lib/supabase'

export function SetupBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div className="setup-banner" role="status">
      Local mode: add Supabase URL and anon key from .env.example, then apply migrations, to enable
      auth and data APIs.
    </div>
  )
}
