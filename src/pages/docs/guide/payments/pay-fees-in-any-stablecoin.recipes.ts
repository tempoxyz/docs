import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const tabs = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginTop: 'calc(var(--spacing) * -2) !custom',
})
export const div = style({
  height: tokens.spacing['6'],
})
