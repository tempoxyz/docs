import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'

// The footer (Home and Not found) sits under one top hairline, with its text on the page
// gutter (24, 16 below Tablet). The fill hides the outline rail where the footer runs under it.
export const root = style({
  paddingInline: tokens.spacing['4'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.hairline,
  backgroundColor: tokens.color.background,
  fontFamily: tokens.fontFamily.ui,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.muted,
  '@media (width >= 768px)': {
    paddingInline: tokens.spacing['6'],
  },
})

// Full (Home and Not found) sits on the panel fill (DS background/primary), as in the Figma.
export const full = style({
  backgroundColor: tokens.color.panel,
})

export const inlineList = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: tokens.spacing['4'],
  rowGap: tokens.spacing['2'],
})

// The T mark and the tagline, then three columns of 14/20 links, then the 12/16 bottom row.
export const brand = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: tokens.spacing['4'],
  paddingBlockStart: tokens.spacing['12'],
})

export const mark = style({
  width: '17px',
  height: '18px',
  color: tokens.color.foreground,
})

export const tagline = style({
  maxWidth: '320px',
  margin: tokens.spacing['0'],
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  color: tokens.color.muted,
})

export const columns = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: tokens.spacing['6'],
  rowGap: tokens.spacing['8'],
  paddingBlockStart: tokens.spacing['8'],
  paddingBlockEnd: tokens.spacing['12'],
  '@media (width >= 768px)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 160px))',
  },
})

export const column = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['4'],
  minWidth: 0,
})

export const columnHeader = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  lineHeight: tokens.lineHeight.control,
  color: tokens.color.foreground,
})

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
})

export const bottom = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: tokens.spacing['4'],
  rowGap: tokens.spacing['2'],
  paddingBlock: tokens.spacing['6'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.hairline,
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.caption,
})

// Links are secondary and turn primary on hover.
export const link = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['0_5'],
  color: tokens.color.muted,
  textDecoration: 'none',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

export const externalIcon = style({
  flexShrink: 0,
})

export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
})
