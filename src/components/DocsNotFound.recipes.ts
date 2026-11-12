import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'

// One column at the prose measure: title, lead, Search docs, then the top tasks. The
// article supplies the page's top and bottom padding.
export const page = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  maxWidth: '720px',
  marginInline: 'auto !custom',
  fontFamily: tokens.fontFamily.book,
})

export const title = style({
  fontSize: tokens.fontSize.heading,
  fontWeight: tokens.fontWeight.normal,
  lineHeight: tokens.lineHeight.heading,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.foreground,
  '@media (width >= 768px)': {
    fontSize: tokens.fontSize.displaySmall,
  },
})

// H1 → lead 12; lead → first content 32.
export const lede = style({
  marginBlockStart: tokens.spacing['3'],
  fontSize: tokens.fontSize.lead,
  lineHeight: tokens.lineHeight.relaxed,
  color: tokens.color.muted,
  textWrap: 'pretty',
})

// A secondary button: the top bar's Get API key stays the view's one primary button.
export const searchButton = style({
  marginBlockStart: tokens.spacing['8'],
})

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  width: '100%',
  marginBlockStart: tokens.spacing['12'],
})

export const sectionTitle = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  lineHeight: tokens.lineHeight.control,
  color: tokens.color.muted,
})

// One surface (12, inset 4) holding the task rows (8 = 12 − 4).
export const taskList = style({
  display: 'flex',
  flexDirection: 'column',
  padding: tokens.spacing['1'],
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.hairline,
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
})

export const taskLink = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3'],
  paddingBlock: tokens.spacing['3'],
  paddingInline: tokens.spacing['3'],
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  color: tokens.color.foreground,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  textDecoration: 'none',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.containerSubtle,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

// A 32 icon tile (radius 8) with a 16 icon.
export const taskTile = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: tokens.color.container,
  color: tokens.color.foreground,
})

export const taskLabel = style({
  flexGrow: 1,
  minWidth: 0,
})

export const taskChevron = style({
  flexShrink: 0,
  color: tokens.color.muted,
})
