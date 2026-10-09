import { global } from 'zyzz/web'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  ':root': {
    '--tempo-card-radius': '24px',
    '--tempo-card-padding': '28px',
  },
  '@media (width < 700px)': {
    ':root': {
      '--tempo-card-padding': '24px',
    },
  },
  'article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )':
    {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto 1fr',
      alignContent: 'start',
      gap: '12px 10px',
      minWidth: 0,
      padding: 'var(--tempo-card-padding)',
      border: 0,
      borderRadius: 'var(--tempo-card-radius)',
      background: 'var(--surface-block)',
      color: 'var(--vocs-text-color-primary)',
      textDecoration: 'none',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > div':
    {
      margin: 0,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )):has(> [class~="vocs:size-8"])':
    {
      gridTemplateColumns: '20px minmax(0, 1fr)',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:size-8"]':
    {
      gridColumn: 1,
      gridRow: 1,
      width: '20px',
      height: '20px',
      marginTop: '3px',
      border: 0,
      borderRadius: 0,
      background: 'transparent',
      color: 'inherit',
    },
  ':is(:is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:size-8"]) > svg':
    {
      width: '20px',
      height: '20px',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:text-heading"]':
    {
      gridRow: 1,
      fontSize: '18px',
      fontWeight: 500,
      letterSpacing: '-0.015em',
      lineHeight: 1.4,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:text-secondary"]':
    {
      gridColumn: '1 / -1',
      alignSelf: 'start',
      color: 'var(--vocs-text-color-secondary)',
      fontSize: '14px',
      lineHeight: 1.6,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )):hover > [class~="vocs:text-heading"]':
    {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )):focus-visible':
    {
      outline: '2px solid var(--vocs-text-color-primary)',
      outlineOffset: '4px',
    },
})
