import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const createTokenPolicyButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const createTokenPolicyLayout = style({
  marginInline: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
})
export const createTokenPolicyLayout2 = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const createTokenPolicyLayout3 = style({
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
export const createTokenPolicyLayout4 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
})
export const createTokenPolicyLayout5 = style({
  marginBottom: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const createTokenPolicyLayout6 = style({
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
export const createTokenPolicyLayout7 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  color: 'var(--color-red-500)',
})
