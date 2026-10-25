import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Input'
import { useAuth } from '@/lib/auth'

function AuthShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 440 }}>
        <p className="eyebrow">Account</p>
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  )
}

export function LoginPage() {
  const { signIn, user, isStaff, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (!loading && user) {
    return <Navigate to={isStaff ? '/app' : '/portal'} replace />
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await signIn(String(fd.get('email')), String(fd.get('password')))
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/portal')
  }

  return (
    <AuthShell title="Client login">
      {!configured ? (
        <div className="alert alert-warn" style={{ marginBottom: '1rem' }}>
          Configure Supabase env vars to enable authentication.
        </div>
      ) : null}
      <form className="stack" onSubmit={(e) => void onSubmit(e)}>
        <TextField label="Email" name="email" type="email" required autoComplete="email" />
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <Button type="submit" disabled={pending || !configured}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/forgot-password">Forgot password</Link> · <Link to="/register">Create account</Link>
      </p>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { signUp, user, configured } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (user) return <Navigate to="/portal" replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)
    const fd = new FormData(e.currentTarget)
    const result = await signUp(
      String(fd.get('email')),
      String(fd.get('password')),
      String(fd.get('full_name')),
    )
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setMessage('Check your email to confirm the account if confirmation is enabled.')
    navigate('/portal')
  }

  return (
    <AuthShell title="Create account">
      <form className="stack" onSubmit={(e) => void onSubmit(e)}>
        <TextField label="Full name" name="full_name" required />
        <TextField label="Email" name="email" type="email" required />
        <TextField label="Password" name="password" type="password" required minLength={8} />
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {message ? <div className="alert">{message}</div> : null}
        <Button type="submit" disabled={pending || !configured}>
          Register
        </Button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password">
      <p className="muted">
        Password reset uses Supabase Auth email recovery. Wire the project SMTP settings, then call{' '}
        <code>resetPasswordForEmail</code> from this form in a follow-up slice.
      </p>
      <Link to="/login">Back to login</Link>
    </AuthShell>
  )
}
