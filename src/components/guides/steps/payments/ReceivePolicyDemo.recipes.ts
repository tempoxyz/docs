import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const receivePolicyDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['5'],
    },
  },
})
export const receivePolicyDemoDescription = style({
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray9,
})
export const receivePolicyDemoDescription2 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray9,
})
export const receivePolicyDemoLayout2 = style({
  marginTop: tokens.spacing['3'],
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.spacing['4'],
})
export const receivePolicyDemoDescription3 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
})
export const receivePolicyDemoDescription4 = style({
  marginTop: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,

  color: inherited.color.textColorDestructive,
})
export const code = style({
  display: 'block',
  wordBreak: 'break-all',
})
