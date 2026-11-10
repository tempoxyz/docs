import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'

export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['12'],
  width: '100%',
  maxWidth: '880px',
  marginInline: 'auto !custom',
  paddingBlock: tokens.spacing['12'],
})

export const intro = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: tokens.spacing['4'],
})

export const title = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.display,
  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.display,
  color: tokens.color.foreground,
})

export const lede = style({
  maxWidth: '560px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.relaxed,
  letterSpacing: tokens.letterSpacing.b1,
  color: tokens.color.muted,
})

export const searchButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  minHeight: '36px',
  marginTop: tokens.spacing['2'],
  paddingInline: tokens.spacing['4'],
  borderWidth: tokens.borderWidth.none,
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: tokens.color.container,
  color: tokens.color.foreground,
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.containerStrong,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['4'],
})

export const sectionTitle = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.muted,
})

export const taskList = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: tokens.spacing['2'],
  '@media (width >= 768px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})

export const taskLink = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
  minHeight: '48px',
  paddingInline: tokens.spacing['4'],
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  backgroundColor: tokens.color.panel,
  color: tokens.color.foreground,
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
  textDecoration: 'none',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.containerStrong,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

export const taskIcon = style({
  flexShrink: 0,
  color: tokens.color.muted,
})

export const areaGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: tokens.spacing['2'],
  '@media (width >= 768px)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})

export const areaCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['1'],
  height: '100%',
  padding: tokens.spacing['4'],
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.cardLine,
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  backgroundColor: tokens.color.panel,
  textDecoration: 'none',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.containerStrong,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

export const areaLabel = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
  lineHeight: tokens.lineHeight.control,
  color: tokens.color.foreground,
})

export const areaDescription = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.control,
  color: tokens.color.muted,
})
