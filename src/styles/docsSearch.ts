import { global } from 'zyzz/web'
import { vars as tokens } from './theme'

// The docs search is Vocs' own dialog (vocs/src/react/internal/Search.tsx), portalled
// by Base UI. The blog opens the same dialog through docsSearchUrl(), so these
// overrides style the one search the site has.

// S1: the open dialog's input shows no focus ring; the dialog itself is the focus
// context. Focus-visible rings stay on every other control.
global({
  '@layer utilities': {
    '[data-base-ui-portal] > [role="dialog"] input[role="combobox"]:focus-visible': {
      outline: 'none',
    },
  },
})

// S2: the dialog spans the docs content column instead of 600px: the article max
// width that globals.ts gives docs layouts (--vocs-spacing-content there, 985.7px at
// 16px Pilat). The dialog is portalled to <body>, outside that layout, so the same
// expression is repeated here.
// It takes the smoothed panel radius. G4: the light dialog matches the page and
// keeps a hairline; the dark one is lifted to #141414 and drops it.
global({
  '@layer utilities': {
    '[data-base-ui-portal] > [role="dialog"]:has(input[role="combobox"])': {
      maxWidth: 'calc(84ch + (var(--vocs-spacing-content-px) * 2))',
      borderColor: tokens.color.hairline,
      borderRadius: tokens.radius.panel,
      '--corner-radius': tokens.radius.panel,
      // design-exception: TDS shadow.primary (shade 008) under the lighter scrim; Vocs used shadow-2xl.
      boxShadow: '0 16px 48px rgb(0 0 0 / 0.08) !custom',
    },
    ':root:not(:where([data-theme="light"], [data-vocs-theme="light"])) [data-base-ui-portal] > [role="dialog"]:has(input[role="combobox"])':
      {
        borderColor: 'transparent',
        // design-exception: TDS shadow.primary in dark (shade 032).
        boxShadow: '0 16px 48px rgb(0 0 0 / 0.32) !custom',
      },
  },
})
