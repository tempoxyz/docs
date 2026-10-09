import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const addTokensToWalletLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const addTokensToWalletLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const addTokensToWalletLayout3 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexWrap: 'wrap',
  gap: metrics.spacing['2'],
})
