import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'

// TDS Platform IconButton, secondary, small scale (tempoxyz/ds@3fd4cf7): 32 x 32
// at radius 8, like every 32-high control.
export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
  width: '32px',
  height: '32px',
  padding: tokens.spacing['0'],
  border: 0,
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: tokens.color.container,
  color: inherited.color.vocsTextColorPrimary,
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '& > svg': { flexShrink: 0, width: '16px', height: '16px' },
    '&:focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: 'currentColor !custom',
      outlineOffset: '2px',
    },
    '&:disabled': { cursor: 'default' },
  },
  '@media (hover: hover)': {
    ':hover': {
      backgroundColor: tokens.color.containerStrong,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
})
