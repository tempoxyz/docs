'use client'

import { formatUnits, parseUnits } from 'viem'
import { Actions } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendTransactionSync } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd, betaUsd } from '../../tokens'
import * as ui from './BuySwap.recipes'

export function BuySwap({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useConnection()

  const { data: tokenInMetadata } = Hooks.token.useGetMetadata({
    token: betaUsd,
  })
  const { data: tokenOutMetadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })

  const amount = parseUnits('10', tokenInMetadata?.decimals || 6)

  const { data: quote } = Hooks.dex.useBuyQuote({
    tokenIn: betaUsd,
    tokenOut: alphaUsd,
    amountOut: amount,
    query: {
      enabled: !!address,
      refetchInterval: 1000,
    },
  })

  // Calculate 0.5% slippage tolerance
  const maxAmountIn = quote ? (quote * 1005n + 999n) / 1000n : 0n

  const sendTransaction = useSendTransactionSync({
    mutation: {
      onSuccess: () => {
        onSuccess?.()
      },
    },
  })

  useConnectionEffect({
    onDisconnect() {
      sendTransaction.reset()
    },
  })

  const calls = [
    Actions.dex.buy.call({
      amountOut: amount,
      maxAmountIn,
      tokenIn: betaUsd,
      tokenOut: alphaUsd,
    }),
  ]

  return (
    <div {...ui.buySwapLayout()}>
      <div {...ui.buySwapLayout2()}>
        <h3 {...ui.buySwapHeading()}>Buy 10 AlphaUSD with BetaUSD</h3>
        <Button
          variant={sendTransaction.isSuccess ? 'default' : 'accent'}
          disabled={!address || !quote || sendTransaction.isPending}
          onClick={() => {
            sendTransaction.sendTransactionSync({
              calls,
            })
          }}
          type="button"
          className={form.actionButton().className}
        >
          {sendTransaction.isPending ? 'Buying...' : 'Buy'}
        </Button>
      </div>
      {sendTransaction.error && <div {...ui.buySwapLayout3()}>{sendTransaction.error.message}</div>}
      {quote && address && (
        <div {...ui.buySwapLayout4()}>
          <div {...ui.buySwapLayout5()}>
            <span {...ui.buySwapText()}>Quote:</span>
            <span {...ui.buySwapText2()}>
              10 {tokenOutMetadata?.name} = {formatUnits(quote, tokenInMetadata?.decimals || 6)}{' '}
              {tokenInMetadata?.name}
            </span>
          </div>
          {sendTransaction.isSuccess && sendTransaction.data && (
            <ExplorerLink hash={sendTransaction.data.transactionHash} />
          )}
        </div>
      )}
    </div>
  )
}
