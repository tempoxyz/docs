import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const featureFaqSection = style({
  marginTop: '140px',
  scrollMarginTop: metrics.spacing['12'],
})
export const reveal = style({
  position: 'relative',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
})
export const featureFaqLayout = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 64rem)': {
    gridTemplateColumns: '0.78fr 1.22fr',
  },
})
export const featureFaqLayout2 = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-shell)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['14'],
  '@media (width >= 64rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '0px',
    paddingInline: metrics.spacing['12'],
    paddingBlock: metrics.spacing['20'],
  },
})
export const featureFaqHeading = style({
  maxWidth: '520px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2rem, 6vw, 3rem)',
  lineHeight: 1.08,
  letterSpacing: '-0.03em',
  textWrap: 'balance',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const featureFaqDescription = style({
  marginTop: metrics.spacing['5'],
  maxWidth: '500px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const featureFaqLayout3 = style({
  backgroundColor: 'var(--surface-shell)',
})
export const featureFaqLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflow: 'hidden',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  transitionProperty: 'height,background-color',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '300ms',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['10'],
  },
})
export const featureFaqLayout5 = style({
  height: '236px',
  backgroundColor: 'var(--surface-block)',
  '@media (width >= 48rem)': {
    height: '220px',
  },
})
export const featureFaqLayout6 = style({
  height: '116px',
})
export const featureFaqButton = style({
  display: 'flex',
  width: '100%',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: metrics.spacing['6'],
  textAlign: 'left',
})
export const featureFaqText = style({
  maxWidth: '720px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '20px',
  lineHeight: 1.2,
  letterSpacing: '0',
  color: 'var(--foreground)',
  '@media (width >= 64rem)': {
    fontSize: '24px',
  },
})
export const featureFaqText2 = style({
  marginTop: 'var(--spacing)',
  display: 'grid',
  width: metrics.spacing['6'],
  height: metrics.spacing['6'],
  flexShrink: 0,
  placeItems: 'center',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '16px',
  lineHeight: 1,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const featureFaqText3 = style({
  backgroundColor: 'var(--foreground)',
  color: 'var(--background)',
})
export const featureFaqText4 = style({
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const featureFaqLayout7 = style({
  display: 'grid',
  maxWidth: '720px',
  transitionProperty: 'grid-template-rows,opacity,margin-top',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '300ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const featureFaqLayout8 = style({
  marginTop: metrics.spacing['5'],
  gridTemplateRows: '1fr',
  opacity: '100%',
})
export const featureFaqLayout9 = style({
  marginTop: '0',
  gridTemplateRows: '0fr',
  opacity: '0%',
})
export const featureFaqLayout10 = style({
  overflow: 'hidden',
})
export const featureFaqDescription2 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.55,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const featureFaqLink = style({
  color: 'color-mix(in oklab, var(--foreground) 75%, transparent)',
  textDecorationLine: 'underline',
  textDecorationColor: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
  textUnderlineOffset: '4px',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        textDecorationColor: 'var(--foreground)',
      },
    },
  },
})
