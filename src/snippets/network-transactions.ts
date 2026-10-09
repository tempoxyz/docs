// [!region build]
import { alphaUsd, client, recipient } from './network.config'

const call = client.token.transfer.call({
  token: alphaUsd,
  to: recipient,
  amount: 1_000_000n,
})
const request = await client.prepareTransactionRequest({ calls: [call] })
// [!endregion build]

// [!region sign]
const serializedTransaction = await client.signTransaction(request)
const hash = await client.sendRawTransaction({ serializedTransaction })
// [!endregion sign]

// [!region receipt]
const receipt = await client.waitForTransactionReceipt({ hash })
if (receipt.status !== 'success') throw new Error('Transaction reverted')
console.log(receipt.transactionHash)
// [!endregion receipt]
