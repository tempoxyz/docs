import { global } from 'zyzz/web'
import { inherited } from '../styles/inherited'
import { vars as tokens } from '../styles/theme'

// Vocs boxes the Previous/Next pagination links below its sm breakpoint. Keep them as the same
// next-step cards at every width; this layer follows vocs_utilities so it outranks max-sm.
global({
  '@layer utilities': {
    '@media (width < 640px)': {
      '[data-v-pagination] > a': {
        paddingBlock: tokens.spacing['4'],
        paddingInline: tokens.spacing['5'],
        borderWidth: tokens.borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: tokens.color.hairline,
        borderRadius: tokens.radius.lg,
      },
    },
  },
})

// Document/Vocs integration selectors cannot be attached to owned elements.
// Vocs pagination links share the card markup, so they are excluded explicitly.
global({
  ':root': {
    // Cards are surfaces: radius 12, padding 20 (system-v2).
    '--tempo-card-radius': tokens.radius.lg,
    '--tempo-card-padding': '20px',
  },
  'article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )':
    {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto 1fr',
      alignContent: 'start',
      // Title to description 4; the icon column sits 8 from the title.
      rowGap: tokens.spacing['1'],
      columnGap: tokens.spacing['2'],
      minWidth: 0,
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      padding: 'var(--tempo-card-padding) !custom',
      // Surfaces sit on the page background with a 1px hairline.
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.hairline,
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      borderRadius: 'var(--tempo-card-radius) !custom',
      '--corner-radius': 'var(--tempo-card-radius)',
      backgroundColor: tokens.color.background,

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
      fontSize: tokens.fontSize.body,
      fontWeight: tokens.fontWeight.medium,

      letterSpacing: tokens.letterSpacing.normal,
      lineHeight: tokens.lineHeight.body,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )) > [class~="vocs:text-secondary"]':
    {
      gridColumn: '1 / -1',
      alignSelf: 'start',

      color: inherited.color.vocsTextColorSecondary,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
    },
  ':is(article[data-v-content] a[class~="vocs:flex-col"]:not([data-v-pagination] > a):has(> [class~="vocs:text-heading"]):has( > [class~="vocs:text-secondary"] )):focus-visible':
    {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: inherited.color.vocsTextColorPrimary,
      outlineOffset: '4px',
    },
})
