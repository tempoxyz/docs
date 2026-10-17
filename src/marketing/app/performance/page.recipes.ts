import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const sectionSection = style({
  scrollMarginTop: tokens.spacing['12'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['16'],
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['8'],
  },
})
export const sectionHeading = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.title,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const sectionDescription = style({
  marginTop: tokens.spacing['3'],
  maxWidth: '640px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const sectionLayout = style({
  marginTop: tokens.spacing['10'],
})
export const skeletonBlockText = style({
  display: 'block',
  animation: 'var(--animate-pulse)',

  backgroundColor: inherited.color.colorMixInOklabSurfaceSkeleton35Transparent,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const reveal = style({
  marginTop: tokens.spacing['16'],
})
export const heroChartSkeletonLayout = style({
  marginTop: tokens.spacing['5'],
  textAlign: 'center',
})
export const heroChartSkeletonDescription = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,

  lineHeight: inherited.lineHeight.leadingTight,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const skeletonBlock = style({
  marginInline: 'auto !custom',
  marginTop: tokens.spacing['2'],
  height: tokens.spacing['4'],
  width: '300px',
  maxWidth: '70vw',
})
export const heroChartUnavailableLayout = style({
  display: 'flex',
  height: '360px',
  alignItems: 'center',
  justifyContent: 'center',
  borderBlockStyle: 'solid',
  borderBlockWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,

  backgroundColor: inherited.color.colorMixInOklabSurfaceBlock40Transparent,
  paddingInline: tokens.spacing['5'],
  textAlign: 'center',
})
export const heroChartUnavailableDescription = style({
  maxWidth: '420px',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.relaxed,

  color: inherited.color.colorMixInOklabForeground40Transparent,
})
export const heroStatsSkeletonLayout = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const heroStatsSkeletonLayout2 = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['6'],
  '@media (width >= 40rem)': {
    paddingInline: tokens.spacing['5'],
  },
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['8'],
  },
})
export const heroStatsSkeletonLayout3 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const heroStatsSkeletonDescription = style({
  minHeight: '2.75em',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,

  lineHeight: inherited.lineHeight.leadingSnug,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const skeletonBlock2 = style({
  marginTop: tokens.spacing['3'],
  height: tokens.spacing['8'],
  width: tokens.spacing['28'],
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
  insetInlineEnd: '0',
  height: tokens.spacing['3'],
  width: tokens.spacing['24'],
})
export const settlementStreamSkeletonLayout2 = style({
  position: 'absolute',
  top: '58px',
  insetInlineEnd: '0',
  display: 'flex',
  gap: tokens.spacing['3_5'],
})
export const settlementStreamSkeletonLayout3 = style({
  display: 'flex',
  width: tokens.spacing['16'],
  height: tokens.spacing['16'],
  alignItems: 'center',
  justifyContent: 'center',
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.lineStrong,

  backgroundColor: inherited.color.surfacePanel,
})
export const skeletonBlock4 = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  borderRadius: tokens.radius.full,
})
export const settlementStreamSkeletonLayout4 = style({
  pointerEvents: 'none',
  position: 'absolute',
  insetBlock: '0',
  insetInlineStart: '0',
  width: tokens.spacing['16'],
  '--tempo-style-gradient-position': 'to right in oklab',
  backgroundImage: 'linear-gradient(var(--tempo-style-gradient-stops))',
  '--tempo-style-gradient-from': 'var(--surface-shell)',
  '--tempo-style-gradient-stops':
    'var(--tempo-style-gradient-via-stops, var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position))',
  '--tempo-style-gradient-to': 'transparent',
})
export const settlementStreamSkeletonLayout5 = style({
  position: 'absolute',
  insetInlineEnd: tokens.spacing['8'],
  bottom: tokens.spacing['2'],
  display: 'flex',
  width: '78px',
  alignItems: 'center',
})
export const settlementStreamSkeletonText = style({
  height: tokens.spacing['2'],
  width: '1px',

  backgroundColor: inherited.color.colorMixInOklabForeground25Transparent,
})
export const settlementStreamSkeletonText2 = style({
  height: '1px',
  flex: '1 1 0%',

  backgroundColor: inherited.color.colorMixInOklabForeground25Transparent,
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
  top: tokens.spacing['5'],
  height: '170px',
  backgroundColor: tokens.color.background,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const skeletonBlock5 = style({
  position: 'absolute',
  top: tokens.spacing['10'],
  insetInlineStart: tokens.spacing['3'],
  height: tokens.spacing['2'],
  width: tokens.spacing['48'],
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
  bottom: tokens.spacing['6'],

  backgroundColor: inherited.color.colorMixInOklabIndicatorGreen5Transparent,
})
export const skeletonBlock6 = style({
  position: 'absolute',
  top: '210px',
  insetInlineStart: tokens.spacing['3'],
  height: tokens.spacing['2'],
  width: tokens.spacing['44'],
})
export const uptimeStripSkeletonLayout = style({
  marginBottom: tokens.spacing['6'],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
})
export const skeletonBlock7 = style({
  height: tokens.spacing['3'],
  width: tokens.spacing['40'],
})
export const skeletonBlock8 = style({
  height: tokens.spacing['3'],
  width: tokens.spacing['24'],
})
export const uptimeStripSkeletonLayout2 = style({
  display: 'flex',
  height: tokens.spacing['12'],
  alignItems: 'stretch',
  gap: tokens.spacing['0_5'],
})
export const uptimeStripSkeletonText = style({
  flex: '1 1 0%',
  animation: 'var(--animate-pulse)',
  borderRadius: tokens.radius.hairline,

  backgroundColor: inherited.color.colorMixInOklabIndicatorGreen35Transparent,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const uptimeStripSkeletonLayout3 = style({
  marginTop: tokens.spacing['3'],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const skeletonBlock9 = style({
  height: tokens.spacing['2'],
  width: tokens.spacing['12'],
})
export const skeletonBlock10 = style({
  marginTop: tokens.spacing['10'],
  height: tokens.spacing['10'],
  width: tokens.spacing['56'],
})
export const skeletonBlock11 = style({
  marginTop: tokens.spacing['10'],
  height: tokens.spacing['10'],
  width: tokens.spacing['40'],
})
export const main = style({
  minHeight: '100vh',
  width: '100%',

  backgroundColor: inherited.color.surfacePage,
})
export const performancePageLayout = style({
  marginInline: 'auto !custom',
  width: '100%',
  maxWidth: 'var(--container-7xl)',
  borderInlineStyle: 'solid',
  borderInlineWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
})
export const performancePageSection = style({
  position: 'relative',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingTop: tokens.spacing['20'],
  paddingBottom: tokens.spacing['12'],
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['8'],
    paddingTop: tokens.spacing['28'],
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
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(2.5rem, 6vw, 3.5rem) !custom',

  lineHeight: tokens.lineHeight.none,
  letterSpacing: tokens.letterSpacing.heading,
  textWrap: 'balance',
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const performancePageLayout2 = style({
  marginTop: tokens.spacing['10'],
  textAlign: 'center',
})
export const performancePageDescription = style({
  marginTop: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.snug,

  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const performancePageDescription2 = style({
  marginTop: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.title,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.foreground,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.heading,
  },
})
export const performancePageSection2 = style({
  scrollMarginTop: tokens.spacing['12'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const performancePageLink = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['8'],
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['16'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.block,
      },
    },
    '&:focus-visible': {
      backgroundColor: tokens.color.block,
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
  },
  '@media (width >= 64rem)': {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingInline: tokens.spacing['8'],
  },
})
export const performancePageText = style({
  display: 'block',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.title,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const performancePageText2 = style({
  marginTop: tokens.spacing['3'],
  display: 'block',
  maxWidth: '760px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground65Transparent,
      },
    },
    '&:is(:where(.group):focus-visible *)': {
      color: inherited.color.colorMixInOklabForeground65Transparent,
    },
  },
})
export const performancePageText3 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground55Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
      },
    },
    '&:is(:where(.group):focus-visible *)': {
      color: tokens.color.foreground,
    },
  },
})
export const arrowUpRight = style({
  width: '14px',
  height: '14px',
  flexShrink: 0,
})
export const performancePageLayout3 = style({
  marginTop: tokens.spacing['24'],
})
