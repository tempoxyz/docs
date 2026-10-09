import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const modeToggleLayout = style({
  display: 'flex',
  justifyContent: 'flex-end',
})
export const modeToggleText = style({
  display: 'flex',
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
})
export const modeToggleButton = style({
  height: tokens.spacing['8'],
  borderInlineEndStyle: 'solid',
  borderInlineEndWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['3'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.tiny,
  letterSpacing: tokens.letterSpacing.label,
  textTransform: 'uppercase',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:last-child': {
      borderInlineEndStyle: 'solid',
      borderInlineEndWidth: tokens.borderWidth.none,
    },
  },
})
export const modeToggleButton2 = style({
  backgroundColor: tokens.color.elevated,
  color: tokens.color.foreground,
})
export const modeToggleButton3 = style({
  color: inherited.color.colorMixInOklabForeground55Transparent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.block,

        color: inherited.color.colorMixInOklabForeground70Transparent,
      },
    },
  },
})
