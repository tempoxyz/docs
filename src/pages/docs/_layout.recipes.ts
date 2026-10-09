import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const toaster = style({
  zIndex: tokens.zIndex.command,
  WebkitUserSelect: 'none',
  userSelect: 'none',
})
