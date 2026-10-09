import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const checkFeeAmmPoolLayout3 = style({
  marginTop: tokens.spacing['2'],
  marginBottom: tokens.spacing['3'],
  borderRadius: tokens.radius.lg,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['3'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
})
export const checkFeeAmmPoolLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['1_5'],
})
export const checkFeeAmmPoolLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const checkFeeAmmPoolText = style({
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.gray10,
})
export const checkFeeAmmPoolText2 = style({
  color: tokens.color.gray12,
})
