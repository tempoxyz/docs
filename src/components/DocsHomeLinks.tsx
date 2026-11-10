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

/** A Home action button: the accent fill for the page's primary action, the gray fill
 * for the secondary one. Its label is the action itself, so it carries no extra name. */
export function HomeGuideButton({
  href,
  guide,
  variant = 'default',
}: {
  href: string
  guide: string
  variant?: 'accent' | 'default'
}) {
  return (
    <Link to={href} {...button({ variant, className: 'tempo-docs-home-action' })}>
      {guide}
    </Link>
  )
}
