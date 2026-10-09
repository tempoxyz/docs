import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const burnFeeAmmLiquidityButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const burnFeeAmmLiquidityLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const burnFeeAmmLiquidityLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
