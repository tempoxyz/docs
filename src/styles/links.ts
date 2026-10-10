import { global } from 'zyzz/web'
import { inherited } from './inherited'
import { vars as tokens } from './theme'

// G5 link treatments. L1: a chevron glued to the last word, hidden at rest
// (it keeps its space), fading in and travelling 0.15em on hover or focus.
// Geometry and easing follow tempo.xyz's use-case chevron. L2: a color link.
// ChevronLink.tsx renders the markup; Vocs cards get the CSS-only variant below.
global({
  '.tempo-chevron-end': {
    whiteSpace: 'nowrap',
  },
  '.tempo-chevron': {
    '--tempo-chevron-travel': '0.15em',
    display: 'inline-block',
    width: '0.274em',
    height: '0.477em',
    // design-exception: tempo.xyz chevron spacing, tied to the glyph's em box.
    marginInlineStart: 'calc(0.265em + 3px) !custom',
    // design-exception: Leaves room for the travel so nothing after it shifts.
    marginInlineEnd: '0.15em !custom',
    verticalAlign: '0.0265em',
    opacity: 0,
    transitionProperty: 'opacity, translate',
    transitionDuration: 'var(--tempo-exit)',
    transitionTimingFunction: 'var(--tempo-ease)',
  },
  ':dir(rtl) .tempo-chevron': {
    '--tempo-chevron-travel': '-0.15em',
    transform: 'scaleX(-1)',
  },
  ':is(a, button, [data-chevron-trigger]):is(:hover, :focus-visible) .tempo-chevron': {
    opacity: 1,
    translate: 'var(--tempo-chevron-travel) 0',
    transitionDuration: 'var(--tempo-enter)',
  },
  '@media (prefers-reduced-motion: reduce)': {
    ':is(a, button, [data-chevron-trigger]):is(:hover, :focus-visible) .tempo-chevron': {
      translate: 'none',
    },
  },
  // L2: color links for lists of references.
  '.tempo-color-link': {
    color: inherited.color.vocsTextColorPrimary,
    textDecoration: 'none',
    transitionProperty: 'color',
    transitionDuration: 'var(--tempo-exit)',
    transitionTimingFunction: 'var(--tempo-ease)',
  },
  '.tempo-color-link:is(:hover, :focus-visible)': {
    color: tokens.color.muted,
    transitionDuration: 'var(--tempo-enter)',
  },
})

// Vocs cards render their own markup, so their titles take the chevron as an
// inline pseudo-element. A word joiner glues it to the last word; the mask
// moves instead of the box because inline boxes cannot be translated.
global({
  'article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a) > [class~="vocs:text-heading"]::after':
    {
      content: '"\\2060"',
      // design-exception: tempo.xyz chevron spacing, tied to the glyph's em box.
      marginInlineStart: 'calc(0.265em + 3px) !custom',
      // design-exception: Chevron width plus its travel, so the title never reflows.
      paddingInlineEnd: 'calc(0.274em + 0.15em) !custom',
      backgroundColor: 'currentColor',
      maskImage:
        'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30.45 53%22%3E%3Cpath d=%22M2.79 2.79 26.5 26.5 2.79 50.21%22 fill=%22none%22 stroke=%22black%22 stroke-width=%227.9%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E")',
      maskRepeat: 'no-repeat',
      maskSize: '0.274em 0.477em',
      maskPosition: 'left center',
      opacity: 0,
      transitionProperty: 'opacity, mask-position',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
  'article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):is(:hover, :focus-visible) > [class~="vocs:text-heading"]::after':
    {
      opacity: 1,
      maskPosition: '0.15em center',
      transitionDuration: 'var(--tempo-enter)',
    },
  ':dir(rtl) article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a) > [class~="vocs:text-heading"]::after':
    {
      maskImage:
        'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30.45 53%22%3E%3Cpath d=%22M27.66 2.79 3.95 26.5 27.66 50.21%22 fill=%22none%22 stroke=%22black%22 stroke-width=%227.9%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E")',
      maskPosition: 'right center',
    },
  ':dir(rtl) article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):is(:hover, :focus-visible) > [class~="vocs:text-heading"]::after':
    {
      maskPosition: 'calc(100% - 0.15em) center',
    },
  '@media (prefers-reduced-motion: reduce)': {
    'article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):is(:hover, :focus-visible) > [class~="vocs:text-heading"]::after':
      {
        maskPosition: 'left center',
      },
  },
})
