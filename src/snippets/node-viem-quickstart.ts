// [!region testnet]
import { Account, createClient } from 'viem/tempo'

const privateKey = '0x...'
const account = Account.fromSecp256k1(privateKey)
const client = createClient({ account, testnet: true })

await client.faucet.fundSync({ account })

const token = '0x20c0000000000000000000000000000000000000' // pathUSD
const balance = await client.token.getBalance({ token })

const { receipt } = await client.token.transferSync({
  amount: { formatted: '1' },
  to: '0x742d35cc6634c0532925a3b844bc9e7595f0bebb',
  token,
})
// [!endregion testnet]
