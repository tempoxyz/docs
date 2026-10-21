import { Addresses } from 'viem/tempo'
import { alphaUsd, betaUsd, client } from './network.config'

// [!region quote]
const quote = await client.dex.getSellQuote({
  tokenIn: alphaUsd,
  tokenOut: betaUsd,
  amountIn: 1_000_000n,
})
// [!endregion quote]

// [!region approve]
await client.token.approveSync({
  token: alphaUsd,
  spender: Addresses.stablecoinDex,
  amount: 1_000_000n,
})
// [!endregion approve]

// [!region swap]
const { receipt } = await client.dex.sellSync({
  tokenIn: alphaUsd,
  tokenOut: betaUsd,
  amountIn: 1_000_000n,
  minAmountOut: (quote * 995n) / 1000n,
})
console.log(receipt.transactionHash)
// [!endregion swap]
