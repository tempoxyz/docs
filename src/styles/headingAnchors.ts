import { global } from 'zyzz/web'
import { inherited } from './inherited'
import { vars as tokens } from './theme'

// G6: heading copy-link anchors in h2–h6 (OpenAPI anchors keep Vocs' styling).
// The whole heading is the hit area (the anchor's ::before covers it), the link icon fades in and out, and a copy swaps it for a
// check in the content primary color for about 1.2s (HeadingAnchorFeedback.tsx).
global({
  '@layer vocs_utilities': {
    ':is(h2, h3, h4, h5, h6)[data-v]:has(> .heading-anchor)': {
      position: 'relative',
    },
    // Links inside a heading stay clickable above the heading-wide hit area.
    ':is(h2, h3, h4, h5, h6)[data-v] > a:not(.heading-anchor)': {
      position: 'relative',
      zIndex: tokens.zIndex.raised,
    },
    ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor': {
      display: 'inline-grid',
      placeItems: 'center',
      color: tokens.color.muted,
      opacity: 0,
      transitionProperty: 'opacity',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
    },
    ':is(h2, h3, h4, h5, h6)[data-v]:hover > .heading-anchor, :is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor:focus-visible, :is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor[data-tempo-copied]':
      {
        opacity: 1,
        transitionDuration: 'var(--tempo-enter)',
      },
    ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor > .heading-anchor-icon, :is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor::after':
      {
        gridArea: '1 / 1',
        transitionProperty: 'opacity, scale',
        transitionDuration: 'var(--tempo-exit)',
        transitionTimingFunction: 'var(--tempo-ease)',
      },
    // Vocs tints the icon green on copy; the check below replaces that.
    ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor:hover .heading-anchor-icon, :is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor[data-copied="true"] .heading-anchor-icon':
      {
        color: 'inherit !custom',
      },
    ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor::after': {
      content: '""',
      width: '0.75em',
      height: '0.75em',
      backgroundColor: inherited.color.vocsTextColorPrimary,
      maskImage:
        'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22black%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M20 6 9 17l-5-5%22/%3E%3C/svg%3E")',
      maskRepeat: 'no-repeat',
      maskSize: 'contain',
      opacity: 0,
      scale: 0.6,
    },
    ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor[data-tempo-copied] > .heading-anchor-icon': {
      opacity: 0,
      scale: 0.6,
    },
    ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor[data-tempo-copied]::after': {
      opacity: 1,
      scale: 1,
      transitionDuration: 'var(--tempo-enter)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      ':is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor > .heading-anchor-icon, :is(h2, h3, h4, h5, h6)[data-v] > .heading-anchor::after':
        {
          scale: 1,
        },
    },
  },
})
