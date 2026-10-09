import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'

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
