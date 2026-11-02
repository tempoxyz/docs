import { global, property } from 'zyzz/web'
import { vars as tokens } from './theme'

// Smooth corners, ported from tempo.xyz SmoothCorners.css. Only elements that set
// --corner-radius (beside a matching border-radius) take part; Vocs internals keep
// their own radii unless a restyle opts them in. The runtime is SmoothCorners.tsx.
// Non-inheritance keeps descendants of a rounded element square.
property({ name: '--corner-radius', syntax: '<length>', inherits: false, initialValue: '0px' })

global({
  '[data-smooth-corners="native"]': {
    // design-exception: The runtime measures each element; CSS cannot derive the smoothed radius.
    borderRadius: 'var(--smooth-radius) !custom !important',
    cornerShape: 'var(--smooth-shape)',
  },
  // The SVG stroke replaces the circular CSS border without changing its layout.
  '[data-smooth-corners="svg"]': {
    // design-exception: The clip path draws the corner; a CSS radius would double it.
    borderRadius: '0 !custom !important',
    // design-exception: The SVG stroke background paints the border inside the clip.
    borderColor: 'transparent !custom !important',
    clipPath: 'var(--smooth-path) !important',
    backgroundImage: 'var(--smooth-border, none), var(--smooth-background, none) !important',
    backgroundOrigin: 'border-box !important',
    backgroundClip: 'border-box !important',
  },
  '[data-smooth-corners="svg"][data-smooth-static]': {
    position: 'relative',
  },
  // An inset SVG ring survives clipping.
  '[data-smooth-corners="svg"]:focus-visible': {
    // design-exception: The inset SVG ring below replaces the outline the clip would cut.
    outline: 'none !custom !important',
  },
  '[data-smooth-corners="svg"]:focus-visible::after': {
    content: '""',
    position: 'absolute',
    inset: 'calc(-1 * var(--smooth-border-width))',
    zIndex: tokens.zIndex.raised,
    pointerEvents: 'none',
    // design-exception: The runtime renders the ring as an SVG image sized to the element.
    background: 'var(--smooth-focus) border-box !custom',
  },
})
