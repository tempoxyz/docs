import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const sectionSection = style({
  scrollMarginTop: metrics.spacing['12'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['16'],
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['8'],
  },
})
export const sectionHeading = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '24px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const sectionDescription = style({
  marginTop: metrics.spacing['3'],
  maxWidth: '640px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const sectionLayout = style({
  marginTop: metrics.spacing['10'],
})
export const skeletonBlockText = style({
  display: 'block',
  animation: 'var(--animate-pulse)',
  backgroundColor: 'color-mix(in oklab, var(--surface-skeleton) 35%, transparent)',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const reveal = style({
  marginTop: metrics.spacing['16'],
})
export const heroChartSkeletonLayout = style({
  marginTop: metrics.spacing['5'],
  textAlign: 'center',
})
export const heroChartSkeletonDescription = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '20px',
  lineHeight: 'var(--leading-tight)',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const skeletonBlock = style({
  marginInline: 'auto',
  marginTop: metrics.spacing['2'],
  height: metrics.spacing['4'],
  width: '300px',
  maxWidth: '70vw',
})
export const heroChartUnavailableLayout = style({
  display: 'flex',
  height: '360px',
  alignItems: 'center',
  justifyContent: 'center',
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'color-mix(in oklab, var(--surface-block) 40%, transparent)',
  paddingInline: metrics.spacing['5'],
  textAlign: 'center',
})
export const heroChartUnavailableDescription = style({
  maxWidth: '420px',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  lineHeight: 1.6,
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const heroStatsSkeletonLayout = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
})
export const heroStatsSkeletonLayout2 = style({
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['6'],
  '@media (width >= 40rem)': {
    paddingInline: metrics.spacing['5'],
  },
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['8'],
  },
})
export const heroStatsSkeletonLayout3 = style({
  borderLeftStyle: 'solid',
  borderLeftWidth: '1px',
  borderColor: 'var(--line)',
})
export const heroStatsSkeletonDescription = style({
  minHeight: '2.75em',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  lineHeight: 'var(--leading-snug)',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const skeletonBlock2 = style({
  marginTop: metrics.spacing['3'],
  height: metrics.spacing['8'],
  width: metrics.spacing['28'],
})
export const settlementStreamSkeletonLayout = style({
  position: 'relative',
  height: '180px',
  width: '100%',
  overflow: 'hidden',
})
export const skeletonBlock3 = style({
  position: 'absolute',
  top: '26px',
  right: '0',
  height: metrics.spacing['3'],
  width: metrics.spacing['24'],
})
export const settlementStreamSkeletonLayout2 = style({
  position: 'absolute',
  top: '58px',
  right: '0',
  display: 'flex',
  gap: '14px',
})
export const settlementStreamSkeletonLayout3 = style({
  display: 'flex',
  width: metrics.spacing['16'],
  height: metrics.spacing['16'],
  alignItems: 'center',
  justifyContent: 'center',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line-strong)',
  backgroundColor: 'var(--surface-panel)',
})
export const skeletonBlock4 = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  borderRadius: 'calc(infinity * 1px)',
})
export const settlementStreamSkeletonLayout4 = style({
  pointerEvents: 'none',
  position: 'absolute',
  insetBlock: '0',
  left: '0',
  width: metrics.spacing['16'],
  '--tempo-style-gradient-position': 'to right in oklab',
  backgroundImage: 'linear-gradient(var(--tempo-style-gradient-stops))',
  '--tempo-style-gradient-from': 'var(--surface-shell)',
  '--tempo-style-gradient-stops':
    'var(--tempo-style-gradient-via-stops, var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position))',
  '--tempo-style-gradient-to': 'transparent',
})
export const settlementStreamSkeletonLayout5 = style({
  position: 'absolute',
  right: metrics.spacing['8'],
  bottom: metrics.spacing['2'],
  display: 'flex',
  width: '78px',
  alignItems: 'center',
})
export const settlementStreamSkeletonText = style({
  height: metrics.spacing['2'],
  width: '1px',
  backgroundColor: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
})
export const settlementStreamSkeletonText2 = style({
  height: '1px',
  flex: '1 1 0%',
  backgroundColor: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
})
export const paymentLanesSkeletonLayout = style({
  position: 'relative',
  height: '300px',
  width: '100%',
  overflow: 'hidden',
})
export const paymentLanesSkeletonLayout2 = style({
  position: 'absolute',
  insetInline: '0',
  top: metrics.spacing['5'],
  height: '170px',
  backgroundColor: 'var(--background)',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const skeletonBlock5 = style({
  position: 'absolute',
  top: metrics.spacing['10'],
  left: metrics.spacing['3'],
  height: metrics.spacing['2'],
  width: metrics.spacing['48'],
})
export const paymentLanesSkeletonIcon = style({
  position: 'absolute',
  inset: '0',
  height: '100%',
  width: '100%',
})
export const paymentLanesSkeletonLayout3 = style({
  position: 'absolute',
  insetInline: '0',
  top: '190px',
  bottom: metrics.spacing['6'],
  backgroundColor: 'color-mix(in oklab, var(--indicator-green) 5%, transparent)',
})
export const skeletonBlock6 = style({
  position: 'absolute',
  top: '210px',
  left: metrics.spacing['3'],
  height: metrics.spacing['2'],
  width: metrics.spacing['44'],
})
export const uptimeStripSkeletonLayout = style({
  marginBottom: metrics.spacing['6'],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['3'],
})
export const skeletonBlock7 = style({
  height: metrics.spacing['3'],
  width: metrics.spacing['40'],
})
export const skeletonBlock8 = style({
  height: metrics.spacing['3'],
  width: metrics.spacing['24'],
})
export const uptimeStripSkeletonLayout2 = style({
  display: 'flex',
  height: metrics.spacing['12'],
  alignItems: 'stretch',
  gap: '2px',
})
export const uptimeStripSkeletonText = style({
  flex: '1 1 0%',
  animation: 'var(--animate-pulse)',
  borderRadius: '1px',
  backgroundColor: 'color-mix(in oklab, var(--indicator-green) 35%, transparent)',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const uptimeStripSkeletonLayout3 = style({
  marginTop: metrics.spacing['3'],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const skeletonBlock9 = style({
  height: metrics.spacing['2'],
  width: metrics.spacing['12'],
})
export const skeletonBlock10 = style({
  marginTop: metrics.spacing['10'],
  height: metrics.spacing['10'],
  width: metrics.spacing['56'],
})
export const skeletonBlock11 = style({
  marginTop: metrics.spacing['10'],
  height: metrics.spacing['10'],
  width: metrics.spacing['40'],
})
export const main = style({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: 'var(--surface-page)',
})
export const performancePageLayout = style({
  marginInline: 'auto',
  width: '100%',
  maxWidth: 'var(--container-7xl)',
  borderInlineStyle: 'solid',
  borderInlineWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-shell)',
})
export const performancePageSection = style({
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
export const reveal2 = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})
export const performancePageTitle = style({
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
export const performancePageLayout2 = style({
  marginTop: metrics.spacing['10'],
  textAlign: 'center',
})
export const performancePageDescription = style({
  marginTop: 'var(--spacing)',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  lineHeight: 1.4,
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const performancePageDescription2 = style({
  marginTop: metrics.spacing['2'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '24px',
  letterSpacing: '-0.01em',
  color: 'var(--foreground)',
  '@media (width >= 64rem)': {
    fontSize: '28px',
  },
})
export const performancePageSection2 = style({
  scrollMarginTop: metrics.spacing['12'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
})
export const performancePageLink = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['8'],
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['16'],
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
    '&:focus-visible': {
      backgroundColor: 'var(--surface-block)',
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
  },
  '@media (width >= 64rem)': {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingInline: metrics.spacing['8'],
  },
})
export const performancePageText = style({
  display: 'block',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '24px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const performancePageText2 = style({
  marginTop: metrics.spacing['3'],
  display: 'block',
  maxWidth: '760px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 65%, transparent)',
      },
    },
    '&:is(:where(.group):focus-visible *)': {
      color: 'color-mix(in oklab, var(--foreground) 65%, transparent)',
    },
  },
})
export const performancePageText3 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
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
    '&:is(:where(.group):focus-visible *)': {
      color: 'var(--foreground)',
    },
  },
})
export const arrowUpRight = style({
  width: '14px',
  height: '14px',
  flexShrink: 0,
})
export const performancePageLayout3 = style({
  marginTop: '100px',
})
