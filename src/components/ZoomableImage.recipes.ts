import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const img = style({
  cursor: 'zoom-in',
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: '#F9F9F9',
  padding: '10px',
  transitionProperty: 'opacity',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        opacity: '80%',
      },
    },
  },
})
export const zoomableImageLayout = style({
  position: 'fixed',
  inset: '0',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'color-mix(in oklab, var(--color-black) 80%, transparent)',
  padding: metrics.spacing['8'],
})
export const zoomableImageLayout2 = style({
  position: 'relative',
  display: 'flex',
  height: '90vh',
  width: '90vw',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: '#F9F9F9',
  padding: metrics.spacing['8'],
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
})
export const zoomableImageButton = style({
  position: 'absolute',
  top: metrics.spacing['4'],
  right: metrics.spacing['4'],
  zIndex: 10,
  display: 'flex',
  height: metrics.spacing['10'],
  width: metrics.spacing['10'],
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'calc(infinity * 1px)',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
  backgroundColor: 'var(--color-gray3)',
  color: 'var(--color-gray12)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray4)',
      },
    },
  },
})
export const img2 = style({
  maxHeight: '100%',
  maxWidth: '100%',
  cursor: 'zoom-out',
  borderRadius: '0.25rem',
  objectFit: 'contain',
})
