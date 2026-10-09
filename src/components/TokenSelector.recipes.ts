import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const select = style({
  minHeight: metrics.spacing['10'],
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line-strong)',
  backgroundColor: 'var(--surface-input)',
  paddingInline: metrics.spacing['3'],
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  color: 'var(--foreground)',
  selectors: {
    '&:focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '2px',
      outlineColor: 'var(--accent-blue)',
    },
  },
})
