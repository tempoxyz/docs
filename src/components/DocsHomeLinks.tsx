import type { ReactNode } from 'react'
import { Link } from 'waku'
import { button } from '../styles/controls'

/** An L2 color link for the home reference lists (styles in styles/links.ts). */
export function HomeColorLink({ href, children }: { href: string; children: ReactNode }) {
  if (/^(?:[a-z]+:)?\/\//i.test(href))
    return (
      <a className="tempo-color-link" href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  return (
    <Link to={href} className="tempo-color-link">
      {children}
    </Link>
  )
}

/** A secondary (gray) "Get started" button under a guide in the home 3-up. The
 * guide's name is the column heading, so the accessible name carries it too. */
export function HomeGuideButton({ href, guide }: { href: string; guide: string }) {
  return (
    <Link
      to={href}
      aria-label={`Get started: ${guide}`}
      {...button({ variant: 'default', className: 'tempo-docs-home-guide-button' })}
    >
      Get started
    </Link>
  )
}
