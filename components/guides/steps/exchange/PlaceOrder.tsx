import * as React from 'react'
import { Actions, Addresses } from 'tempo.ts/viem'
import { Hooks } from 'tempo.ts/wagmi'
import { parseUnits } from 'viem'
import { useAccount, useAccountEffect, useSendTransactionSync } from 'wagmi'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd, linkingUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function PlaceOrder(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })

  const sendTransaction = useSendTransactionSync()

  useAccountEffect({
    onDisconnect() {
      sendTransaction.reset()
    },
  })

  const amount = parseUnits('100', metadata?.decimals || 6)

  const calls = [
    Actions.token.approve.call({
      spender: Addresses.stablecoinExchange,
      amount,
      token: linkingUsd,
    }),
    Actions.dex.place.call({
      amount,
      tick: 0,
      token: alphaUsd,
      type: 'buy',
    }),
  ]

  const active = React.useMemo(() => {
    return !!address
  }, [address])

  return (
    <Step
      active={active && (last ? true : !sendTransaction.isSuccess)}
      completed={sendTransaction.isSuccess}
      actions={
        <Button
          variant={
            active
              ? sendTransaction.isSuccess
                ? 'default'
                : 'accent'
              : 'default'
          }
          disabled={!active}
          onClick={async () => {
            await sendTransaction.sendTransactionSyncAsync({
              calls,
              feeToken: alphaUsd,
            })
          }}
          type="button"
          className="text-[14px] -tracking-[2%] font-normal"
        >
          Place Order
        </Button>
      }
      number={stepNumber}
      title={`Place buy order for 100 AlphaUSD`}
    >
      {sendTransaction.data && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <ExplorerLink hash={sendTransaction.data.transactionHash} />
          </div>
        </div>
      )}
    </Step>
  )
}
