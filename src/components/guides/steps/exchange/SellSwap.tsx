'use client'
import { formatUnits, parseUnits } from 'viem'
import { Actions, Addresses } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendCallsSync } from 'wagmi'
import { Hooks } from 'wagmi/tempo'

import { Button, ExplorerLink } from '../../Demo'
import { alphaUsd, betaUsd } from '../../tokens'

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
  const slippageTolerance = 0.005
  const minAmountOut = quote
    ? (quote * BigInt(Math.floor((1 - slippageTolerance) * 1000))) / 1000n
    : 0n

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Sell 10 AlphaUSD for BetaUSD</h3>
        <Button
          variant={sendCalls.isSuccess ? 'default' : 'accent'}
          disabled={!address}
          onClick={() => {
            sendCalls.sendCallsSync({
              calls,
            })
          }}
          type="button"
          className="font-normal text-[14px] -tracking-[2%]"
        >
          {sendCalls.isPending ? 'Selling...' : 'Sell'}
        </Button>
      </div>
      {sendCalls.error && <div className="text-[14px] text-red-500">{sendCalls.error.message}</div>}
      {quote && address && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-start gap-1">
            <span className="text-[14px] text-gray11">Quote:</span>
            <span className="text-[14px] text-gray12">
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
