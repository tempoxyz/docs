import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const transferResultLayout = style({
  display: 'flex',
  flexDirection: 'column',
})
export const transferResultLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
})
export const transferResultText = style({
  marginTop: 'var(--spacing)',
  fontSize: '13px',
  color: 'var(--color-gray9)',
})
export const transferResultText2 = style({
  marginTop: 'var(--spacing)',
  fontSize: '13px',
  color: 'var(--color-red-500)',
})
export const transferResultLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: metrics.spacing['3'],
  rowGap: 'var(--spacing)',
  paddingLeft: metrics.spacing['2'],
  fontSize: '10px',
  color: 'var(--color-gray9)',
})
export const transferResultText3 = style({
  animation: 'var(--animate-pulse)',
})
export const sendParallelPaymentsButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const sendParallelPaymentsLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const sendParallelPaymentsLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const sendParallelPaymentsLayout3 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  gap: metrics.spacing['3'],
})
export const sendParallelPaymentsLayout4 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
})
export const label = style({
  fontSize: '11px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const sendParallelPaymentsInput = style({
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
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '60%',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: 'var(--color-white)',
      },
  },
})
export const sendParallelPaymentsLayout5 = style({
  display: 'flex',
  alignItems: 'flex-start',
})
export const sendParallelPaymentsLayout6 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing)',
})
