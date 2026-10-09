import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const connectedZoneFlowButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const stepBodyLayout = style({
  marginInline: metrics.spacing['6'],
  paddingBottom: metrics.spacing['4'],
})
export const stepBodyLayout2 = style({
  marginTop: metrics.spacing['3'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const stepBodyLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  paddingBlock: metrics.spacing['0_5'],
})
export const detailLineLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: metrics.spacing['2'],
  rowGap: 'var(--spacing)',
  fontSize: '13px',
  letterSpacing: '-0.01em',
})
export const detailLineText = style({
  color: 'var(--color-gray9)',
})
export const detailLineText2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
  color: 'var(--color-gray12)',
})
