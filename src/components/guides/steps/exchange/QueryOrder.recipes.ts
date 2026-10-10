import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'

export const queryOrderLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const queryOrderLayout4 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: tokens.spacing['3'],
})
export const queryOrderLayout5 = style({
  marginBottom: tokens.spacing['1'],
  fontSize: tokens.fontSize.xs,

  lineHeight: inherited.lineHeight.textXsLineHeight,

  letterSpacing: inherited.letterSpacing.trackingWider,
  color: tokens.color.gray11,
  textTransform: 'uppercase',
})
export const queryOrderLayout6 = style({
  fontWeight: tokens.fontWeight.medium,
})
export const queryOrderLayout7 = style({
  fontFamily: tokens.fontFamily.code,
})
export const queryOrderText = style({
  fontSize: tokens.fontSize.xs,

  lineHeight: inherited.lineHeight.textXsLineHeight,
  color: tokens.color.gray11,
})
export const queryOrderLayout8 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
export const queryOrderLayout9 = style({
  backgroundColor: tokens.color.gray3,
  height: tokens.spacing['2'],
  flex: '1 1 0%',
  overflow: 'hidden',
  borderRadius: tokens.radius.full,
})
export const queryOrderLayout10 = style({
  backgroundColor: tokens.color.blue9,
  height: '100%',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const queryOrderText2 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,

  lineHeight: inherited.lineHeight.textXsLineHeight,
})
export const queryOrderLayoutAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-width': values.value0,
  width: 'var(--tempo-width)',
}))
export const buy = style({ color: tokens.color.green11 })
export const sell = style({ color: tokens.color.red11 })
