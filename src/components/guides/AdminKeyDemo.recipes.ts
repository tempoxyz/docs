import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const adminKeyDemoText = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
})
export const adminKeyDemoText2 = style({
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const adminKeyDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['5'],
    },
  },
})
export const adminKeyDemoLink = style({
  borderRadius: tokens.radius.lg,
  backgroundColor: tokens.color.black,
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,
  color: tokens.color.white,
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        backgroundColor: tokens.color.white,
        color: tokens.color.black,
      },
  },
})
export const adminKeyDemoLayout2 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const adminKeyDemoLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: tokens.spacing['4'],

  rowGap: tokens.spacing['1'],
})
export const adminKeyDemoLayout4 = style({
  marginTop: tokens.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1'],
    },
  },
  fontSize: tokens.fontSize.compact,
})
export const adminKeyDemoLayout5 = style({
  fontFamily: tokens.fontFamily.code,
  wordBreak: 'break-all',
})
export const adminKeyDemoLayout6 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
export const adminKeyDemoLayout7 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
})
export const adminKeyDemoDescription = style({
  fontSize: tokens.fontSize.compact,

  color: inherited.color.textColorDestructive,
})
export const adminKeyDemoButton = style({
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
  textDecorationLine: 'underline',
  textUnderlineOffset: '4px',
  selectors: {
    '&:disabled': {
      opacity: '50%',
    },
  },
})
