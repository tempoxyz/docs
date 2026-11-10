import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'

// The band stays black in both themes; its hairline separates it from a black page in dark.
export const band = style({
  backgroundColor: tokens.color.black,
  color: tokens.color.white,
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.whiteA3,
})

export const inner = style({
  display: 'grid',
  gap: tokens.spacing['10'],
  maxWidth: 'var(--vocs-spacing-content)',
  paddingBlockStart: tokens.spacing['12'],
  paddingBlockEnd: tokens.spacing['8'],
  // design-exception: Align the footer with the article's Vocs content inset at every width.
  paddingInline: 'var(--vocs-spacing-content-px) !custom',
  '@media (width >= 1376px)': {
    marginInline: 'auto !custom',
  },
})

export const brand = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: tokens.spacing['4'],
})

export const mark = style({
  width: '17px',
  height: '18px',
  color: tokens.color.white,
})

export const tagline = style({
  maxWidth: '320px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.whiteA8,
})

export const columns = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: tokens.spacing['6'],
  rowGap: tokens.spacing['10'],
  '@media (width >= 768px)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  '@media (width >= 1080px)': {
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  },
})

export const column = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['4'],
  minWidth: 0,
})

export const columnHeader = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.white,
})

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
})

export const link = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['0_5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.whiteA8,
  textDecoration: 'none',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.white,
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
  opacity: 0.8,
})

export const bottom = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: tokens.spacing['6'],
  rowGap: tokens.spacing['2'],
  paddingBlockStart: tokens.spacing['6'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.whiteA3,
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.control,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.whiteA8,
})

export const bottomLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['0_5'],
  color: tokens.color.whiteA8,
  textDecoration: 'none',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.white,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
})
