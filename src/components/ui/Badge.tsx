import type { ReactNode } from 'react'
import './ui.css'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'good' | 'warn' | 'brass'
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
