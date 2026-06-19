import Link from 'next/link'
import type { ReactNode } from 'react'
import ArrowUpRight from './ArrowUpRight'

// Single button styling for the whole site. Two variants:
//  - primary:   filled (the prominent CTA)
//  - secondary: outlined (supporting actions)
// Renders a Next <Link> for internal hrefs ("/", "#") and an <a> otherwise.
type Props = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  arrow?: boolean
  className?: string
}

const VARIANTS = {
  primary: 'bg-surface-onyx text-on-surface-onyx hover:opacity-80',
  secondary: 'border border-line bg-surface-shell text-foreground hover:bg-surface-block',
} as const

export default function Button({
  href,
  children,
  variant = 'secondary',
  arrow = false,
  className = '',
}: Props) {
  const classes = `inline-flex h-11 items-center justify-center gap-2 px-5 font-sans text-[14px] tracking-[0] whitespace-nowrap transition-colors ${VARIANTS[variant]} ${className}`
  const inner = (
    <>
      {children}
      {arrow ? <ArrowUpRight className="size-[14px] shrink-0" /> : null}
    </>
  )

  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {inner}
    </a>
  )
}
