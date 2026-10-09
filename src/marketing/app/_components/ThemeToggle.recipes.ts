import { metrics } from '../../../styles/metrics'
import { style, variants } from '../../../styles/recipes'
export const themeToggleLayout = style({
  display: 'flex',
  width: 'fit-content',
  alignItems: 'center',
  borderRadius: 'calc(infinity * 1px)',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line-strong)',
  backgroundColor: 'var(--surface-block)',
  padding: metrics.spacing['0_5'],
})
export const optionButton = style({
  display: 'flex',
  width: metrics.spacing['7'],
  height: metrics.spacing['7'],
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'calc(infinity * 1px)',
  borderStyle: 'solid',
  borderWidth: '1px',
  transitionProperty: 'all',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const optionButton2 = style({
  borderColor: 'var(--line-strong)',
  backgroundColor: 'var(--surface-shell)',
  color: 'var(--foreground)',
  '--tempo-style-shadow':
    '0 1px 3px 0 var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1))',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
})
export const optionButton3 = style({
  borderColor: 'transparent',
  color: 'var(--foreground-secondary)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
export const sunIconIcon = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
})

export const themeOption = variants({
  base: {
    position: 'relative',
    display: 'flex',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    border: '1px solid transparent',
    transition: 'color 150ms, background-color 150ms, border-color 150ms',
    ':has(input:focus-visible)': { outline: '2px solid var(--accent-blue)', outlineOffset: '3px' },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  variants: {
    selected: {
      true: {
        borderColor: 'var(--line-strong)',
        backgroundColor: 'var(--surface-shell)',
        color: 'var(--foreground)',
        boxShadow: '0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      },
      false: { color: 'var(--foreground-secondary)', ':hover': { color: 'var(--foreground)' } },
    },
  },
})
export const themeRadio = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  opacity: 0,
  cursor: 'pointer',
})
