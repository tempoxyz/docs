import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const addFundsToOthersLayout3 = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
})

export const addFundsToOthersInput = style({
  height: '34px',
  borderRadius: tokens.radius.full,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  paddingInline: tokens.spacing.controlInset,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.black,
  selectors: {
    '&::placeholder': {
      color: tokens.color.gray9,
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: tokens.color.white,
      },
  },
})
