import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const connectedZoneFlowButton = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
})
export const stepBodyLayout = style({
  marginInline: tokens.spacing['6'],
  paddingBottom: tokens.spacing['4'],
})
export const stepBodyLayout2 = style({
  marginTop: tokens.spacing['3'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.emphasis,
  borderColor: tokens.color.gray4,
  paddingInlineStart: tokens.spacing['5'],
})
export const stepBodyLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  paddingBlock: tokens.spacing['0_5'],
})
export const detailLineLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: tokens.spacing['2'],

  rowGap: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
})
export const detailLineText = style({
  color: tokens.color.gray9,
})
export const detailLineText2 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',
  color: tokens.color.gray12,
})
