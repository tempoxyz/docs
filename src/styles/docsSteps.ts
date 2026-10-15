import { global } from 'zyzz/web'
import { vars as tokens } from './theme'

// QS2: every step after the first starts 48px below the previous one (Vocs
// spaces them 24px). Each step is a wrapper that opens with its heading, and
// sibling margins collapse, so this sets the full gap above steps 2 onward.
global({
  '@layer utilities': {
    '[data-v-steps] > * + *': {
      marginTop: tokens.spacing['12'],
    },
  },
})
