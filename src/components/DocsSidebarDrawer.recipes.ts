import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const docsSidebarDrawerButton = style({
  display: 'flex',
  minHeight: metrics.spacing['9'],
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  borderRadius: metrics.radius.md,
  fontFamily: 'var(--font-pilat-book)',
  color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
    '&:focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '4px',
    },
  },
  '@media (width >= 1080px)': {
    display: 'none',
  },
})
export const docsSidebarDrawerLayout = style({
  position: 'fixed',
  inset: '0',
  zIndex: 70,
  '@media (width >= 1080px)': {
    display: 'none',
  },
})
export const docsSidebarDrawerLayout2 = style({
  pointerEvents: 'none',
})
export const docsSidebarDrawerLayout3 = style({
  position: 'absolute',
  inset: '0',
  backgroundColor: 'color-mix(in oklab, var(--color-black) 40%, transparent)',
  transitionProperty: 'opacity',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '200ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const docsSidebarDrawerLayout4 = style({
  opacity: '100%',
})
export const docsSidebarDrawerLayout5 = style({
  opacity: '0%',
})
export const docsSidebarDrawerLayout6 = style({
  position: 'absolute',
  top: '0',
  left: '0',
  display: 'flex',
  height: '100%',
  width: '82%',
  maxWidth: '320px',
  flexDirection: 'column',
  borderRightStyle: 'solid',
  borderRightWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--background)',
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const docsSidebarDrawerLayout7 = style({
  '--tempo-style-translate-x': '0',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
})
export const docsSidebarDrawerLayout8 = style({
  '--tempo-style-translate-x': '-100%',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
})
export const docsSidebarDrawerLayout9 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['4'],
})
export const docsSidebarDrawerText = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const docsSidebarDrawerButton2 = style({
  display: 'grid',
  width: metrics.spacing['10'],
  height: metrics.spacing['10'],
  placeItems: 'center',
  borderRadius: metrics.radius.lg,
  color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 5%, transparent)',
        color: 'var(--foreground)',
      },
    },
    '&:focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '2px',
    },
  },
})
export const docsSidebarDrawerLayout10 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  overflowY: 'auto',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['3'],
})
