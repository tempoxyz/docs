import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const passkeyLoginLayout = style({
  display: 'flex',

  gap: tokens.spacing['1'],
})
export const passkeyLoginButton = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
})
export const virtualAddressesLiveDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const virtualAddressesLiveDemoLayout2 = style({
  marginInline: tokens.spacing['6'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.emphasis,
  borderColor: tokens.color.gray4,
  paddingInlineStart: tokens.spacing['5'],
  paddingBottom: tokens.spacing['4'],
})
export const virtualAddressesLiveDemoLayout3 = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',

  gap: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const virtualAddressesLiveDemoText = style({
  color: inherited.color.textColorPrimary,
})
export const code = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',

  color: inherited.color.textColorPrimary,
})
export const virtualAddressesLiveDemoLayout4 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const virtualAddressesLiveDemoLayout5 = style({
  marginTop: tokens.spacing['2'],
  display: 'grid',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const code2 = style({
  fontFamily: tokens.fontFamily.code,

  color: inherited.color.textColorPrimary,
})
export const virtualAddressesLiveDemoLayout6 = style({
  marginTop: tokens.spacing['2'],
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
  '@media (width < 40rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const virtualAddressesLiveDemoLayout7 = style({
  gridColumn: '1 / -1',
})
export const virtualAddressesLiveDemoLayout8 = style({
  marginTop: tokens.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['3'],
    },
  },
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const virtualAddressesLiveDemoText2 = style({
  display: 'inline-flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: tokens.spacing['3'],

  rowGap: tokens.spacing['1'],
})
export const virtualAddressesLiveDemoText3 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,

  color: inherited.color.textColorPrimary,
})
export const virtualAddressesLiveDemoLayout9 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: tokens.spacing['2'],
  '@media (width < 40rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const virtualAddressesLiveDemoLayout10 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1'],
    },
  },
})
