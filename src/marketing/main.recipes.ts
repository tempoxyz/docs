import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const fallbackSkeletonText = style({
  display: 'block',
  animation: 'var(--animate-pulse)',
  backgroundColor: 'color-mix(in oklab, var(--surface-skeleton) 35%, transparent)',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const main = style({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: 'var(--surface-page)',
})
export const performanceRouteFallbackLayout = style({
  marginInline: 'auto',
  width: '100%',
  maxWidth: 'var(--container-7xl)',
  borderInlineStyle: 'solid',
  borderInlineWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-shell)',
})
export const performanceRouteFallbackSection = style({
  position: 'relative',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingTop: metrics.spacing['20'],
  paddingBottom: metrics.spacing['12'],
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['8'],
    paddingTop: metrics.spacing['28'],
  },
})
export const performanceRouteFallbackLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})
export const performanceRouteFallbackTitle = style({
  maxWidth: '880px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  textWrap: 'balance',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const performanceRouteFallbackLayout3 = style({
  marginTop: metrics.spacing['16'],
})
export const performanceRouteFallbackLayout4 = style({
  marginTop: metrics.spacing['5'],
  textAlign: 'center',
})
export const performanceRouteFallbackDescription = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '20px',
  lineHeight: 'var(--leading-tight)',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const fallbackSkeleton = style({
  marginInline: 'auto',
  marginTop: metrics.spacing['2'],
  height: metrics.spacing['4'],
  width: '300px',
  maxWidth: '70vw',
})
