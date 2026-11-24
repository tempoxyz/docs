// [!region client]
import { http } from 'viem'
import { tempoModerato } from 'viem/chains'
import { createClient } from 'viem/tempo'

// Tempo testnet. The public RPC needs no key.
export const client = createClient({
  chain: tempoModerato,
  transport: http(),
})
// [!endregion client]
