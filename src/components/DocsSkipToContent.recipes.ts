import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'

export const skipToContent = style({
  position: 'fixed',
  top: tokens.spacing['3'],
  insetInlineStart: tokens.spacing['3'],
  zIndex: tokens.zIndex.dialog,
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.foreground,
  backgroundColor: tokens.color.background,
  borderWidth: tokens.borderWidth.emphasis,
  borderStyle: 'dashed',
  borderColor: tokens.color.foreground,
  borderRadius: tokens.radius.md,
  outlineStyle: 'none',
  opacity: 0,
  pointerEvents: 'none',
  translate: '0 -100%',
  transitionProperty: 'opacity',
  transitionDuration: '150ms',
  selectors: {
    '&:focus': {
      opacity: 1,
      pointerEvents: 'auto',
      translate: '0',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
