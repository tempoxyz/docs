import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'

// TDS Platform Tab, small scale (tempoxyz/ds@3fd4cf7), ported by hand: gray pills,
// the active tab inverted. Fill and color fade with the shared motion.
export const list = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.spacing['1'],
})

export const tab = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  minWidth: '80px',
  height: '32px',
  paddingBlock: tokens.spacing['1'],
  paddingInline: tokens.spacing['4'],
  border: 0,
  borderRadius: tokens.radius.full,
  backgroundColor: tokens.color.container,
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
    '&[aria-selected="true"]': {
      backgroundColor: inherited.color.backgroundColorInvert,
      color: inherited.color.textColorInvert,
      transitionDuration: 'var(--tempo-enter)',
    },
    // The ring sits outside the pill, so it takes the page's primary color: the
    // selected tab's own (inverted) color would vanish against the page.
    '&:focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: inherited.color.vocsTextColorPrimary,
      outlineOffset: '2px',
    },
  },
  '@media (hover: hover)': {
    ':hover:not([aria-selected="true"])': {
      backgroundColor: tokens.color.containerStrong,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
})
