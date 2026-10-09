import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const featureDiagramLayout = style({
  position: 'relative',
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: 'var(--surface-shell)',
})
export const featureDiagramLayout2 = style({
  padding: metrics.spacing['3'],
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
  padding: metrics.spacing['6'],
  '@media (width >= 64rem)': {
    minHeight: '520px',
    padding: metrics.spacing['10'],
  },
})
export const labelTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-fontFamily': values.value0,
  fontFamily: 'var(--tempo-fontFamily)',
}))
