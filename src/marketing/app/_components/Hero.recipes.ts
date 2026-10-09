import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const heroSection = style({
  position: 'relative',
  isolation: 'isolate',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingTop: '72px',
  paddingBottom: metrics.spacing['12'],
  '@media (width >= 64rem)': {
    paddingTop: metrics.spacing['28'],
    paddingBottom: metrics.spacing['16'],
  },
})
export const heroLayout = style({
  pointerEvents: 'none',
  position: 'absolute',
  inset: '0',
  zIndex: 'calc(10 * -1)',
  '--tempo-style-gradient-position': 'to bottom in oklab',
  backgroundImage: 'linear-gradient(var(--tempo-style-gradient-stops))',
  '--tempo-style-gradient-from': 'var(--surface-shell)',
  '--tempo-style-gradient-stops':
    'var(--tempo-style-gradient-via-stops, var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position))',
  '--tempo-style-gradient-from-position': '0%',
  '--tempo-style-gradient-via': 'color-mix(in oklab, var(--surface-shell) 95%, transparent)',
  '--tempo-style-gradient-via-stops':
    'var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-via) var(--tempo-style-gradient-via-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position)',
  '--tempo-style-gradient-via-position': '50%',
  '--tempo-style-gradient-to': 'transparent',
  '--tempo-style-gradient-to-position': '100%',
})
export const reveal = style({
  marginInline: 'auto',
  display: 'flex',
  width: '100%',
  maxWidth: '860px',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})
export const heroTitle = style({
  maxWidth: '820px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '42px',
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  '@media (width >= 40rem)': {
    fontSize: '56px',
  },
  '@media (width >= 64rem)': {
    fontSize: '68px',
  },
})
export const heroDescription = style({
  marginTop: metrics.spacing['5'],
  maxWidth: '640px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  letterSpacing: '0',
  color: 'var(--foreground-secondary)',
  '@media (width >= 64rem)': {
    fontSize: '18px',
  },
})
export const nav = style({
  marginTop: metrics.spacing['9'],
  display: 'flex',
  width: '100%',
  maxWidth: '420px',
  flexDirection: 'column',
  gap: metrics.spacing['2_5'],
  '@media (width >= 40rem)': {
    maxWidth: 'none',
    flexDirection: 'row',
    justifyContent: 'center',
  },
})
export const heroButton = style({
  height: metrics.spacing['12'],
  width: '100%',
  paddingInline: metrics.spacing['6'],
  '@media (width >= 40rem)': {
    width: 'auto',
  },
})
export const heroLayout2 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: metrics.spacing['2_5'],
  '@media (width >= 40rem)': {
    display: 'contents',
  },
})
export const nav2 = style({
  marginInline: 'auto',
  marginTop: metrics.spacing['16'],
  width: '100%',
  maxWidth: 'var(--container-5xl)',
  scrollMarginTop: metrics.spacing['12'],
  '@media (width >= 64rem)': {
    marginTop: metrics.spacing['20'],
  },
})
export const heroList = style({
  display: 'grid',
  gap: '1px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--line)',
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const heroItem = style({
  backgroundColor: 'var(--surface-shell)',
})
export const link = style({
  display: 'flex',
  height: '100%',
  minHeight: '150px',
  flexDirection: 'column',
  padding: metrics.spacing['5'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
      },
    },
  },
})
export const heroText = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: metrics.spacing['4'],
})
export const heroText2 = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  flexShrink: 0,
})
export const arrowUpRight = style({
  width: metrics.spacing['5'],
  height: metrics.spacing['5'],
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 30%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
export const heroText3 = style({
  marginTop: metrics.spacing['7'],
  display: 'block',
})
export const heroText4 = style({
  display: 'block',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '18px',
  lineHeight: 1.15,
  letterSpacing: '0',
  textWrap: 'wrap',
  color: 'var(--foreground)',
  '@media (width >= 40rem)': {
    fontSize: '20px',
  },
  '@media (width >= 64rem)': {
    fontSize: '21px',
  },
  '@media (width >= 80rem)': {
    fontSize: '22px',
  },
})
export const heroText5 = style({
  marginTop: metrics.spacing['3'],
  overflow: 'hidden',
  display: 'block',
  WebkitBoxOrient: 'vertical !custom',
  WebkitLineClamp: 2,
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  lineHeight: 1.4,
  letterSpacing: '0',
  color: 'var(--foreground-secondary)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
export const heroTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundImage': values.value0,
  backgroundImage: 'var(--tempo-backgroundImage)',
  backgroundSize: '5px 5px',
}))
