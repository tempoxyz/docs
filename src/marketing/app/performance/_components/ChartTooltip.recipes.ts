import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const chartTooltipLayout = style({
  pointerEvents: 'none',
  position: 'absolute',
  top: tokens.spacing['3'],
  zIndex: tokens.zIndex.raised,
  '--tempo-style-translate-x': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,

  backgroundColor: inherited.color.surfacePanel,
  paddingInline: tokens.spacing['3_5'],
  paddingBlock: tokens.spacing['2_5'],
  '--tempo-style-shadow':
    '0 20px 25px -5px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1)), 0 8px 10px -6px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1))',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
})
export const chartTooltipLayoutAppearance = instanceStyle((values: { value0: `${number}px` }) => ({
  insetInlineStart: values.value0,
}))
