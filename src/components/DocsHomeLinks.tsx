import type { ReactNode } from 'react'
import { Link } from 'waku'
import { button } from '../styles/controls'

/** A secondary (gray) button that opens a guide from the home 3-up. */
export function HomeGuideButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link to={href} {...button({ variant: 'default', className: 'tempo-docs-home-guide-button' })}>
      {children}
    </Link>
  )
}
