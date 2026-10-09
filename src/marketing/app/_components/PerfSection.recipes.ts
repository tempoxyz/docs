import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const tpsSparkIcon = style({
  height: metrics.spacing['40'],
  width: '100%',
})
export const laneSparkLayout = style({
  position: 'relative',
  height: metrics.spacing['40'],
  overflow: 'hidden',
})
export const laneSparkLayout2 = style({
  position: 'absolute',
  insetInline: '0',
  top: '0',
  height: '58%',
})
export const laneSparkLayout3 = style({
  position: 'absolute',
  inset: '0',
  backgroundColor: 'var(--background)',
})
export const laneSparkDescription = style({
  position: 'absolute',
  top: metrics.spacing['2'],
  left: metrics.spacing['3'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '9px',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const laneSparkIcon = style({
  position: 'absolute',
  insetInline: '0',
  bottom: '0',
  height: 'calc(3 / 5 * 100%)',
  width: '100%',
})
export const laneSparkLayout4 = style({
  position: 'absolute',
  insetInline: '0',
  top: '58%',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  '--tempo-style-border-style': 'dashed',
  borderStyle: 'dashed',
  borderColor: 'var(--line-strong)',
})
export const laneSparkLayout5 = style({
  position: 'absolute',
  insetInline: '0',
  bottom: '0',
  height: '42%',
  backgroundColor: 'color-mix(in oklab, var(--indicator-green) 5%, transparent)',
})
export const laneSparkDescription2 = style({
  position: 'absolute',
  top: metrics.spacing['2'],
  left: metrics.spacing['3'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '9px',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--indicator-green) 80%, transparent)',
})
export const laneSparkIcon2 = style({
  position: 'absolute',
  inset: '0',
  height: '100%',
  width: '100%',
})
export const path = style({
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const uptimeSparkLayout = style({
  display: 'flex',
  height: metrics.spacing['20'],
  alignItems: 'stretch',
  gap: '2px',
})
export const uptimeSparkLayout2 = style({
  flex: '1 1 0%',
  borderRadius: '1px',
  backgroundColor: 'color-mix(in oklab, var(--indicator-green) 65%, transparent)',
})
export const link = style({
  display: 'flex',
  height: '100%',
  minHeight: '310px',
  flexDirection: 'column',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['6'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-card)',
      },
    },
  },
  '@media (width >= 40rem)': {
    minHeight: '360px',
  },
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['8'],
  },
})
export const statCardLayout = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
})
export const statCardDescription = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '17px',
  lineHeight: 1.2,
  letterSpacing: '0',
  color: 'var(--foreground)',
  '@media (width >= 64rem)': {
    fontSize: '20px',
  },
})
export const statCardDescription2 = style({
  marginTop: metrics.spacing['2'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '24px',
  letterSpacing: '-0.01em',
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
  '@media (width >= 64rem)': {
    fontSize: '28px',
  },
})
export const arrowUpRight = style({
  marginTop: 'var(--spacing)',
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
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
export const statCardLayout2 = style({
  display: 'flex',
  flex: '1 1 0%',
  alignItems: 'center',
  paddingBlock: metrics.spacing['8'],
})
export const statCardDescription3 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(3rem, 7vw, 5.25rem)',
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
})
export const statCardLayout3 = style({
  marginBlock: 'auto',
  paddingBlock: metrics.spacing['8'],
  selectors: {
    '&:empty': {
      display: 'none',
    },
  },
})
export const statCardDescription4 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '13px',
  lineHeight: 1.5,
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const perfSectionSection = style({
  position: 'relative',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
})
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: metrics.spacing['5'],
  textAlign: 'center',
})
export const perfSectionHeading = style({
  maxWidth: '700px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2rem, 6vw, 3rem)',
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const perfSectionButton = style({
  marginTop: metrics.spacing['9'],
})
export const reveal2 = style({
  marginTop: metrics.spacing['14'],
})
export const perfSectionLayout = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 40rem)': {
    gridAutoRows: 'minmax(0, 1fr)',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
  },
})
export const perfSectionStateState = style({
  '@media (width >= 40rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
  },
  '@media (width >= 64rem)': {
    gridColumn: 'span 2 / span 2',
  },
})
export const perfSectionStateState2 = style({
  '@media (width >= 40rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
  },
  '@media (width >= 64rem)': {
    gridColumn: 'span 3 / span 3',
  },
})

export const throughputCard = style({
  '@media (width >= 64rem)': { gridColumn: 'span 4 / span 4' },
})
export const uptimeCard = style({ '@media (width >= 64rem)': { gridColumn: 'span 3 / span 3' } })
