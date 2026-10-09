import { style as instanceStyle } from 'zyzz'
import { style } from '../../../../styles/recipes'
export const text = style({
  fill: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
})
export const tpsTrendChartFrameLayout = style({
  position: 'relative',
  width: '100%',
})
export const tpsTrendChartFrameIcon = style({
  display: 'block',
})
export const tpsTrendChartFrameLayoutAppearance = instanceStyle(
  (values: { value0: `${number}px` }) => ({ height: values.value0 }),
)
