import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const text = style({
  fill: inherited.color.colorMixInOklabForeground35Transparent,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
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
