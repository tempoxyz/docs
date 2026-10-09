import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const main = style({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: 'var(--surface-page)',
})
export const featurePageLayout = style({
  marginInline: 'auto',
  width: '100%',
  maxWidth: 'var(--container-7xl)',
  borderInlineStyle: 'solid',
  borderInlineWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-shell)',
})
export const featurePageSection = style({
  position: 'relative',
  isolation: 'isolate',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['28'],
  '@media (width >= 64rem)': {
    paddingBlock: metrics.spacing['36'],
  },
})
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})
export const featurePageTitle = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2.5rem, 7vw, 3.5rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  textWrap: 'balance',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const featurePageDescription = style({
  marginTop: metrics.spacing['5'],
  maxWidth: '560px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  letterSpacing: '0',
  textWrap: 'balance',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  '@media (width >= 64rem)': {
    fontSize: '18px',
  },
})
export const featurePageLayout2 = style({
  marginTop: metrics.spacing['9'],
  display: 'flex',
  width: '100%',
  maxWidth: '420px',
  flexDirection: 'column',
  gap: metrics.spacing['2_5'],
  '@media (width >= 40rem)': {
    maxWidth: 'none',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export const featurePageButton = style({
  height: metrics.spacing['12'],
  width: '100%',
  paddingInline: metrics.spacing['6'],
  '@media (width >= 40rem)': {
    width: 'auto',
  },
})
export const featurePageLayout3 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: metrics.spacing['2_5'],
  '@media (width >= 40rem)': {
    display: 'contents',
  },
})
export const featurePageButton2 = style({
  height: metrics.spacing['12'],
  width: '100%',
  paddingInline: metrics.spacing['4'],
  '@media (width >= 40rem)': {
    width: 'auto',
    paddingInline: metrics.spacing['6'],
  },
})
export const featurePageLayout4 = style({
  scrollMarginTop: metrics.spacing['12'],
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
})
export const featurePageLayout5 = style({
  display: 'grid',
  gap: metrics.spacing['6'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['10'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    alignItems: 'flex-start',
    gap: metrics.spacing['12'],
    paddingInline: metrics.spacing['8'],
  },
})
export const featurePageLayout6 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
})
export const featurePageHeading = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '20px',
  letterSpacing: '0',
  color: 'var(--foreground)',
  '@media (width >= 64rem)': {
    fontSize: '24px',
  },
})
export const featurePageDescription2 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.4,
  letterSpacing: '0',
  textWrap: 'pretty',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  '@media (width >= 64rem)': {
    maxWidth: '360px',
  },
})
