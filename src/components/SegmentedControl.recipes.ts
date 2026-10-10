import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'

// TDS Platform SegmentedControl (tempoxyz/ds@3fd4cf7), ported by hand. The DS
// swaps the selected fill instantly; here the fill fades with the shared motion.
export const control = style({
  display: 'flex',
  boxSizing: 'border-box',
  maxWidth: '100%',
  padding: tokens.spacing['1'],
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  backgroundColor: tokens.color.container,
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollbarWidth: 'none',
})

export const item = style({
  display: 'flex',
  flex: '1 0 auto',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing['1_5'],
  boxSizing: 'border-box',
  minWidth: '80px',
  height: '40px',
  paddingBlock: tokens.spacing['1'],
  paddingInline: tokens.spacing['4'],
  border: 0,
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: 'transparent !custom',
  color: inherited.color.vocsTextColorPrimary,
  fontFamily: 'inherit !custom',
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.caption,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&[data-checked]': {
      backgroundColor: tokens.color.card,
      transitionDuration: 'var(--tempo-enter)',
    },
    '&:focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: 'currentColor !custom',
      outlineOffset: '-2px',
    },
    '&:disabled': { cursor: 'default' },
    '& > svg': { flexShrink: 0, width: '14px', height: '14px' },
  },
})
