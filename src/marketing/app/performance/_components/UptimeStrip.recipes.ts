import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const uptimeStripLayout = style({
  marginBottom: metrics.spacing['6'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['3'],
})
export const uptimeStripLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2_5'],
})
export const uptimeStripText = style({
  width: metrics.spacing['2'],
  height: metrics.spacing['2'],
  borderRadius: 'calc(infinity * 1px)',
})
export const uptimeStripText2 = style({
  backgroundColor: 'var(--background-color-warning)',
})
export const uptimeStripDescription = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
  textTransform: 'uppercase',
})
export const uptimeStripDescription2 = style({
  marginLeft: 'auto',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
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
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  whiteSpace: 'nowrap',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const uptimeStripDescription4 = style({
  marginTop: 'var(--spacing)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '13px',
  whiteSpace: 'nowrap',
  color: 'var(--foreground)',
})
export const uptimeStripDescription5 = style({
  marginTop: metrics.spacing['0_5'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  whiteSpace: 'nowrap',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const uptimeStripLayout4 = style({
  marginTop: metrics.spacing['3'],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '10px',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
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
