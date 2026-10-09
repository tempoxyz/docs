import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'

export const addFundsToOthersLayout3 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
})

export const addFundsToOthersInput = style({
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
