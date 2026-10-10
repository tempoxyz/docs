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

/** A secondary (gray) button that opens a guide from the home 3-up. */
export function HomeGuideButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link to={href} {...button({ variant: 'default', className: 'tempo-docs-home-guide-button' })}>
      {children}
    </Link>
  )
}
