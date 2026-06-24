import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  // Kept for API compatibility; no longer used.
  delay?: number
}

// Renders content as-is. The scroll-in fade/lift/blur animation was removed
// site-wide; this remains a passthrough wrapper to preserve existing layout.
export default function Reveal({ children, className }: Props) {
  return <div className={className}>{children}</div>
}
