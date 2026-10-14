import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const passkeyAccountDemoText = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.gray12,
})
export const passkeyAccountDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const passkeyAccountDemoLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['3'],
    },
  },
})
export const passkeyAccountDemoDescription = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.gray10,
})
export const code = style({
  display: 'block',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.sm,
  wordBreak: 'break-all',
  color: tokens.color.gray12,
})
export const passkeyAccountDemoLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.spacing['2'],
})
export const passkeyAccountDemoDescription2 = style({
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const passkeyAccountDemoLink = style({
  display: 'inline-flex',
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
export const passkeyAccountDemoDescription3 = style({
  fontSize: tokens.fontSize.compact,

  color: inherited.color.textColorDestructive,
})
