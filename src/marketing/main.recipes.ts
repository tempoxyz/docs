import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const fallbackSkeletonText = style({
  display: 'block',
  animation: 'var(--animate-pulse)',

  backgroundColor: inherited.color.colorMixInOklabSurfaceSkeleton35Transparent,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const main = style({
  minHeight: '100vh',
  width: '100%',

  backgroundColor: inherited.color.surfacePage,
})
export const performanceRouteFallbackLayout = style({
  marginInline: 'auto !custom',
  width: '100%',
  maxWidth: 'var(--container-7xl)',
  borderInlineStyle: 'solid',
  borderInlineWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
})
export const performanceRouteFallbackSection = style({
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
export const performanceRouteFallbackLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})
export const performanceRouteFallbackTitle = style({
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
export const performanceRouteFallbackLayout3 = style({
  marginTop: tokens.spacing['16'],
})
export const performanceRouteFallbackLayout4 = style({
  marginTop: tokens.spacing['5'],
  textAlign: 'center',
})
export const performanceRouteFallbackDescription = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,

  lineHeight: inherited.lineHeight.leadingTight,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const fallbackSkeleton = style({
  marginInline: 'auto !custom',
  marginTop: tokens.spacing['2'],
  height: tokens.spacing['4'],
  width: '300px',
  maxWidth: '70vw',
})
