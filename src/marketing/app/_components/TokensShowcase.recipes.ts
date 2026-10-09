import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const visualMockLayout = style({
  '@media (width >= 64rem)': {
    marginInline: 'calc(var(--spacing) * -10)',
  },
})
export const reveal = style({
  position: 'relative',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 64rem)': {
    display: 'flex',
  },
})
export const reveal2 = style({
  '@media (width >= 64rem)': {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
  },
})
export const tokensShowcaseLayout = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: 'var(--surface-shell)',
  padding: metrics.spacing['7'],
  '@media (width >= 64rem)': {
    width: 'calc(1 / 2 * 100%)',
    padding: metrics.spacing['12'],
  },
})
export const tokensShowcaseHeading = style({
  maxWidth: '520px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const tokensShowcaseLayout2 = style({
  marginInline: 'calc(var(--spacing) * -7)',
  marginTop: metrics.spacing['8'],
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 64rem)': {
    marginInline: 'calc(var(--spacing) * -12)',
  },
})
export const tokensShowcaseButton = style({
  display: 'flex',
  width: '100%',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: metrics.spacing['6'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['7'],
  paddingBlock: metrics.spacing['5'],
  textAlign: 'left',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['12'],
  },
})
export const tokensShowcaseButton2 = style({
  color: 'var(--foreground)',
})
export const tokensShowcaseButton3 = style({
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
      },
    },
  },
})
export const tokensShowcaseText = style({
  display: 'block',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '20px',
  lineHeight: 1.2,
  letterSpacing: '0',
})
export const tokensShowcaseText2 = style({
  marginTop: metrics.spacing['2'],
  display: 'block',
  maxWidth: '560px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  lineHeight: 1.45,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 65%, transparent)',
      },
    },
  },
})
export const tokensShowcaseText3 = style({
  marginTop: metrics.spacing['1_5'],
  width: metrics.spacing['2'],
  height: metrics.spacing['2'],
  flexShrink: 0,
})
export const tokensShowcaseText4 = style({
  backgroundColor: 'var(--foreground)',
})
export const tokensShowcaseText5 = style({
  backgroundColor: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
})
export const tokensShowcaseLayout3 = style({
  marginTop: metrics.spacing['10'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: metrics.spacing['2_5'],
  '@media (width >= 64rem)': {
    justifyContent: 'flex-start',
  },
})
export const tokensShowcaseLayout4 = style({
  position: 'relative',
  display: 'flex',
  minHeight: '360px',
  alignItems: 'center',
  justifyContent: 'center',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
  padding: metrics.spacing['6'],
  paddingTop: metrics.spacing['18'],
  '@media (width >= 64rem)': {
    width: 'calc(1 / 2 * 100%)',
    borderTopStyle: 'solid',
    borderTopWidth: '0px',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    padding: metrics.spacing['10'],
    paddingTop: metrics.spacing['18'],
  },
})
export const tokensShowcaseLayout5 = style({
  position: 'absolute',
  top: metrics.spacing['6'],
  right: metrics.spacing['6'],
  zIndex: 20,
  '@media (width >= 64rem)': {
    top: metrics.spacing['8'],
    right: metrics.spacing['10'],
  },
})
export const tokensShowcaseLayout6 = style({
  display: 'grid',
  width: '100%',
  maxWidth: '560px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
})
export const tokensShowcaseLayout7 = style({
  paddingBottom: metrics.spacing['16'],
})
export const tokensShowcaseStateState = style({
  padding: metrics.spacing['6'],
  '@media (width >= 64rem)': {
    minHeight: '0',
    padding: metrics.spacing['10'],
  },
})
