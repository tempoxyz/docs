import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const main = style({
  minHeight: '100vh',
  width: '100%',

  backgroundColor: inherited.color.surfacePage,
})
export const homeLayout = style({
  marginInline: 'auto !custom',
  width: '100%',
  maxWidth: 'var(--container-7xl)',
  borderInlineStyle: 'solid',
  borderInlineWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
})
