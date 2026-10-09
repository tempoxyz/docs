import { style as instanceStyle } from 'zyzz'
import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const baseFeeRowLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 1.5) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 1.5) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const baseFeeRowLayout2 = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: metrics.spacing['3'],
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const baseFeeRowText = style({
  color: 'var(--color-gray11)',
})
export const strong = style({
  color: 'var(--color-gray12)',
})
export const baseFeeRowLayout3 = style({
  height: metrics.spacing['2_5'],
  overflow: 'hidden',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--color-gray3)',
})
export const baseFeeRowLayout4 = style({
  height: '100%',
  borderRadius: '0.25rem',
})
export const baseFeeRowLayout5 = style({
  backgroundColor: 'var(--color-gray7)',
})
export const baseFeeRowLayout6 = style({
  backgroundColor: 'var(--background-color-accent)',
})
export const gasSnapshotRowLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: metrics.spacing['2'],
})
export const gasSnapshotRowText = style({
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--color-gray12)',
})
export const strong2 = style({
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  color: 'var(--color-gray12)',
  '--tempo-style-numeric-spacing': 'tabular-nums',
  fontVariantNumeric:
    'var(--tempo-style-ordinal,) var(--tempo-style-slashed-zero,) var(--tempo-style-numeric-figure,) var(--tempo-style-numeric-spacing,) var(--tempo-style-numeric-fraction,)',
})
export const gasSnapshotRowLayout2 = style({
  height: '100%',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-color-accent)',
})
export const t7BenchmarkVisualHeading = style({
  fontSize: '14px',
  lineHeight: 1,
  fontWeight: metrics.fontWeight.normal,
  color: 'var(--color-gray12)',
})
export const t7BenchmarkVisualLayout = style({
  display: 'grid',
  gap: metrics.spacing['5'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const t7BenchmarkVisualSection = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 3) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 3) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const t7BenchmarkVisualH5 = style({
  margin: '0',
  fontSize: '14px',
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--color-gray12)',
})
export const t7BenchmarkVisualDescription = style({
  margin: '0',
  marginTop: 'var(--spacing)',
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  color: 'var(--color-gray11)',
})
export const gasSnapshotRowLayoutAppearance = instanceStyle({
  width: '18%',
})
export const baseFeeRowLayoutAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-width': values.value0,
  width: 'var(--tempo-width)',
}))
