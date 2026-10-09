import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const paymentLanesLayout = style({
  position: 'relative',
  width: '100%',
})
export const paymentLanesIcon = style({
  display: 'block',
})
export const rect = style({
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const text = style({
  fill: inherited.color.colorMixInOklabForeground35Transparent,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.tiny,

  letterSpacing: inherited.letterSpacing.trackingWider,
})
export const text2 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.tiny,

  letterSpacing: inherited.letterSpacing.trackingWider,
})
export const path = style({
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const text3 = style({
  fill: inherited.color.colorMixInOklabForeground40Transparent,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const path2 = style({
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const text4 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
})
export const paymentLanesLayoutAppearance = instanceStyle((values: { value0: `${number}px` }) => ({
  height: values.value0,
}))
export const paymentLanesPathAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-transition': values.value0,
  transition: 'var(--tempo-transition)',
}))
export const paymentLanesTextAppearance = instanceStyle(
  (values: { value0: number; value1: string }) => ({
    opacity: values.value0,
    '--tempo-transition': values.value1,
    transition: 'var(--tempo-transition)',
  }),
)
