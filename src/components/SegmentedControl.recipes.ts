import { style, vars as tokens } from '../styles/theme'

// DS Web SegmentedControl geometry (tempoxyz/ds@3fd4cf7), ported by hand. The selected
// item takes the docs' one selected look, the container chip with primary medium text,
// on a page-colored track inside a hairline; the fill fades with the shared motion.
export const control = style({
  display: 'flex',
  boxSizing: 'border-box',
  maxWidth: '100%',
  padding: tokens.spacing['1'],
  // A 32-high track at radius 8; items inset 4 take radius 4 (8 - 4).
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  // An inset outline draws the hairline without adding to the 32 height.
  outlineWidth: tokens.borderWidth.hairline,
  outlineStyle: 'solid',
  outlineColor: tokens.color.hairline,
  outlineOffset: '-1px',
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollbarWidth: 'none',
  // When the items overflow (five agents at phone width), the clipped edge fades so
  // the control reads as scrollable. SegmentedControl.tsx sets data-overflow.
  selectors: {
    '&[data-overflow="end"]': {
      // design-exception: Fades the clipped end, matching the docs section nav's scroll fade.
      maskImage: 'linear-gradient(to right, black calc(100% - 32px), transparent) !custom',
    },
    '&[data-overflow="start"]': {
      // design-exception: Fades the clipped start, matching the docs section nav's scroll fade.
      maskImage: 'linear-gradient(to right, transparent, black 32px) !custom',
    },
    '&[data-overflow="both"]': {
      // design-exception: Fades both clipped edges, matching the docs section nav's scroll fade.
      maskImage:
        'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent) !custom',
    },
  },
})

export const item = style({
  display: 'flex',
  flex: '1 0 auto',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing['1_5'],
  boxSizing: 'border-box',
  minWidth: '80px',
  height: '24px',
  paddingBlock: tokens.spacing['0'],
  paddingInline: tokens.spacing['3'],
  border: 0,
  borderRadius: tokens.radius.sm,
  '--corner-radius': tokens.radius.sm,
  backgroundColor: 'transparent !custom',
  color: tokens.color.muted,
  fontFamily: 'inherit !custom',
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&[data-checked]': {
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.medium,
      backgroundColor: tokens.color.container,
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
  '@media (hover: hover)': {
    selectors: {
      '&:not([data-checked]):not(:disabled):hover': {
        backgroundColor: tokens.color.containerSubtle,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
})
