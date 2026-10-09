import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const featureDiagramLayout = style({
  position: 'relative',
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: tokens.color.shell,
})
export const featureDiagramLayout2 = style({
  padding: tokens.spacing['3'],
})
export const featureDiagramIcon = style({
  display: 'block',
  height: 'auto',
  width: '100%',
})
export const featureDiagramIcon2 = style({
  display: 'block',
  height: 'auto',
  width: '100%',
  maxWidth: '560px',
  '@media (width >= 64rem)': {
    height: '100%',
    minHeight: '260px',
  },
})
export const featureDiagramLayoutState = style({
  padding: tokens.spacing['6'],
  '@media (width >= 64rem)': {
    minHeight: '520px',
    padding: tokens.spacing['10'],
  },
})
export const labelTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-fontFamily': values.value0,

  fontFamily: inherited.fontFamily.tempoFontFamily,
}))
