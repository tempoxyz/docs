import { style } from '../../../styles/recipes'
export const plusCanvas = style({
  zIndex: 'calc(10 * -1)',
})
export const heroDotsLayout = style({
  pointerEvents: 'none',
  position: 'absolute',
  inset: '0',
  zIndex: 'calc(10 * -1)',
  '--tempo-style-gradient-position': 'to bottom in oklab',
  backgroundImage: 'linear-gradient(var(--tempo-style-gradient-stops))',
  '--tempo-style-gradient-from': 'var(--surface-shell)',
  '--tempo-style-gradient-stops':
    'var(--tempo-style-gradient-via-stops, var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position))',
  '--tempo-style-gradient-from-position': '0%',
  '--tempo-style-gradient-via': 'color-mix(in oklab, var(--surface-shell) 95%, transparent)',
  '--tempo-style-gradient-via-stops':
    'var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-via) var(--tempo-style-gradient-via-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position)',
  '--tempo-style-gradient-via-position': '50%',
  '--tempo-style-gradient-to': 'transparent',
  '--tempo-style-gradient-to-position': '100%',
})
