import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'

export const checkFeeAmmPoolLayout3 = style({
  marginTop: metrics.spacing['2'],
  marginBottom: metrics.spacing['3'],
  borderRadius: metrics.radius.lg,
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['3'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
})
export const checkFeeAmmPoolLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['1_5'],
})
export const checkFeeAmmPoolLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const checkFeeAmmPoolText = style({
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--color-gray10)',
})
export const checkFeeAmmPoolText2 = style({
  color: 'var(--color-gray12)',
})
