import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'

export const nav = style({
  minWidth: 0,
  marginBottom: tokens.spacing['3'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.control,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.muted,
})

export const list = style({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  minWidth: 0,
  overflow: 'hidden',
})

// Ancestors give up their width first, so the current page keeps the most of its name.
export const item = style({
  display: 'flex',
  flex: '0 3 auto',
  alignItems: 'center',
  minWidth: 0,
})

export const currentItem = style({
  display: 'flex',
  flex: '0 1 auto',
  alignItems: 'center',
  minWidth: 0,
})

export const separator = style({
  flexShrink: 0,
  marginInline: tokens.spacing['1'],
  color: tokens.color.tertiary,
})

export const label = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const link = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: tokens.color.muted,
  textDecoration: 'none',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      color: tokens.color.foreground,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

export const currentLabel = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: tokens.color.foreground,
})
