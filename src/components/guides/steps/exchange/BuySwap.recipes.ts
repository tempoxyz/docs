import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const buySwapLayout = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
})
export const buySwapLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const buySwapHeading = style({
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  fontWeight: tokens.fontWeight.semibold,
})

export const buySwapLayout3 = style({
  fontSize: tokens.fontSize.sm,

  color: inherited.color.colorRed500,
})
export const buySwapLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
})
export const buySwapLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  gap: tokens.spacing['1'],
})
export const buySwapText = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.gray11,
})
export const buySwapText2 = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.gray12,
})
