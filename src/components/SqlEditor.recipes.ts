import { style } from '../styles/recipes'
import { style as instanceStyle } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'
export const sqlEditorLayout = style({
  '--tempo-style-ring-color': 'var(--accent-blue)',
  '--tempo-style-ring-shadow':
    'var(--tempo-style-ring-inset,) 0 0 0 calc(1px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
})
export const sqlEditorLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: tokens.color.gray2,
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray9,
})
export const sqlEditorLayoutAppearance = instanceStyle(
  (values: { value0: string; value1: string }) => ({
    '--tempo-height': values.value0,
    height: 'var(--tempo-height)',
    '--tempo-minHeight': values.value1,
    minHeight: 'var(--tempo-minHeight)',
  }),
)
