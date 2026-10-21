import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const createOrLoadTokenLayout = style({
  marginInlineStart: tokens.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  paddingBlock: tokens.spacing['4'],
})
export const createOrLoadTokenLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  borderRadius: tokens.radius.lg,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['4'],
  textAlign: 'center',
  fontSize: tokens.fontSize.compact,

  lineHeight: inherited.lineHeight.leadingSnug,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.gray9,
})
export const createOrLoadTokenText = style({
  fontWeight: tokens.fontWeight.medium,

  color: inherited.color.textColorPrimary,
})
