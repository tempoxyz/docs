import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const tpsTrendChartLayout = style({
  position: 'relative',
  width: '100%',
})
export const tpsTrendChartIcon = style({
  display: 'block',
})
export const text = style({
  fill: inherited.color.colorMixInOklabForeground45Transparent,
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.xs,
})
export const text2 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const tpsTrendChartDescription = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  whiteSpace: 'nowrap',

  color: inherited.color.colorMixInOklabForeground40Transparent,
})
export const tpsTrendChartDescription2 = style({
  marginTop: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.caption,

  color: inherited.color.colorMixInOklabForeground60Transparent,
})
export const tpsTrendChartDescription3 = style({
  marginTop: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.compact,
  whiteSpace: 'nowrap',
  color: tokens.color.foreground,
})
export const tpsTrendChartText = style({
  color: inherited.color.colorMixInOklabForeground40Transparent,
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
