import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const payWithFeeTokenButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const payWithFeeTokenLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const payWithFeeTokenLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const payWithFeeTokenLayout3 = style({
  marginTop: metrics.spacing['2'],
  marginBottom: metrics.spacing['3'],
  borderRadius: metrics.radius.lg,
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['3'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
})
export const payWithFeeTokenLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['1_5'],
})
export const payWithFeeTokenLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const payWithFeeTokenText = style({
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--color-gray10)',
})
export const payWithFeeTokenText2 = style({
  color: 'var(--color-gray12)',
})
export const payWithFeeTokenLayout6 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  paddingInlineEnd: metrics.spacing['8'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})
export const payWithFeeTokenLayout7 = style({
  display: 'flex',
  flex: '2 1 0%',
  flexDirection: 'column',
})
export const label = style({
  fontSize: '11px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const payWithFeeTokenInput = style({
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
export const payWithFeeTokenLayout8 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
})
