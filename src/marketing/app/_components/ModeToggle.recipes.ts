import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const modeToggleLayout = style({
  display: 'flex',
  justifyContent: 'flex-end',
})
export const modeToggleText = style({
  display: 'flex',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-shell)',
})
export const modeToggleButton = style({
  height: metrics.spacing['8'],
  borderRightStyle: 'solid',
  borderRightWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['3'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '10px',
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
export const modeToggleButton2 = style({
  backgroundColor: 'var(--surface-card-elev)',
  color: 'var(--foreground)',
})
export const modeToggleButton3 = style({
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
        color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
      },
    },
  },
})
