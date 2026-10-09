import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const legend = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: tokens.spacing['0'],
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  margin: '-1px !custom',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  borderWidth: tokens.borderWidth.none,
})
