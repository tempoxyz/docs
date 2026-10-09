import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const createTokenLayout = style({
  marginInlineStart: tokens.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  paddingBlock: tokens.spacing['4'],
})

export const form = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginTop: 'calc(var(--spacing) * -2.5) !custom',
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})

export const createTokenInput = style({
  height: '34px',
  borderRadius: tokens.radius.lg,
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
export const createTokenLayout4 = style({
  position: 'relative',
})
export const createTokenLayout5 = style({
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
export const createTokenText = style({
  fontWeight: tokens.fontWeight.medium,

  color: inherited.color.textColorPrimary,
})
