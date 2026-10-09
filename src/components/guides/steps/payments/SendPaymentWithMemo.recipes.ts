import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const sendPaymentWithMemoButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const sendPaymentWithMemoLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const sendPaymentWithMemoLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
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
export const label = style({
  fontSize: '11px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const sendPaymentWithMemoInput = style({
  height: '34px',
  borderRadius: '50px',
  borderStyle: 'solid',
  borderWidth: '1px',
  paddingInline: 'calc(var(--spacing) * 3.25)',
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
  color: 'var(--color-black)',
  selectors: {
    '&::placeholder': {
      color: 'var(--color-gray9)',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: 'var(--color-white)',
      },
  },
})
export const sendPaymentWithMemoInput2 = style({
  borderColor: 'var(--color-red-500)',
})
export const sendPaymentWithMemoInput3 = style({
  borderColor: 'var(--color-gray4)',
})
export const sendPaymentWithMemoText = style({
  marginTop: 'var(--spacing)',
  fontSize: '11px',
  color: 'var(--color-red-500)',
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
export const sendPaymentWithMemoLayout6 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
})
export const sendPaymentWithMemoInput4 = style({
  height: '34px',
  borderRadius: '50px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  paddingInline: 'calc(var(--spacing) * 3.25)',
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
  color: 'var(--color-black)',
  selectors: {
    '&::placeholder': {
      color: 'var(--color-gray9)',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: 'var(--color-white)',
      },
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
