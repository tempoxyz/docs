// [!region testnet]
import { env } from 'node:process'
import { Account, createClient } from 'viem/tempo'

const privateKey = env.TEMPO_TEST_PRIVATE_KEY
if (!privateKey) throw new Error('Set TEMPO_TEST_PRIVATE_KEY')

const account = Account.fromSecp256k1(privateKey as `0x${string}`)
const client = createClient({ account, testnet: true })

await client.faucet.fundSync({ account })
// [!endregion testnet]
