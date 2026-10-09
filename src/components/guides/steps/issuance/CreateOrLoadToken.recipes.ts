import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const createOrLoadTokenLayout = style({
  marginLeft: metrics.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  paddingBlock: metrics.spacing['4'],
})
export const createOrLoadTokenLayout2 = style({
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
export const createOrLoadTokenText = style({
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--text-color-primary)',
})
