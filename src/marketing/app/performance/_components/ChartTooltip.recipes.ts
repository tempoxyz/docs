import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const chartTooltipLayout = style({
  pointerEvents: 'none',
  position: 'absolute',
  top: metrics.spacing['3'],
  zIndex: 10,
  '--tempo-style-translate-x': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-panel)',
  paddingInline: metrics.spacing['3_5'],
  paddingBlock: metrics.spacing['2_5'],
  '--tempo-style-shadow':
    '0 20px 25px -5px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1)), 0 8px 10px -6px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1))',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
})
export const chartTooltipLayoutAppearance = instanceStyle((values: { value0: `${number}px` }) => ({
  left: values.value0,
}))
