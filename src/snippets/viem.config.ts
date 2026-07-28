// @ts-nocheck
// biome-ignore-all lint: snippet regions are included independently
// biome-ignore-all format: snippet

// [!region setup]
import { privateKeyToAccount } from 'viem/accounts'
import { createClient } from 'viem/tempo'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
})

// [!endregion setup]

// [!region moderato]
import { privateKeyToAccount } from 'viem/accounts'
import { createClient } from 'viem/tempo'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  testnet: true,
})
// [!endregion moderato]
