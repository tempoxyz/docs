import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const createTokenLayout = style({
  marginLeft: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBlock: metrics.spacing['4'],
})
export const createTokenLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const form = style({
  marginTop: 'calc(var(--spacing) * -2.5)',
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})
export const createTokenLayout3 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
})
export const label = style({
  fontSize: '11px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const createTokenInput = style({
  height: '34px',
  borderRadius: metrics.radius.lg,
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
export const createTokenLayout4 = style({
  position: 'relative',
})
export const createTokenLayout5 = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '10px',
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['4'],
  textAlign: 'center',
  fontSize: '13px',
  lineHeight: 'var(--leading-snug)',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
  color: 'var(--color-gray9)',
})
export const createTokenText = style({
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--text-color-primary)',
})
