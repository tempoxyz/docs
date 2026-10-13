import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const sellSwapLayout = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
})
export const sellSwapLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const sellSwapHeading = style({
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  fontWeight: tokens.fontWeight.semibold,
})

export const sellSwapLayout3 = style({
  fontSize: tokens.fontSize.sm,

  color: inherited.color.colorRed500,
})
export const sellSwapLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
})
export const sellSwapLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  gap: tokens.spacing['1'],
})
export const sellSwapText = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.gray11,
})
export const sellSwapText2 = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.gray12,
})
