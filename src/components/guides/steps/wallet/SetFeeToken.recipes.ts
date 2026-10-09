import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const setFeeTokenLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: metrics.spacing['2'],
})
export const select = style({
  height: '32px',
  borderRadius: 'calc(infinity * 1px)',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--color-white)',
  paddingInline: metrics.spacing['3'],
  fontSize: '14px',
  fontWeight: metrics.fontWeight.medium,
  letterSpacing: '-0.02em',
  color: 'var(--color-black)',
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        backgroundColor: 'transparent',
        color: 'var(--color-white)',
      },
  },
})

export const setFeeTokenLayout4 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
})

export const setFeeTokenInput = style({
  height: '34px',
  borderRadius: 'calc(infinity * 1px)',
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
export const setFeeTokenLayout5 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  color: 'var(--color-gray9)',
})
export const setFeeTokenText = style({
  color: 'var(--color-black)',
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: 'var(--color-white)',
      },
  },
})
