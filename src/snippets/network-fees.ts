import { formatUnits } from 'viem'
import { createClient, http, withRelay } from 'viem/tempo'
import { alphaUsd, client, recipient } from './network.config'

// [!region choose]
await client.fee.setUserTokenSync({ token: alphaUsd })
// [!endregion choose]

// [!region sponsor-config]
const sponsored = createClient({
  account: client.account,
  testnet: true,
  feeToken: alphaUsd,
  transport: withRelay(http(), http('https://sponsor.moderato.tempo.xyz')),
})
// [!endregion sponsor-config]

// [!region sponsor]
await sponsored.token.transferSync({
  token: alphaUsd,
  to: recipient,
  amount: 1_000_000n,
  feePayer: true,
})
// [!endregion sponsor]

// [!region estimate]
const gas = await client.token.transfer.estimateGas({
  account: client.account,
  chain: client.chain,
  token: alphaUsd,
  to: recipient,
  amount: 1_000_000n,
})
// [!endregion estimate]

// [!region cost]
const gasPrice = await client.getGasPrice()
const microdollars = (gas * gasPrice + 10n ** 12n - 1n) / 10n ** 12n
console.log('Estimated fee (USD):', formatUnits(microdollars, 6))
// [!endregion cost]
