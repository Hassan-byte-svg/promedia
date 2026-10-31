import type { ReactNode } from 'react'
import './ui.css'

/** Interactive or dense data surfaces only — not decorative wrappers. */
export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'section'
}) {
  return <Tag className={`card ${className}`.trim()}>{children}</Tag>
}
