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

// A transaction hash with a copy button. The devnet has no public explorer.
export const accountDemoTx = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['0_5'],
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  color: tokens.color.gray10,
})
export const accountDemoTxHash = style({
  // Vocs pads inline code; the hash sits flush beside its copy button.
  paddingInline: tokens.spacing['0'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
})
export const accountDemoTxCopy = style({
  display: 'grid',
  width: tokens.spacing['5'],
  height: tokens.spacing['5'],
  placeItems: 'center',
  borderRadius: tokens.radius.sm,
  color: tokens.color.gray10,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
        color: tokens.color.gray12,
      },
    },
  },
})
export const accountDemoTxIcon = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
})
export const accountDemoChoices = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: tokens.spacing['2'],
})
