import { global } from 'zyzz/web'

// GS1: the Get Started hero. The page opens with its own #get-started anchor,
// which scopes this rule to it. The lead keeps the shared lead colour (secondary)
// and rhythm (lead → first content 32); it is only narrower. At 400px it ran four
// lines and left its last word alone; 560px sets it in three, and pretty wrapping
// keeps the last line from being a single word.
global({
  '@layer utilities': {
    'article[data-v-content]:has(> [id="get-started"]:is(:first-child, .docs-breadcrumbs + *)) > h1[data-v] + p[data-v]':
      {
        maxWidth: '560px',
        textWrap: 'pretty',
      },
  },
})
