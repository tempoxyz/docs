import { global } from 'zyzz/web'
import { inherited } from '../styles/inherited'
import { vars as tokens } from '../styles/theme'

// Document/Vocs integration selectors cannot be attached to owned elements.
// Vocs pagination links share the card markup, so they are excluded explicitly.
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
  'article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )':
    {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto 1fr',
      alignContent: 'start',
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      gap: '12px 10px !custom',
      minWidth: 0,
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      padding: 'var(--tempo-card-padding) !custom',
      border: 0,
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      borderRadius: 'var(--tempo-card-radius) !custom',
      backgroundColor: tokens.color.panel,

      color: inherited.color.vocsTextColorPrimary,
      textDecoration: 'none',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > div':
    {
      margin: 0,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )):has(> [class~="vocs:size-8"])':
    {
      gridTemplateColumns: '20px minmax(0, 1fr)',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:size-8"]':
    {
      gridColumn: 1,
      gridRow: 1,
      width: '20px',
      height: '20px',

      marginTop: tokens.spacing['1'],
      border: 0,
      borderRadius: 0,
      backgroundColor: 'transparent !custom',
      color: 'inherit !custom',
    },
  ':is(:is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:size-8"]) > svg':
    {
      width: '20px',
      height: '20px',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:text-heading"]':
    {
      gridRow: 1,
      fontSize: tokens.fontSize.lead,
      fontWeight: tokens.fontWeight.medium,

      letterSpacing: tokens.letterSpacing.tight,
      lineHeight: tokens.lineHeight.snug,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:text-secondary"]':
    {
      gridColumn: '1 / -1',
      alignSelf: 'start',

      color: inherited.color.vocsTextColorSecondary,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )):hover > [class~="vocs:text-heading"]':
    {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )):focus-visible':
    {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: inherited.color.vocsTextColorPrimary,
      outlineOffset: '4px',
    },
})
