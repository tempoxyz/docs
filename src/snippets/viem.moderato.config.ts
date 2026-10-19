// [!region setup]
import { tempoModerato } from 'viem/chains'
import { Account, createClient } from 'viem/tempo'
import { alphausd } from 'viem/tokens'

const privateKey = process.env.TEMPO_PRIVATE_KEY
if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error('Set TEMPO_PRIVATE_KEY to your funded test account private key')
}

export const client = createClient({
  account: Account.fromSecp256k1(privateKey as `0x${string}`),
  chain: tempoModerato,
  feeToken: alphausd(42431).address,
})
// [!endregion setup]
