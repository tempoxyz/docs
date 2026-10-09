import { global } from 'zyzz/web'
import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  'article[data-v-content] .docs-product-overview-copy h1[data-v]': {
    margin: 0,
    padding: 0,
    border: 0,
    // design-exception: Preserve this responsive geometry across viewport sizes.
    fontSize: 'clamp(32px, 4.5cqi, 42px) !custom',
    letterSpacing: tokens.letterSpacing.display,

    lineHeight: tokens.lineHeight.display,
  },
  'article[data-v-content] .docs-product-overview-copy p[data-v]': {
    // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
    marginBlock: '16px 0 !custom',
    fontSize: tokens.fontSize.body,
    lineHeight: tokens.lineHeight.relaxed,
  },
  'article[data-v-content] .docs-product-overview-copy h1[data-v] + p[data-v]': {
    color: inherited.color.colorMixInSrgbForeground68Transparent,

    fontSize: tokens.fontSize.body,
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
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  marginBlock: '0 24px !custom',
})

export const docsProductOverviewLayout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
  alignItems: 'center',
  gap: tokens.spacing['8'],
  '@container (width <= 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: tokens.spacing['5'],
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

  borderRadius: tokens.radius.xl,
  selectors: {
    '& svg': {
      display: 'block',
      width: '100%',
      height: 'auto',
      aspectRatio: '4 / 3',

      fontFamily: inherited.fontFamily.tempoFontBodySansSerif,
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
