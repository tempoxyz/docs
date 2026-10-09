import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const sendPaymentWithMemoLayout3 = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  paddingInlineEnd: tokens.spacing['8'],
})
export const sendPaymentWithMemoLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
})

export const sendPaymentWithMemoLayout5 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})

export const sendPaymentWithMemoLayout7 = style({
  marginTop: tokens.spacing['2'],
})
export const sendPaymentWithMemoLayout8 = style({
  marginTop: tokens.spacing['3'],
  borderRadius: tokens.radius.lg,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['2'],
})
export const sendPaymentWithMemoDescription = style({
  marginBottom: tokens.spacing['1'],
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray9,
})
export const sendPaymentWithMemoLayout9 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray11,
})
export const sendPaymentWithMemoText2 = style({
  color: tokens.color.gray9,
})
