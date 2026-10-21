// [!region testnet]
import { Account, createClient } from 'viem/tempo'
import { alphausd } from 'viem/tokens'

const privateKey = process.env.TEMPO_PRIVATE_KEY
if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error('Set TEMPO_PRIVATE_KEY to your test account private key')
}
const account = Account.fromSecp256k1(privateKey as `0x${string}`)
const token = alphausd(42431).address // alphaUSD on Moderato
const client = createClient({ account, testnet: true, feeToken: token })

await client.faucet.fundSync({ account })

const balance = await client.token.getBalance({ token })
console.log('Balance:', balance.formatted)

const { receipt } = await client.token.transferSync({
  amount: { formatted: '1' },
  to: '0x742d35cc6634c0532925a3b844bc9e7595f0bebb',
  token,
})
console.log('Transaction hash:', receipt.transactionHash)
// [!endregion testnet]
