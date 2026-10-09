'use client'
import { formatUnits, parseUnits } from 'viem'
import { Actions, Addresses } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendCallsSync } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink } from '../../Demo'
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
    <div {...ui.buySwapLayout()}>
      <div {...ui.buySwapLayout2()}>
        <h3 {...ui.buySwapHeading()}>Buy 10 AlphaUSD with BetaUSD</h3>
        <Button
          variant={sendCalls.isSuccess ? 'default' : 'accent'}
          disabled={!address || !quote || sendCalls.isPending}
          onClick={() => {
            sendCalls.sendCallsSync({
              calls,
            })
          }}
          type="button"
          className={ui.buySwapButton().className}
        >
          {sendCalls.isPending ? 'Buying...' : 'Buy'}
        </Button>
      </div>
      {sendCalls.error && <div {...ui.buySwapLayout3()}>{sendCalls.error.message}</div>}
      {quote && address && (
        <div {...ui.buySwapLayout4()}>
          <div {...ui.buySwapLayout5()}>
            <span {...ui.buySwapText()}>Quote:</span>
            <span {...ui.buySwapText2()}>
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
