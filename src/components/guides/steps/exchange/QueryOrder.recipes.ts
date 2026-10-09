import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'

export const queryOrderLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const queryOrderLayout4 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: metrics.spacing['3'],
})
export const queryOrderLayout5 = style({
  marginBottom: 'var(--spacing)',
  fontSize: metrics.fontSize.xs,
  lineHeight: 'var(--text-xs--line-height)',
  letterSpacing: 'var(--tracking-wider)',
  color: 'var(--color-gray11)',
  textTransform: 'uppercase',
})
export const queryOrderLayout6 = style({
  fontWeight: metrics.fontWeight.medium,
})
export const queryOrderLayout7 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
})
export const queryOrderText = style({
  fontSize: metrics.fontSize.xs,
  lineHeight: 'var(--text-xs--line-height)',
  color: 'var(--color-gray11)',
})
export const queryOrderLayout8 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
})
export const queryOrderLayout9 = style({
  backgroundColor: 'var(--color-gray3)',
  height: metrics.spacing['2'],
  flex: '1 1 0%',
  overflow: 'hidden',
  borderRadius: 'calc(infinity * 1px)',
})
export const queryOrderLayout10 = style({
  backgroundColor: 'var(--color-blue9)',
  height: '100%',
  transitionProperty: 'all',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const queryOrderText2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: metrics.fontSize.xs,
  lineHeight: 'var(--text-xs--line-height)',
})
export const queryOrderLayoutAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-width': values.value0,
  width: 'var(--tempo-width)',
}))
export const buy = style({ color: 'var(--color-green11)' })
export const sell = style({ color: 'var(--color-red11)' })
