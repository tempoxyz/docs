import { global } from 'zyzz/web'
import { vars as tokens } from './theme'

// Steps follow the block rhythm: 24 between steps and 8 from a step's title to its
// body. Vocs spaces the steps 24 apart; its title sits 24 above a body that pulls up
// 8, so both margins are set here. The connector (the steps' left rule) is unchanged.
global({
  '@layer utilities': {
    '[data-v-steps] > * + *': {
      marginTop: tokens.spacing['6'],
    },
    '[data-v-steps] > * > [data-v-step-title]': {
      marginBottom: tokens.spacing['2'],
    },
    '[data-v-steps] > * > [data-v-step-content]': {
      marginTop: tokens.spacing['0'],
    },
  },
})
