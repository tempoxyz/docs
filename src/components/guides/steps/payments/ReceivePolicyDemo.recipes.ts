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
/** An address or transaction hash with a copy button. This devnet has no public explorer. */
export const copyValue = style({
  marginTop: tokens.spacing['1'],
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const copyValueCode = style({
  minWidth: '0',
  // Vocs pads inline code; the value sits flush beside its copy button.
  paddingInline: tokens.spacing['0'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray12,
})
export const copyValueButton = style({
  display: 'grid',
  flexShrink: 0,
  placeItems: 'center',
  color: tokens.color.gray9,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.gray12,
      },
    },
  },
})
export const copyValueIcon = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
})
