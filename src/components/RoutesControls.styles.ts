import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'

// Form controls and type scale shared by the Routes demo and the supported routes table, matching
// the other docs demos. They live apart from the components that compose them: Zyzz only composes
// styles defined in another module or kept local to the file.
export const input = style({
  // design-exception: Match the 40px height of the shared demo buttons.
  minHeight: '40px',
  width: '100%',
  minWidth: 0,
  borderRadius: tokens.radius.md,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  paddingBlock: tokens.spacing['2'],
  paddingInline: tokens.spacing['3'],
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.sm,
  ':focus-visible': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
  },
  ':disabled': { opacity: 0.6 },
})
export const label = style({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: tokens.spacing['1_5'],
  color: tokens.color.gray10,
  fontSize: tokens.fontSize.compact,
})
export const note = style({ color: tokens.color.gray10, fontSize: tokens.fontSize.compact })
// A pill button for one-click picks: popular routes and quick amounts. `aria-pressed` marks the
// current choice.
export const chip = style({
  whiteSpace: 'nowrap',
  borderRadius: tokens.radius.full,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  paddingInline: tokens.spacing['2_5'],
  paddingBlock: tokens.spacing['1'],
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray11,
  // Tailwind's `transition-colors`.
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (hover: hover)': { ':hover': { color: inherited.color.textColorPrimary } },
  '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  ':focus-visible': {
    outlineWidth: tokens.borderWidth.emphasis,
    outlineStyle: 'solid',
    outlineColor: tokens.color.accent,
  },
  ':disabled': { cursor: 'not-allowed', opacity: 0.4 },
  selectors: {
    '&[aria-pressed="true"]': {
      borderColor: inherited.color.backgroundColorInvert,
      backgroundColor: inherited.color.backgroundColorInvert,
      color: inherited.color.textColorInvert,
    },
    '&:disabled:hover': { '@media (hover: hover)': { color: tokens.color.gray11 } },
  },
})
export const chipRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
