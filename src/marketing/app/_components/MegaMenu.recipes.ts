import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const arrowUpRight = style({
  position: 'absolute',
  top: metrics.spacing['2_5'],
  right: metrics.spacing['3'],
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group\\/item):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
      },
    },
  },
})
export const megaItemText = style({
  display: 'grid',
  width: '34px',
  height: '34px',
  flexShrink: 0,
  placeItems: 'center',
  backgroundColor: 'var(--surface-input)',
  color: 'var(--foreground)',
})
export const megaItemText2 = style({
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: metrics.spacing['0_5'],
})
export const megaItemText3 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const megaItemText4 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '13px',
  lineHeight: 1.4,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const megaMenuLayout = style({
  width: '360px',
  padding: metrics.spacing['3'],
})
export const megaMenuList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing)',
})
export const megaMenuLayout2 = style({
  display: 'flex',
  width: 'max-content',
  gap: 'var(--spacing)',
  padding: metrics.spacing['3'],
})
export const megaMenuLayout3 = style({
  width: '224px',
})
export const megaItemStateState = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  gap: metrics.spacing['3'],
  borderRadius: '4px',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2_5'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
      },
    },
  },
})
