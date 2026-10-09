import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const uptimeStripLayout = style({
  marginBottom: tokens.spacing['6'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
})
export const uptimeStripLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
})
export const uptimeStripText = style({
  width: tokens.spacing['2'],
  height: tokens.spacing['2'],
  borderRadius: tokens.radius.full,
})
export const uptimeStripText2 = style({
  backgroundColor: inherited.color.backgroundColorWarning,
})
export const uptimeStripDescription = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabForeground60Transparent,
  textTransform: 'uppercase',
})
export const uptimeStripDescription2 = style({
  marginInlineStart: 'auto !custom',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabForeground40Transparent,
  textTransform: 'uppercase',
})
export const uptimeStripLayout3 = style({
  position: 'relative',
  width: '100%',
})
export const uptimeStripIcon = style({
  display: 'block',
})
export const rect = style({
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const uptimeStripDescription3 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  whiteSpace: 'nowrap',

  color: inherited.color.colorMixInOklabForeground40Transparent,
})
export const uptimeStripDescription4 = style({
  marginTop: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.compact,
  whiteSpace: 'nowrap',
  color: tokens.color.foreground,
})
export const uptimeStripDescription5 = style({
  marginTop: tokens.spacing['0_5'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  whiteSpace: 'nowrap',

  color: inherited.color.colorMixInOklabForeground40Transparent,
})
export const uptimeStripLayout4 = style({
  marginTop: tokens.spacing['3'],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.tiny,

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabForeground35Transparent,
  textTransform: 'uppercase',
})
export const uptimeStripLayoutAppearance = instanceStyle((values: { value0: `${number}px` }) => ({
  height: values.value0,
}))
export const uptimeStripRectAppearance = instanceStyle(
  (values: { value0: string; value1: string }) => ({
    '--tempo-transform': values.value0,
    transform: 'var(--tempo-transform)',
    transformBox: 'fill-box',
    transformOrigin: 'bottom',
    '--tempo-transition': values.value1,
    transition: 'var(--tempo-transition)',
  }),
)
