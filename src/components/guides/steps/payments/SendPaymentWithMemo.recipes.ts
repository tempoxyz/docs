import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'

export const sendPaymentWithMemoLayout3 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  paddingInlineEnd: metrics.spacing['8'],
})
export const sendPaymentWithMemoLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
})

export const sendPaymentWithMemoLayout5 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})

export const sendPaymentWithMemoLayout7 = style({
  marginTop: metrics.spacing['2'],
})
export const sendPaymentWithMemoLayout8 = style({
  marginTop: metrics.spacing['3'],
  borderRadius: metrics.radius.lg,
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['2'],
})
export const sendPaymentWithMemoDescription = style({
  marginBottom: 'var(--spacing)',
  fontSize: '11px',
  color: 'var(--color-gray9)',
})
export const sendPaymentWithMemoLayout9 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  color: 'var(--color-gray11)',
})
export const sendPaymentWithMemoText2 = style({
  color: 'var(--color-gray9)',
})
