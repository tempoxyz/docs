import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const codeWindowLayout = style({
  display: 'flex',
  minHeight: '0',
})
export const codeWindowLayout2 = style({
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-block)',
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
})
export const codeWindowLayout3 = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-panel)',
  paddingInline: metrics.spacing['4'],
  paddingBlock: metrics.spacing['3'],
})
export const codeWindowText = style({
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  flexShrink: 0,
  borderRadius: 'calc(infinity * 1px)',
  backgroundColor: '#FF5F57',
})
export const codeWindowText2 = style({
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  flexShrink: 0,
  borderRadius: 'calc(infinity * 1px)',
  backgroundColor: '#FEBC2E',
})
export const codeWindowText3 = style({
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  flexShrink: 0,
  borderRadius: 'calc(infinity * 1px)',
  backgroundColor: '#28C840',
})
export const codeWindowText4 = style({
  pointerEvents: 'none',
  position: 'absolute',
  insetInline: '0',
  textAlign: 'center',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  letterSpacing: '0.02em',
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
})
export const codeWindowLayout4 = style({
  display: 'flex',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-block)',
})
export const codeWindowButton = style({
  height: metrics.spacing['11'],
  borderRightStyle: 'solid',
  borderRightWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['4'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:last-child': {
      borderRightStyle: 'solid',
      borderRightWidth: '0px',
    },
  },
})
export const codeWindowButton2 = style({
  backgroundColor: 'var(--surface-card-elev)',
  color: 'var(--foreground)',
})
export const codeWindowButton3 = style({
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-card)',
        color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
      },
    },
  },
})
export const codeWindowLayout5 = style({
  display: 'grid',
  minHeight: '0',
  flex: '1 1 0%',
})
export const codeWindowLayout6 = style({
  display: 'flex',
  minHeight: '0',
  backgroundColor: 'var(--surface-block)',
  gridArea: '1/1',
})
export const codeWindowLayout7 = style({
  visibility: 'hidden',
})
