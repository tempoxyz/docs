import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const payWithFeeTokenLayout3 = style({
  marginTop: tokens.spacing['2'],
  marginBottom: tokens.spacing['3'],
  borderRadius: tokens.radius.lg,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['3'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
})
export const payWithFeeTokenLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['1_5'],
})
export const payWithFeeTokenLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const payWithFeeTokenText = style({
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.gray10,
})
export const payWithFeeTokenText2 = style({
  color: tokens.color.gray12,
})
