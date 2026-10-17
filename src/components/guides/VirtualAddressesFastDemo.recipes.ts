import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const virtualAddressesFastDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const virtualAddressesFastDemoButton = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
})
export const virtualAddressesFastDemoLayout2 = style({
  marginInline: tokens.spacing['6'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.emphasis,
  borderColor: tokens.color.gray4,
  paddingInlineStart: tokens.spacing['5'],
  paddingBottom: tokens.spacing['4'],
})
export const virtualAddressesFastDemoLayout3 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const virtualAddressesFastDemoLayout4 = style({
  marginTop: tokens.spacing['2'],
  display: 'grid',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const virtualAddressesFastDemoLayout5 = style({
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0,1fr)',
  alignItems: 'flex-start',
  columnGap: tokens.spacing['4'],
})
export const virtualAddressesFastDemoText = style({
  color: inherited.color.textColorPrimary,
})
export const code = style({
  minWidth: '0',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',

  color: inherited.color.textColorPrimary,
})
export const code2 = style({
  fontFamily: tokens.fontFamily.code,

  color: inherited.color.textColorPrimary,
})
export const virtualAddressesFastDemoLayout6 = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
})
export const virtualAddressesFastDemoLayout7 = style({
  display: 'flex',
  flexDirection: 'column',

  gap: tokens.spacing['1'],
})
export const label = style({
  fontSize: tokens.fontSize.caption,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const virtualAddressesFastDemoInput = style({
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
export const virtualAddressesFastDemoLayout8 = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.caption,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const virtualAddressesFastDemoLayout9 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: tokens.spacing['3'],

  rowGap: tokens.spacing['1'],
})
export const virtualAddressesFastDemoLayout10 = style({
  fontSize: tokens.fontSize.xs,
  letterSpacing: tokens.letterSpacing.tight,

  color: inherited.color.textColorDestructive,
})
export const virtualAddressesFastDemoText2 = style({
  fontFamily: tokens.fontFamily.code,
})
export const virtualAddressesFastDemoLayout11 = style({
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
export const virtualAddressesFastDemoLayout12 = style({
  display: 'grid',
  gap: tokens.spacing['2'],
})
export const code3 = style({
  minWidth: '0',
  fontFamily: tokens.fontFamily.code,
  wordBreak: 'break-all',

  color: inherited.color.textColorPrimary,
})
export const virtualAddressesFastDemoLayout13 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1'],
    },
  },
})
export const code4 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',

  color: inherited.color.textColorPrimary,
})
