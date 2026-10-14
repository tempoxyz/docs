import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const earnDepositDemoText = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
})
export const earnDepositDemoText2 = style({
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const earnDepositDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['6'],
    },
  },
})
export const earnDepositDemoLink = style({
  color: inherited.color.textColorAccent,
  textDecorationLine: 'underline',
})
export const earnDepositDemoLayout2 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
})
export const earnDepositDemoLayout3 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
})
export const label = style({
  display: 'block',
  fontSize: tokens.fontSize.compact,
  fontWeight: tokens.fontWeight.medium,
})
export const earnDepositDemoInput = style({
  ':focus-visible': { '--tempo-style-ring-color': 'var(--accent-blue)' },
  minHeight: tokens.spacing['10'],
  width: '100%',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,
  selectors: {
    '&:focus-visible': {
      '--tempo-style-ring-shadow':
        'var(--tempo-style-ring-inset,) 0 0 0 calc(2px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
      // design-exception: Preserve this surface's layered artwork or focus treatment.
      boxShadow:
        'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
  },
})
export const earnDepositDemoDescription = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const earnDepositDemoDescription2 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
})
export const earnDepositDemoLayout4 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['3'],
    },
  },
  fontSize: tokens.fontSize.compact,
})
export const earnDepositDemoLayout5 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
  fontSize: tokens.fontSize.compact,
})
export const earnDepositDemoDescription3 = style({
  color: tokens.color.gray10,
})
export const earnDepositDemoDescription4 = style({
  fontSize: tokens.fontSize.compact,

  color: inherited.color.textColorDestructive,
})
export const earnDepositDemoButton = style({
  fontSize: tokens.fontSize.compact,
  textDecorationLine: 'underline',
  selectors: {
    '&:disabled': {
      opacity: '50%',
    },
  },
})
export const earnDepositDemoLink2 = style({
  textDecorationLine: 'underline',
})
export const receiptLinkLink = style({
  marginTop: tokens.spacing['2'],
  display: 'block',
  fontSize: tokens.fontSize.compact,

  color: inherited.color.textColorAccent,
  textDecorationLine: 'underline',
})
