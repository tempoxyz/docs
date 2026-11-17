'use client'

import { formatUnits, parseUnits } from 'viem'
import { Actions } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendTransactionSync } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd, betaUsd } from '../../tokens'
import * as ui from './SellSwap.recipes'

export function SellSwap({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useConnection()

  const { data: tokenInMetadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })
  const { data: tokenOutMetadata } = Hooks.token.useGetMetadata({
    token: betaUsd,
  })

  const amount = parseUnits('10', tokenInMetadata?.decimals || 6)

  const { data: quote } = Hooks.dex.useSellQuote({
    tokenIn: alphaUsd,
    tokenOut: betaUsd,
    amountIn: amount,
    query: {
      enabled: !!address,
      refetchInterval: 1000,
    },
  })

  // Calculate 0.5% slippage tolerance
  const minAmountOut = quote ? (quote * 995n) / 1000n : 0n

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
    Actions.dex.sell.call({
      amountIn: amount,
      minAmountOut,
      tokenIn: alphaUsd,
      tokenOut: betaUsd,
    }),
  ]

  return (
    <div {...ui.sellSwapLayout()}>
      <div {...ui.sellSwapLayout2()}>
        <h3 {...ui.sellSwapHeading()}>Sell 10 AlphaUSD for BetaUSD</h3>
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
          {sendTransaction.isPending ? 'Selling...' : 'Sell'}
        </Button>
      </div>
      {sendTransaction.error && <div {...ui.sellSwapLayout3()}>{sendTransaction.error.message}</div>}
      {quote && address && (
        <div {...ui.sellSwapLayout4()}>
          <div {...ui.sellSwapLayout5()}>
            <span {...ui.sellSwapText()}>Quote:</span>
            <span {...ui.sellSwapText2()}>
              10 {tokenInMetadata?.name} = {formatUnits(quote, tokenOutMetadata?.decimals || 6)}{' '}
              {tokenOutMetadata?.name}
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
