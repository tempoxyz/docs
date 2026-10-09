import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const embedPasskeysLayout = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
export const signInButtonsLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
})
export const signInButtonsLayout2 = style({
  display: 'flex',

  gap: tokens.spacing['1'],
})
export const signInButtonsLayout3 = style({
  maxWidth: '22rem',
  borderRadius: tokens.radius.smRem,

  backgroundColor: inherited.color.backgroundColorDestructiveTint,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,

  lineHeight: inherited.lineHeight.leadingNormal,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,

  color: inherited.color.textColorDestructive,
})
