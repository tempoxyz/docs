import { style as instanceStyle } from 'zyzz'
import { style } from '../../../../styles/recipes'
export const tpsTrendChartLayout = style({
  position: 'relative',
  width: '100%',
})
export const tpsTrendChartIcon = style({
  display: 'block',
})
export const text = style({
  fill: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '12px',
})
export const text2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const tpsTrendChartDescription = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  whiteSpace: 'nowrap',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const tpsTrendChartDescription2 = style({
  marginTop: 'var(--spacing)',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '11px',
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
})
export const tpsTrendChartDescription3 = style({
  marginTop: 'var(--spacing)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '13px',
  whiteSpace: 'nowrap',
  color: 'var(--foreground)',
})
export const tpsTrendChartText = style({
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const tpsTrendChartLayoutAppearance = instanceStyle((values: { value0: `${number}px` }) => ({
  height: values.value0,
}))
export const tpsTrendChartPathAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-transition': values.value0,
  transition: 'var(--tempo-transition)',
}))
export const tpsTrendChartCircleAppearance = instanceStyle(
  (values: { value0: number; value1: string }) => ({
    opacity: values.value0,
    '--tempo-transition': values.value1,
    transition: 'var(--tempo-transition)',
  }),
)
export const tpsTrendChartTextAppearance = instanceStyle((values: { value0: number }) => ({
  opacity: values.value0,
  transition: 'opacity 250ms ease-out',
}))
