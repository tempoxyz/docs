import { style as instanceStyle } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'
export const staticMermaidDiagramLayoutAppearance = instanceStyle({
  marginBlock: tokens.spacing['6'],
  marginInline: tokens.spacing['0'],

  paddingBlock: tokens.spacing['4'],
  paddingInline: tokens.spacing['2'],
  borderRadius: tokens.radius.xl,
  overflow: 'hidden',
  overflowX: 'auto',
  position: 'relative',
})
export const staticMermaidDiagramLayoutAppearance2 = instanceStyle({
  maxWidth: '540px',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  margin: '0 auto !custom',
})
