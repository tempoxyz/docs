import Link from 'next/link'
import type { ReactNode } from 'react'
import { vars as tokens, variants } from '../../../styles/theme'
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
    gap: tokens.spacing['2'],
    paddingInline: tokens.spacing['5'],
    fontFamily: tokens.fontFamily.book,
    fontSize: tokens.fontSize.sm,
    letterSpacing: tokens.letterSpacing.normal,
    whiteSpace: 'nowrap',
    transition: 'color 150ms, background-color 150ms, opacity 150ms',
    ':focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.accent,
      outlineOffset: '3px',
    },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  defaultVariants: { variant: 'secondary' },
  variants: {
    variant: {
      primary: {
        backgroundColor: tokens.color.onyx,
        color: tokens.color.onOnyx,
        '@media (hover: hover)': { ':hover': { opacity: 0.8 } },
      },
      secondary: {
        borderWidth: tokens.borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: tokens.color.line,
        backgroundColor: tokens.color.shell,
        color: tokens.color.foreground,
        '@media (hover: hover)': { ':hover': { backgroundColor: tokens.color.block } },
      },
    },
  },
})
