import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'

export const mintFeeAmmLiquidityLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  paddingBottom: metrics.spacing['4'],
})

export const mintFeeAmmLiquidityLayout3 = style({
  marginTop: metrics.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(var(--spacing) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd: 'calc(var(--spacing) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const mintFeeAmmLiquidityLayout4 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
  fontSize: '13px',
})
export const lucideCheck = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  color: 'var(--color-green9)',
})
export const lucideCircle = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  color: 'var(--color-gray9)',
})
export const mintFeeAmmLiquidityText = style({
  width: metrics.spacing['20'],
  fontFamily: 'var(--font-jetbrains-mono)',
})
export const mintFeeAmmLiquidityText2 = style({
  marginTop: 'calc(var(--spacing) * -1)',
})
