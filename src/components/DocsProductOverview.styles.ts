import { style } from 'zyzz'
import { global } from 'zyzz/web'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  'article[data-v-content] .docs-product-overview-copy h1[data-v]': {
    margin: 0,
    padding: 0,
    border: 0,
    fontSize: 'clamp(32px, 4.5cqi, 42px)',
    letterSpacing: '-0.04em',
    lineHeight: 1.14,
  },
  'article[data-v-content] .docs-product-overview-copy p[data-v]': {
    marginBlock: '16px 0',
    fontSize: '16px',
    lineHeight: 1.6,
  },
  'article[data-v-content] .docs-product-overview-copy h1[data-v] + p[data-v]': {
    color: 'color-mix(in srgb, var(--foreground) 68%, transparent)',
    fontSize: '17px',
  },
  ':where(.dark, [data-vocs-theme="dark"], [style*="color-scheme: dark"]) .docs-product-overview-art':
    {
      '--tempo-art-ink': '#f5f5f5',
      '--tempo-art-secondary': '#b5b5b5',
      '--tempo-art-surface': '#202020',
      '--tempo-art-paper': '#151515',
      '--tempo-art-line': '#737373',
      '--tempo-art-strong': '#e0e0e0',
      '--tempo-art-border': '#424242',
      '--tempo-art-faint': '#2c2c2c',
      '--tempo-art-divider': '#3a3a3a',
    },
})

export const docsProductOverview = style({
  containerType: 'inline-size',
  marginBlock: '0 24px',
})

export const docsProductOverviewLayout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
  alignItems: 'center',
  gap: '32px',
  '@container (width <= 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: '20px',
  },
})

export const docsProductOverviewCopy = style({
  minWidth: 0,
})

export const docsProductOverviewArt = style({
  width: '100%',
  maxWidth: '320px',
  margin: 0,
  justifySelf: 'end',
  overflow: 'hidden',
  borderRadius: '16px',
  selectors: {
    '& svg': {
      display: 'block',
      width: '100%',
      height: 'auto',
      aspectRatio: '4 / 3',
      fontFamily: 'var(--tempo-font-body), sans-serif',
    },
    '& svg text': {
      WebkitUserSelect: 'text',
      userSelect: 'text',
    },
  },
  '@container (width <= 640px)': {
    maxWidth: '320px',
    justifySelf: 'center',
  },
})
