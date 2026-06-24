// [!region setup]
import { privateKeyToAccount } from 'viem/accounts'
import { createClient } from 'viem/tempo'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
})
// [!endregion setup]
