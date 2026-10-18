import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link } from 'waku'

/** The L1 chevron: hidden at rest, it fades in and travels on hover or focus of the
 * closest link (styles in styles/links.ts). Glued to the last word so it never orphans. */
export function Chevron() {
  return (
    <svg className="tempo-chevron" viewBox="0 0 30.45 53" aria-hidden="true">
      <path
        d="M2.79 2.79 26.5 26.5 2.79 50.21"
        fill="none"
        stroke="currentColor"
        strokeWidth="7.9"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Wrap text so its last word and the chevron share a no-wrap span. */
export function ChevronText({ children }: { children: ReactNode }) {
  if (typeof children !== 'string')
    return (
      <>
        {children}
        <Chevron />
      </>
    )
  const text = children.trimEnd()
  const lastSpace = text.lastIndexOf(' ')
  return (
    <>
      {text.slice(0, lastSpace + 1)}
      <span className="tempo-chevron-end">
        {text.slice(lastSpace + 1)}
        <Chevron />
      </span>
    </>
  )
}

/** A standalone link with the L1 chevron: tile titles, card titles and sub-links. */
export function ChevronLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const content = <ChevronText>{children}</ChevronText>
  if (/^(?:[a-z]+:)?\/\//i.test(href))
    return (
      <a href={href} {...props}>
        {content}
      </a>
    )
  return (
    <Link to={href} {...props}>
      {content}
    </Link>
  )
}
