'use client'
import { formatUnits, parseUnits } from 'viem'
import { Actions, Addresses } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendCallsSync } from 'wagmi'
import { Hooks } from 'wagmi/tempo'

import { Button, ExplorerLink } from '../../Demo'
import { alphaUsd, betaUsd } from '../../tokens'

export function BuySwap({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useConnection()

  const { data: tokenInMetadata } = Hooks.token.useGetMetadata({
    token: betaUsd,
  })
  const { data: tokenOutMetadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })

  const amount = parseUnits('10', tokenInMetadata?.decimals || 6)

  const {
    data: quote,
    error: quoteError,
    isPending: isQuotePending,
  } = Hooks.dex.useBuyQuote({
    tokenIn: betaUsd,
    tokenOut: alphaUsd,
    amountOut: amount,
    query: {
      enabled: !!address,
      refetchInterval: 1000,
    },
  })

  // Calculate 0.5% slippage tolerance
  const slippageTolerance = 0.005
  const maxAmountIn = quote
    ? (quote * BigInt(Math.floor((1 + slippageTolerance) * 1000))) / 1000n
    : 0n

  const sendCalls = useSendCallsSync({
    mutation: {
      onSuccess: () => {
        onSuccess?.()
      },
    },
  })

  const hasQuote = quote !== undefined && quote > 0n && !quoteError && !isQuotePending
  const canSwap = !!address && hasQuote && !sendCalls.isPending

  useConnectionEffect({
    onDisconnect() {
      sendCalls.reset()
    },
  })

  const calls = [
    Actions.token.approve.call({
      spender: Addresses.stablecoinDex,
      amount: maxAmountIn,
      token: betaUsd,
    }),
    Actions.dex.buy.call({
      amountOut: amount,
      maxAmountIn,
      tokenIn: betaUsd,
      tokenOut: alphaUsd,
    }),
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Buy 10 AlphaUSD with BetaUSD</h3>
        <Button
          variant={sendCalls.isSuccess ? 'default' : 'accent'}
          disabled={!canSwap}
          onClick={() => {
            if (!canSwap) return
            sendCalls.sendCallsSync({
              calls,
            })
          }}
          type="button"
          className="font-normal text-[14px] -tracking-[2%]"
        >
          {sendCalls.isPending ? 'Buying...' : 'Buy'}
        </Button>
      </div>
      {address && isQuotePending && <div role="status">Getting a quote...</div>}
      {address && quoteError && (
        <div role="alert" className="text-[14px] text-red-500">
          Couldn't get a quote. Waiting for a new quote before you can buy.
        </div>
      )}
      {address && !isQuotePending && !quoteError && quote === 0n && (
        <div role="status">No quote is available for this amount.</div>
      )}
      {sendCalls.error && <div className="text-[14px] text-red-500">{sendCalls.error.message}</div>}
      {hasQuote && quote !== undefined && address && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-start gap-1">
            <span className="text-[14px] text-gray11">Quote:</span>
            <span className="text-[14px] text-gray12">
              10 {tokenOutMetadata?.name} = {formatUnits(quote, tokenInMetadata?.decimals || 6)}{' '}
              {tokenInMetadata?.name}
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
