import { global } from 'zyzz/web'

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
