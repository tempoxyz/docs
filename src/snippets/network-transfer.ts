// [!region send]
import { alphaUsd, client, recipient } from './network.config'

const hash = await client.token.transfer({
  token: alphaUsd,
  to: recipient,
  amount: 1_000_000n,
})
// [!endregion send]

// [!region receipt]
const receipt = await client.waitForTransactionReceipt({ hash })
if (receipt.status !== 'success') throw new Error('Transaction reverted')
console.log(receipt.transactionHash)
// [!endregion receipt]
