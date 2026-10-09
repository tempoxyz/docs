import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const makeSwapsLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const makeSwapsLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const makeSwapsLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['6'],
})
