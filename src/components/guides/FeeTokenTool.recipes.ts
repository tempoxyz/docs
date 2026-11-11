import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'

export const feeTokenTool = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  marginBlock: tokens.spacing['4'],
})
export const feeTokenToolBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
})
export const feeTokenToolIcon = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
})
export const feeTokenToolNote = style({
  margin: tokens.spacing['0'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
