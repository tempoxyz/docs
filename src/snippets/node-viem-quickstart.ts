// [!region testnet]
import { Account, createClient } from 'viem/tempo'

const privateKey = '0x...'
const account = Account.fromSecp256k1(privateKey)
const client = createClient({ account, testnet: true })

await client.faucet.fundSync({ account })
// [!endregion testnet]
