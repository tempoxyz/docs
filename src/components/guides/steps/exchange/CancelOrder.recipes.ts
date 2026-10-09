import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const cancelOrderButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const cancelOrderLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const cancelOrderLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const cancelOrderLayout3 = style({
  marginTop: metrics.spacing['2'],
  fontSize: metrics.fontSize.xs,
  lineHeight: 'var(--text-xs--line-height)',
  color: 'var(--color-gray-600)',
})
