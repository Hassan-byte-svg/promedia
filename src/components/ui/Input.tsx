import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import './ui.css'

interface FieldProps {
  label: string
  hint?: string
  error?: string
}

export function TextField({
  label,
  hint,
  error,
  id,
  ...rest
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? rest.name
  return (
    <label className="field" htmlFor={fieldId}>
      <span className="field-label">{label}</span>
      <input id={fieldId} className="field-control" {...rest} />
      {hint && !error ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}

export function TextAreaField({
  label,
  hint,
  error,
  id,
  ...rest
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId = id ?? rest.name
  return (
    <label className="field" htmlFor={fieldId}>
      <span className="field-label">{label}</span>
      <textarea id={fieldId} className="field-control" rows={4} {...rest} />
      {hint && !error ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}
