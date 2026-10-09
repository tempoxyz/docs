import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const tokenListDemoButton = style({
  textDecorationLine: 'underline',
})
export const tokenListDemoList = style({
  display: 'grid',
  listStyleType: 'none',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: metrics.spacing['2'],
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const tokenListDemoLink = style({
  display: 'flex',
  height: '100%',
  minWidth: '0',
  alignItems: 'center',
  gap: metrics.spacing['2'],
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  padding: metrics.spacing['2'],
  textDecorationLine: 'none',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray2)',
      },
    },
  },
})
export const img = style({
  width: metrics.spacing['7'],
  height: metrics.spacing['7'],
  flexShrink: 0,
})
export const tokenListDemoText = style({
  minWidth: '0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  fontWeight: metrics.fontWeight.medium,
})
