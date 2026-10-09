import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const footerFooter = style({
  position: 'relative',
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: 'var(--line)',
})
export const footerLayout = style({
  display: 'grid',
  gap: metrics.spacing['12'],
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['12'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'minmax(220px,1fr) 2fr',
    gap: metrics.spacing['16'],
    paddingInline: metrics.spacing['8'],
    paddingBlock: metrics.spacing['16'],
  },
})
export const footerLayout2 = style({
  display: 'flex',
  maxWidth: '320px',
  flexDirection: 'column',
  gap: metrics.spacing['4'],
})
export const link = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
})
export const tempoLogo = style({
  height: '18px',
  width: '80px',
  color: 'var(--foreground)',
})
export const footerDescription = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  lineHeight: 1.6,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
})
export const footerLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: metrics.spacing['4'],
  rowGap: metrics.spacing['2'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const link2 = style({
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
export const footerLayout4 = style({
  marginTop: metrics.spacing['6'],
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['6'],
  '@media (width >= 64rem)': {
    marginTop: 'auto',
    paddingTop: metrics.spacing['12'],
  },
})
export const nav = style({
  display: 'flex',
  height: metrics.spacing['9'],
  alignItems: 'center',
})
export const footerLayout5 = style({
  display: 'flex',
  alignItems: 'center',
})
export const footerText = style({
  marginInline: metrics.spacing['2'],
  height: metrics.spacing['4'],
  width: '1px',
  backgroundColor: 'var(--line)',
})
export const footerLink = style({
  display: 'flex',
  width: metrics.spacing['9'],
  height: metrics.spacing['9'],
  alignItems: 'center',
  justifyContent: 'center',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
export const icon = style({
  width: '19px',
  height: '19px',
})
export const nav2 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: metrics.spacing['8'],
  rowGap: metrics.spacing['10'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const footerLayout6 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['4'],
})
export const footerDescription2 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const footerList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
})
export const footerStateState = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
