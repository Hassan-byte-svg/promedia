import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function RequireAuth({
  children,
  staffOnly = false,
}: {
  children: React.ReactNode
  staffOnly?: boolean
}) {
  const { user, loading, isStaff, configured } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container section">
        <p>Loading session…</p>
      </div>
    )
  }

  // Allow shell previews when Supabase is not wired yet (local/demo only).
  if (!configured) {
    return children
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (staffOnly && !isStaff) {
    return <Navigate to="/portal" replace />
  }

  return children
}
