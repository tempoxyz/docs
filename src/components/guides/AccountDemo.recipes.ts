import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'

// Shared by the access key, P-256 key, and account upgrade demos, which use one layout.
export const accountDemoTitle = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
})
export const accountDemoMuted = style({
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const accountDemoSteps = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['5'],
    },
  },
})
export const accountDemoLink = style({
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
export const accountDemoNote = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const accountDemoNoteTight = style({
  marginTop: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const accountDemoAddress = style({
  marginTop: tokens.spacing['2'],
  wordBreak: 'break-all',
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const accountDemoResult = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
})
export const accountDemoError = style({
  fontSize: tokens.fontSize.compact,

  color: inherited.color.textColorDestructive,
})
export const accountDemoHash = style({
  color: tokens.color.gray10,
})
