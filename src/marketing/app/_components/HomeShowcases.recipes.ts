import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const homeShowcasesLayout = style({
  marginTop: tokens.spacing['36'],
  scrollMarginTop: tokens.spacing['12'],
})
export const homeShowcasesLayout2 = style({
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  marginTop: '-1px !custom',
  scrollMarginTop: tokens.spacing['12'],
})
