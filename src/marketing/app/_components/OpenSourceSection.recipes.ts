import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const rethBadgeLayout = style({
  position: 'absolute',
  top: '0',
  left: '0',
  display: 'none',
  '--tempo-style-translate-x': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  '@media (width >= 96rem)': {
    display: 'block',
  },
})
export const rethBadgeLayout2 = style({
  position: 'relative',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'color-mix(in oklab, var(--line) 30%, transparent)',
  backgroundColor: 'var(--surface-page)',
  padding: metrics.spacing['2_5'],
})
export const rethBadgeLayout3 = style({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  padding: metrics.spacing['2_5'],
})
export const openSourceSectionSection = style({
  position: 'relative',
  paddingBottom: metrics.spacing['6'],
})
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: metrics.spacing['5'],
  textAlign: 'center',
})
export const openSourceSectionHeading = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2rem, 6vw, 3rem)',
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const openSourceSectionDescription = style({
  marginTop: metrics.spacing['6'],
  maxWidth: '560px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.4,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  '@media (width >= 64rem)': {
    fontSize: '20px',
  },
})
export const openSourceSectionLayout = style({
  position: 'relative',
  marginTop: metrics.spacing['16'],
})
export const openSourceSectionList = style({
  display: 'grid',
  gridAutoRows: 'minmax(0, 1fr)',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  gap: '1px',
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--line)',
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (width >= 80rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const openSourceSectionItem = style({
  height: '100%',
})
export const openSourceSectionLink = style({
  display: 'flex',
  height: '100%',
  minHeight: '220px',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: 'var(--surface-shell)',
  padding: metrics.spacing['6'],
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
  '@media (width >= 64rem)': {
    padding: metrics.spacing['8'],
  },
})
export const openSourceSectionText = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['4'],
})
export const openSourceSectionText2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['3'],
})
export const openSourceSectionText3 = style({
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  flexShrink: 0,
})
export const openSourceSectionText4 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '18px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const arrowUpRight = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
      },
    },
  },
})
export const openSourceSectionText5 = style({
  marginTop: metrics.spacing['8'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  lineHeight: 1.45,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 65%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 85%, transparent)',
      },
    },
  },
})
export const openSourceSectionLink2 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: metrics.spacing['2'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  letterSpacing: '0',
  color: 'var(--foreground)',
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
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['8'],
  },
})
export const arrowUpRight2 = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
      },
    },
  },
})
export const rethBadgeStateState = style({
  transitionProperty: 'opacity,scale',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '350ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const rethBadgeStateState2 = style({
  '--tempo-style-scale-x': '100%',
  '--tempo-style-scale-y': '100%',
  '--tempo-style-scale-z': '100%',
  scale: 'var(--tempo-style-scale-x) var(--tempo-style-scale-y)',
  opacity: '100%',
})
export const rethBadgeStateState3 = style({
  '--tempo-style-scale-x': '40%',
  '--tempo-style-scale-y': '40%',
  '--tempo-style-scale-z': '40%',
  scale: 'var(--tempo-style-scale-x) var(--tempo-style-scale-y)',
  opacity: '0%',
})
export const openSourceSectionTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundColor': values.value0,
  backgroundColor: 'var(--tempo-backgroundColor)',
}))
