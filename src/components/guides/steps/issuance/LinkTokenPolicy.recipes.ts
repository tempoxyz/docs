import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const linkTokenPolicyButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const linkTokenPolicyLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const linkTokenPolicyLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const linkTokenPolicyLayout3 = style({
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
export const linkTokenPolicyLayout4 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
})
export const linkTokenPolicyLayout5 = style({
  marginBottom: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const linkTokenPolicyLayout6 = style({
  marginTop: metrics.spacing['4'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  paddingInlineEnd: metrics.spacing['8'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})
export const linkTokenPolicyLayout7 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  color: 'var(--color-red-500)',
})
