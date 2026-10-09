import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const cancelOrderLayout3 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.xs,

  lineHeight: inherited.lineHeight.textXsLineHeight,

  color: inherited.color.colorGray600,
})
