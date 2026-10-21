import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const list = style({ display: 'flex', flexDirection: 'column', gap: tokens.spacing['2'] })
export const card = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3'],
  borderRadius: tokens.radius.md,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: inherited.color.vocsBorderColorPrimary,

  backgroundColor: inherited.color.colorMixInSrgbSurfaceBlock70Transparent,

  paddingBlock: tokens.spacing['2_5'],
  paddingInline: tokens.spacing['3'],
  textDecoration: 'none',
  transition: 'background-color 150ms',
  ':hover': { backgroundColor: tokens.color.block },
  ':focus-visible': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
    outlineOffset: '3px',
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
export const icon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,

  color: inherited.color.vocsTextColorSecondary,
})
export const copy = style({ display: 'flex', flexDirection: 'column', minWidth: 0 })
export const title = style({
  fontWeight: tokens.fontWeight.medium,
  fontSize: tokens.fontSize.sm,

  color: inherited.color.vocsTextColorHeading,
})
export const description = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  color: inherited.color.vocsTextColorSecondary,
  fontSize: tokens.fontSize.xs,
})
