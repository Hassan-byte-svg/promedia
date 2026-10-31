import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/Input'
import { createLead } from '@/lib/servicesApi'

export function LeadForm({ source }: { source: string }) {
  const [params] = useSearchParams()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setMessage(null)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await createLead({
      full_name: String(fd.get('full_name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || '') || null,
      company: String(fd.get('company') || '') || null,
      service_interest: String(fd.get('service_interest') || params.get('service') || '') || null,
      notes: String(fd.get('notes') || '') || null,
      source,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMessage('Thanks — your enquiry was recorded.')
    e.currentTarget.reset()
  }

  return (
    <form className="stack" onSubmit={(e) => void onSubmit(e)} style={{ maxWidth: 560 }}>
      <TextField label="Full name" name="full_name" required />
      <TextField label="Email" name="email" type="email" required />
      <TextField label="Phone" name="phone" />
      <TextField label="Company" name="company" />
      <TextField
        label="Service interest"
        name="service_interest"
        defaultValue={params.get('service') ?? ''}
      />
      <TextAreaField label="Notes" name="notes" />
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {message ? <div className="alert">{message}</div> : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Submit'}
      </Button>
    </form>
  )
}
