import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const sendRelayerSponsoredPaymentButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const sendRelayerSponsoredPaymentLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const sendRelayerSponsoredPaymentLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const sendRelayerSponsoredPaymentLayout3 = style({
  marginTop: metrics.spacing['2'],
  marginBottom: metrics.spacing['3'],
  borderRadius: metrics.radius.lg,
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['3'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
})
export const sendRelayerSponsoredPaymentLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['1_5'],
})
export const sendRelayerSponsoredPaymentLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const sendRelayerSponsoredPaymentText = style({
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--color-gray10)',
})
export const sendRelayerSponsoredPaymentText2 = style({
  color: 'var(--color-gray12)',
})
export const sendRelayerSponsoredPaymentLayout6 = style({
  marginTop: metrics.spacing['2'],
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--color-gray4)',
  paddingTop: metrics.spacing['2'],
  fontSize: '12px',
  color: 'var(--color-gray9)',
})
export const sendRelayerSponsoredPaymentLayout7 = style({
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
export const sendRelayerSponsoredPaymentLayout8 = style({
  display: 'flex',
  flex: '2 1 0%',
  flexDirection: 'column',
})
export const label = style({
  fontSize: '11px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const sendRelayerSponsoredPaymentInput = style({
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
export const sendRelayerSponsoredPaymentLayout9 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
})
