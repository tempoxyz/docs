import { style as instanceStyle } from 'zyzz'
import { style } from '../../../../styles/recipes'
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
  fill: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '10px',
  letterSpacing: 'var(--tracking-wider)',
})
export const text2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '10px',
  letterSpacing: 'var(--tracking-wider)',
})
export const path = style({
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const text3 = style({
  fill: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
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
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
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
