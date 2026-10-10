import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const themeToggleLayout = style({
  display: 'flex',
  width: 'fit-content',
  alignItems: 'center',
  borderRadius: tokens.radius.full,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.block,
  padding: tokens.spacing['0_5'],
})
export const sunIconIcon = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
})

export const themeOption = style({
  position: 'relative',
  display: 'flex',
  width: tokens.spacing['7'],
  height: tokens.spacing['7'],
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: tokens.radius.full,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: 'transparent !custom',
  color: tokens.color.muted,
  transition: 'color 150ms, background-color 150ms, border-color 150ms',
  ':hover': { color: tokens.color.foreground },
  ':has(input:checked)': {
    borderColor: tokens.color.lineStrong,
    backgroundColor: tokens.color.shell,
    color: tokens.color.foreground,
  },
  ':has(input:focus-visible)': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
    outlineOffset: '3px',
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
export const themeRadio = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  opacity: 0,
  cursor: 'pointer',
})
