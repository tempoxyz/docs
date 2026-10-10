import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const payWithIssuedTokenLayout3 = style({
  marginTop: tokens.spacing['2'],
  marginBottom: tokens.spacing['3'],
  borderRadius: tokens.radius.lg,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['3'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
})
export const payWithIssuedTokenLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['1_5'],
})
export const payWithIssuedTokenLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})
export const payWithIssuedTokenText = style({
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.gray10,
})
export const payWithIssuedTokenText2 = style({
  color: tokens.color.gray12,
})
