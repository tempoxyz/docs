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
