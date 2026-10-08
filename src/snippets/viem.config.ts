// [!region setup]
import { Account, createClient } from 'viem/tempo'

export const client = createClient({
  account: Account.fromSecp256k1('0x...'),
})
// [!endregion setup]
