import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const select = style({
  minHeight: tokens.spacing['10'],
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.lineStrong,

  backgroundColor: inherited.color.surfaceInput,
  paddingInline: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  color: tokens.color.foreground,
  selectors: {
    '&:focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '2px',
      outlineColor: tokens.color.accent,
    },
  },
})
