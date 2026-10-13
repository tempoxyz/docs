import { type Address, formatUnits } from 'viem'
import { Addresses, Actions as ViemActions } from 'viem/tempo'
import { estimateGas, getGasPrice, waitForTransactionReceipt } from 'wagmi/actions'
import { Actions } from 'wagmi/tempo'
import { alphaUsd, betaUsd, config } from './network.wagmi.config'

// Call these examples from an event handler after connecting the wallet.
export async function networkExamples(recipient: Address, accountAddress: Address) {
  // [!region send]
  const hash = await Actions.token.transfer(config, {
    token: alphaUsd,
    to: recipient,
    amount: 1_000_000n,
  })
  // [!endregion send]

  // [!region receipt]
  const receipt = await waitForTransactionReceipt(config, { hash })
  if (receipt.status !== 'success') throw new Error('Transaction reverted')
  console.log(receipt.transactionHash)
  // [!endregion receipt]

  // [!region fee-token]
  await Actions.fee.setUserTokenSync(config, { token: alphaUsd })
  // [!endregion fee-token]

  // [!region sponsor]
  await Actions.token.transferSync(config, {
    token: alphaUsd,
    to: recipient,
    amount: 1_000_000n,
    feePayer: true,
  })
  // [!endregion sponsor]

  // [!region estimate]
  const transfer = ViemActions.token.transfer.call({
    token: alphaUsd,
    to: recipient,
    amount: 1_000_000n,
  })
  const gas = await estimateGas(config, { ...transfer, account: accountAddress })
  // [!endregion estimate]

  // [!region cost]
  const gasPrice = await getGasPrice(config)
  const microdollars = (gas * gasPrice + 10n ** 12n - 1n) / 10n ** 12n
  console.log('Estimated fee (USD):', formatUnits(microdollars, 6))
  // [!endregion cost]

  // [!region create]
  const { token } = await Actions.token.createSync(config, {
    name: 'Demo USD',
    symbol: 'DEMO',
    currency: 'USD',
  })
  console.log(token)
  // [!endregion create]

  // [!region roles]
  await Actions.token.grantRolesSync(config, {
    token,
    roles: ['issuer'],
    to: accountAddress,
  })
  // [!endregion roles]

  // [!region mint]
  await Actions.token.mintSync(config, {
    token,
    to: accountAddress,
    amount: 100_000_000n,
  })
  // [!endregion mint]

  // [!region quote]
  const quote = await Actions.dex.getSellQuote(config, {
    tokenIn: alphaUsd,
    tokenOut: betaUsd,
    amountIn: 1_000_000n,
  })
  // [!endregion quote]

  // [!region approve]
  await Actions.token.approveSync(config, {
    token: alphaUsd,
    spender: Addresses.stablecoinDex,
    amount: 1_000_000n,
  })
  // [!endregion approve]

  // [!region swap]
  const result = await Actions.dex.sellSync(config, {
    tokenIn: alphaUsd,
    tokenOut: betaUsd,
    amountIn: 1_000_000n,
    minAmountOut: (quote * 995n) / 1000n,
  })
  console.log(result.receipt.transactionHash)
  // [!endregion swap]
}
