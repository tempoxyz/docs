import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const setFeeTokenLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
export const select = style({
  height: '32px',
  borderRadius: tokens.radius.full,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  backgroundColor: tokens.color.white,
  paddingInline: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.black,
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        backgroundColor: 'transparent !custom',
        color: tokens.color.white,
      },
  },
})

export const setFeeTokenLayout4 = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
})

export const setFeeTokenInput = style({
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
export const setFeeTokenLayout5 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray9,
})
export const setFeeTokenText = style({
  color: tokens.color.black,
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: tokens.color.white,
      },
  },
})
