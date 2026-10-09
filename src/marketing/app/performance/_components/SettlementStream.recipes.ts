import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const settlementStreamLayout = style({
  position: 'relative',
  width: '100%',
})
export const settlementStreamDescription = style({
  position: 'absolute',
  right: '0',
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '9px',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const settlementStreamText = style({
  display: 'block',
  width: metrics.spacing['1_5'],
  height: metrics.spacing['1_5'],
  flexShrink: 0,
  borderRadius: 'calc(infinity * 1px)',
})
export const settlementStreamText2 = style({
  backgroundColor: 'var(--indicator-green)',
})
export const settlementStreamText3 = style({
  backgroundColor: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
})
export const settlementStreamLayout2 = style({
  position: 'absolute',
  insetInline: '0',
  overflow: 'hidden',
})
export const settlementStreamLayout3 = style({
  position: 'absolute',
  top: '0',
  right: '0',
  transitionTimingFunction: 'var(--ease-out)',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const settlementStreamLayout4 = style({
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '300ms',
})
export const settlementStreamLink = style({
  display: 'block',
  '--tempo-style-outline-style': 'none',
  outlineStyle: 'none',
})
export const settlementStreamLayout5 = style({
  display: 'flex',
  width: metrics.spacing['16'],
  height: metrics.spacing['16'],
  alignItems: 'center',
  justifyContent: 'center',
  borderColor: 'var(--line-strong)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-card)',
      },
    },
    '&:is(:where(.group):focus-visible *)': {
      backgroundColor: 'var(--surface-card)',
    },
  },
})
export const settlementStreamLayout6 = style({
  backgroundColor: 'var(--surface-panel)',
})
export const settlementStreamText4 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '18px',
  lineHeight: 1,
  color: 'var(--indicator-green)',
})
export const settlementStreamDescription2 = style({
  marginTop: metrics.spacing['1_5'],
  textAlign: 'center',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '9px',
  letterSpacing: 'var(--tracking-wide)',
  color: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
      },
    },
    '&:is(:where(.group):focus-visible *)': {
      color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
    },
  },
})
export const settlementStreamDescription3 = style({
  position: 'absolute',
  right: '0',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '10px',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
})
export const settlementStreamLayout7 = style({
  pointerEvents: 'none',
  position: 'absolute',
  insetBlock: '0',
  left: '0',
  width: metrics.spacing['16'],
  '--tempo-style-gradient-position': 'to right in oklab',
  backgroundImage: 'linear-gradient(var(--tempo-style-gradient-stops))',
  '--tempo-style-gradient-from': 'var(--surface-shell)',
  '--tempo-style-gradient-stops':
    'var(--tempo-style-gradient-via-stops, var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position))',
  '--tempo-style-gradient-to': 'transparent',
})
export const settlementStreamLayout8 = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
})
export const settlementStreamText5 = style({
  height: metrics.spacing['2'],
  width: '1px',
  backgroundColor: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
})
export const settlementStreamText6 = style({
  height: '1px',
  flex: '1 1 0%',
  backgroundColor: 'color-mix(in oklab, var(--foreground) 25%, transparent)',
})
export const settlementStreamDescription4 = style({
  position: 'absolute',
  textAlign: 'center',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '9px',
  lineHeight: 'var(--leading-tight)',
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
})
export const settlementStreamText7 = style({
  display: 'block',
  letterSpacing: 'var(--tracking-wider)',
  color: 'color-mix(in oklab, var(--foreground) 30%, transparent)',
})
export const settlementStreamText8 = style({
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const settlementStreamLayoutAppearance = instanceStyle(
  (values: { value0: `${number}px` }) => ({ height: values.value0 }),
)
export const settlementStreamDescriptionAppearance = instanceStyle(
  (values: { value0: `${number}px` }) => ({ top: values.value0 }),
)
export const settlementStreamLayoutAppearance2 = instanceStyle(
  (values: { value0: `${number}px`; value1: `${number}px` }) => ({
    top: values.value0,
    height: values.value1,
  }),
)
export const settlementStreamLayoutAppearance3 = instanceStyle((values: { value0: string }) => ({
  '--tempo-transform': values.value0,
  transform: 'var(--tempo-transform)',
}))
export const settlementStreamDescriptionAppearance2 = instanceStyle(
  (values: { value0: `${number}px` }) => ({ top: values.value0 }),
)
export const settlementStreamLayoutAppearance4 = instanceStyle(
  (values: { value0: `${number}px`; value1: `${number}px`; value2: `${number}px` }) => ({
    right: values.value0,
    width: values.value1,
    top: values.value2,
  }),
)
export const settlementStreamDescriptionAppearance3 = instanceStyle(
  (values: { value0: `${number}px`; value1: `${number}px`; value2: `${number}px` }) => ({
    right: values.value0,
    width: values.value1,
    top: values.value2,
  }),
)
