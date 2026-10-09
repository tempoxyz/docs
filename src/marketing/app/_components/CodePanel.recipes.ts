import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const renderCodeText = style({
  marginInline: 'calc(var(--spacing) * -1)',
  marginBlock: 'calc(var(--spacing) * -0.5)',
  borderRadius: '4px',
  backgroundColor: 'color-mix(in oklab, var(--foreground) 7.000000000000001%, transparent)',
  paddingInline: 'var(--spacing)',
  paddingBlock: metrics.spacing['0_5'],
  '--tempo-style-ring-shadow':
    'var(--tempo-style-ring-inset,) 0 0 0 calc(1px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
  '--tempo-style-ring-color': 'color-mix(in oklab, var(--foreground) 10%, transparent)',
})
export const copyButtonButton = style({
  position: 'absolute',
  top: metrics.spacing['3'],
  right: metrics.spacing['3'],
  zIndex: 20,
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  borderRadius: '6px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
  paddingInline: metrics.spacing['2_5'],
  paddingBlock: metrics.spacing['1_5'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
  opacity: '0%',
  '--tempo-style-backdrop-blur': 'blur(var(--blur-sm))',
  WebkitBackdropFilter:
    'var(--tempo-style-backdrop-blur,) var(--tempo-style-backdrop-brightness,) var(--tempo-style-backdrop-contrast,) var(--tempo-style-backdrop-grayscale,) var(--tempo-style-backdrop-hue-rotate,) var(--tempo-style-backdrop-invert,) var(--tempo-style-backdrop-opacity,) var(--tempo-style-backdrop-saturate,) var(--tempo-style-backdrop-sepia,)',
  backdropFilter:
    'var(--tempo-style-backdrop-blur,) var(--tempo-style-backdrop-brightness,) var(--tempo-style-backdrop-contrast,) var(--tempo-style-backdrop-grayscale,) var(--tempo-style-backdrop-hue-rotate,) var(--tempo-style-backdrop-invert,) var(--tempo-style-backdrop-opacity,) var(--tempo-style-backdrop-saturate,) var(--tempo-style-backdrop-sepia,)',
  transitionProperty: 'all',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '200ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        opacity: '100%',
      },
    },
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 8%, transparent)',
        color: 'var(--foreground)',
      },
    },
  },
})
export const codePanelLayout = style({
  minHeight: '0',
  flex: '1 1 0%',
  overflow: 'auto',
  backgroundColor: 'var(--surface-block)',
  padding: metrics.spacing['4'],
})
export const codePanelLayout2 = style({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
})
export const pre = style({
  width: 'fit-content',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  lineHeight: 1.7,
  color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
})
export const codePanelLayout3 = style({
  position: 'relative',
  flex: '1 1 0%',
})
export const codePanelLayout4 = style({
  position: 'absolute',
  inset: metrics.spacing['5'],
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--surface-onyx)',
  padding: metrics.spacing['6'],
})
export const codePanelLayout5 = style({
  display: 'grid',
})
export const pre2 = style({
  visibility: 'hidden',
  height: '0',
  overflow: 'hidden',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '13px',
  lineHeight: 1.7,
  whiteSpace: 'pre',
  gridArea: '1/1',
})
export const pre3 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '13px',
  lineHeight: 1.7,
  color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
  gridArea: '1/1',
})
export const renderCodeTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-color': values.value0,
  color: 'var(--tempo-color)',
}))
