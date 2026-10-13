import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const linkTokenPolicyLayout5 = style({
  marginBottom: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const linkTokenPolicyLayout6 = style({
  marginTop: tokens.spacing['4'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  paddingInlineEnd: tokens.spacing['8'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})
export const linkTokenPolicyLayout7 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,

  color: inherited.color.colorRed500,
})
