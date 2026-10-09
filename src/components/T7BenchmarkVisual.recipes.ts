import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { style as instanceStyle } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'
export const baseFeeRowLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1_5'],
    },
  },
})
export const baseFeeRowLayout2 = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const baseFeeRowText = style({
  color: tokens.color.gray11,
})
export const strong = style({
  color: tokens.color.gray12,
})
export const baseFeeRowLayout3 = style({
  height: tokens.spacing['2_5'],
  overflow: 'hidden',
  borderRadius: tokens.radius.smRem,
  backgroundColor: tokens.color.gray3,
})
export const baseFeeRowLayout4 = style({
  height: '100%',
  borderRadius: tokens.radius.smRem,
})
export const baseFeeRowLayout5 = style({
  backgroundColor: tokens.color.gray7,
})
export const baseFeeRowLayout6 = style({
  backgroundColor: inherited.color.backgroundColorAccent,
})
export const gasSnapshotRowLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
})
export const gasSnapshotRowText = style({
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.gray12,
})
export const strong2 = style({
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.gray12,
  '--tempo-style-numeric-spacing': 'tabular-nums',
  fontVariantNumeric:
    'var(--tempo-style-ordinal,) var(--tempo-style-slashed-zero,) var(--tempo-style-numeric-figure,) var(--tempo-style-numeric-spacing,) var(--tempo-style-numeric-fraction,)',
})
export const gasSnapshotRowLayout2 = style({
  height: '100%',
  borderRadius: tokens.radius.smRem,

  backgroundColor: inherited.color.backgroundColorAccent,
})
export const t7BenchmarkVisualHeading = style({
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.none,
  fontWeight: tokens.fontWeight.normal,
  color: tokens.color.gray12,
})
export const t7BenchmarkVisualLayout = style({
  display: 'grid',
  gap: tokens.spacing['5'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const t7BenchmarkVisualSection = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['3'],
    },
  },
})
export const t7BenchmarkVisualH5 = style({
  margin: tokens.spacing['0'],
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.gray12,
})
export const t7BenchmarkVisualDescription = style({
  margin: tokens.spacing['0'],

  marginTop: tokens.spacing['1'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.gray11,
})
export const gasSnapshotRowLayoutAppearance = instanceStyle({
  width: '18%',
})
export const baseFeeRowLayoutAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-width': values.value0,
  width: 'var(--tempo-width)',
}))
