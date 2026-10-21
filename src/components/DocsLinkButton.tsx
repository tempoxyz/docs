import type * as React from 'react'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'

export function DocsLinkButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode
  className?: string
  href: string
}) {
  return (
    <a {...button({ className })} href={href}>
      {children}
    </a>
  )
}

const button = style({
  position: 'relative',
  marginBlock: tokens.spacing['6'],
  display: 'flex',
  minHeight: '40px',
  width: 'fit-content',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing['2'],
  whiteSpace: 'nowrap',
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  border: 0,

  backgroundColor: inherited.color.backgroundColorInvert,

  color: inherited.color.textColorInvert,

  paddingBlock: tokens.spacing['2'],
  paddingInline: tokens.spacing['4'],
  fontWeight: tokens.fontWeight.medium,
  fontSize: tokens.fontSize.sm,
  textDecoration: 'none',
  transitionProperty: 'opacity',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  '@media (hover: hover)': { ':hover': { opacity: 0.9, transitionDuration: 'var(--tempo-enter)' } },
  ':focus-visible': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
    outlineOffset: '3px',
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
