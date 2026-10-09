'use client'

import { formatUnits, parseUnits } from 'viem'
import { Actions, Addresses } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendCallsSync } from 'wagmi'
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

  const sendCalls = useSendCallsSync({
    mutation: {
      onSuccess: () => {
        onSuccess?.()
      },
    },
  })

  useConnectionEffect({
    onDisconnect() {
      sendCalls.reset()
    },
  })

  const calls = [
    Actions.token.approve.call({
      spender: Addresses.stablecoinDex,
      amount,
      token: alphaUsd,
    }),
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
          variant={sendCalls.isSuccess ? 'default' : 'accent'}
          disabled={!address || !quote || sendCalls.isPending}
          onClick={() => {
            sendCalls.sendCallsSync({
              calls,
            })
          }}
          type="button"
          className={form.actionButton().className}
        >
          {sendCalls.isPending ? 'Selling...' : 'Sell'}
        </Button>
      </div>
      {sendCalls.error && <div {...ui.sellSwapLayout3()}>{sendCalls.error.message}</div>}
      {quote && address && (
        <div {...ui.sellSwapLayout4()}>
          <div {...ui.sellSwapLayout5()}>
            <span {...ui.sellSwapText()}>Quote:</span>
            <span {...ui.sellSwapText2()}>
              10 {tokenInMetadata?.name} = {formatUnits(quote, tokenOutMetadata?.decimals || 6)}{' '}
              {tokenOutMetadata?.name}
            </span>
          </div>
          {sendCalls.isSuccess && sendCalls.data && (
            <ExplorerLink hash={sendCalls.data.receipts?.at(0)?.transactionHash as `0x${string}`} />
          )}
        </div>
      )}
    </div>
  )
}
