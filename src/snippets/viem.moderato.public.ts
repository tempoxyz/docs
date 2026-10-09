// [!region setup]
import { tempoModerato } from 'viem/chains'
import { createClient } from 'viem/tempo'

export const client = createClient({ chain: tempoModerato })
// [!endregion setup]
