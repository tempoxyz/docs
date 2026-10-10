import { global } from 'zyzz/web'
import { vars as tokens } from './theme'

// GS1: the Get Started hero. The page opens with its own #get-started anchor,
// which scopes these rules to it. The lede is narrower and in the primary color,
// and the page actions sit closer to the lede and to the quickstart line below.
global({
  '@layer utilities': {
    'article[data-v-content]:has(> [id="get-started"]:first-child) > h1[data-v] + p[data-v]': {
      maxWidth: '400px',
      marginBottom: tokens.spacing['4'],
      color: tokens.color.foreground,
    },
  },
})

// The page-actions recipe is unlayered, so this override is too. Without the
// recipe's bottom padding, its own margin sets the gap to the quickstart line.
global({
  'article[data-v-content]:has(> [id="get-started"]:first-child) > .docs-page-actions-host > .docs-page-actions':
    {
      paddingBottom: tokens.spacing['0'],
    },
})
