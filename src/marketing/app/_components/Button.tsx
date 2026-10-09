import Link from 'next/link'
import type { ReactNode } from 'react'
import { variants } from '../../../styles/controls'
import ArrowUpRight from './ArrowUpRight'
import * as ui from './Button.recipes'

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

export default function Button({
  href,
  children,
  variant = 'secondary',
  arrow = false,
  className = '',
}: Props) {
  const inner = (
    <>
      {children}
      {arrow ? <ArrowUpRight className={ui.arrowUpRight().className} /> : null}
    </>
  )

  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <Link href={href} {...button({ variant, className })}>
        {inner}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...button({ variant, className })}>
      {inner}
    </a>
  )
}

const button = variants({
  base: {
    display: 'inline-flex',
    height: '44px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    paddingInline: '20px',
    fontFamily: 'var(--font-pilat-book)',
    fontSize: '14px',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
    transition: 'color 150ms, background-color 150ms, opacity 150ms',
    ':focus-visible': { outline: '2px solid var(--accent-blue)', outlineOffset: '3px' },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  defaultVariants: { variant: 'secondary' },
  variants: {
    variant: {
      primary: {
        backgroundColor: 'var(--surface-onyx)',
        color: 'var(--on-surface-onyx)',
        '@media (hover: hover)': { ':hover': { opacity: 0.8 } },
      },
      secondary: {
        border: '1px solid var(--line)',
        backgroundColor: 'var(--surface-shell)',
        color: 'var(--foreground)',
        '@media (hover: hover)': { ':hover': { backgroundColor: 'var(--surface-block)' } },
      },
    },
  },
})
