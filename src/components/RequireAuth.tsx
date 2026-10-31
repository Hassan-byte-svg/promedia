import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function RequireAuth({
  children,
  staffOnly = false,
}: {
  children: React.ReactNode
  staffOnly?: boolean
}) {
  const { user, loading, isStaff, configured, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container section">
        <p>Loading session…</p>
      </div>
    )
  }

  // Local demo: shells visible without Supabase so UI can be reviewed.
  // When configured, enforce Auth + RBAC strictly.
  if (!configured) {
    return children
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (staffOnly) {
    // Wait for profile when session exists — avoid flashing client into admin.
    if (!profile) {
      return (
        <div className="container section">
          <p>Checking permissions…</p>
        </div>
      )
    }
    if (!isStaff) {
      return <Navigate to="/portal" replace />
    }
  }

  return children
}
