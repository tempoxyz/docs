import { style as instanceStyle } from 'zyzz'
import { style } from '../styles/recipes'
export const sqlEditorLayout = style({
  '--tempo-style-ring-color': 'var(--accent-blue)',
  '--tempo-style-ring-shadow':
    'var(--tempo-style-ring-inset,) 0 0 0 calc(1px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
})
export const sqlEditorLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-gray2)',
  fontSize: '13px',
  color: 'var(--color-gray9)',
})
export const sqlEditorLayoutAppearance = instanceStyle(
  (values: { value0: string; value1: string }) => ({
    '--tempo-height': values.value0,
    height: 'var(--tempo-height)',
    '--tempo-minHeight': values.value1,
    minHeight: 'var(--tempo-minHeight)',
  }),
)
