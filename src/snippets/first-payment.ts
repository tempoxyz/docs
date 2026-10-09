// [!region account]
import { parseEventLogs, parseUnits } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { Abis, Account, createClient } from 'viem/tempo'

const account = Account.fromSecp256k1(generatePrivateKey())
const recipient = Account.fromSecp256k1(generatePrivateKey())
const token = '0x20c0000000000000000000000000000000000001'
const client = createClient({
  account,
  chain: tempoModerato,
  feeToken: token,
})

console.log('Sender:', account.address)
console.log('Recipient:', recipient.address)
// [!endregion account]

// [!region funds]
await client.faucet.fundSync({ account })

const balance = await client.token.getBalance({ token })
console.log('AlphaUSD balance:', balance.formatted)
// [!endregion funds]

// [!region payment]
const amount = parseUnits('1', 6)
const { receipt } = await client.token.transferSync({
  token,
  to: recipient.address,
  amount,
})
// [!endregion payment]

// [!region receipt]
if (receipt.status !== 'success') throw new Error('Transaction failed')

const transfers = parseEventLogs({
  abi: Abis.tip20,
  eventName: 'Transfer',
  logs: receipt.logs.filter((log) => log.address.toLowerCase() === token),
  strict: true,
})
const delivered = transfers.some(
  (transfer) =>
    transfer.args.from.toLowerCase() === account.address.toLowerCase() &&
    transfer.args.to.toLowerCase() === recipient.address.toLowerCase() &&
    transfer.args.amount === amount,
)
if (!delivered) throw new Error('Expected payment was not delivered')

console.log(`Receipt: https://explore.testnet.tempo.xyz/tx/${receipt.transactionHash}`)
// [!endregion receipt]
