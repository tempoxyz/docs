'use client'
import * as React from 'react'
import { type Log, parseUnits } from 'viem'
import { Actions, Addresses } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendCallsSync } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd, pathUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './PlaceOrder.recipes'

export function PlaceOrder(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { setData, clearData, getData } = useDemoContext()

  const orderId = getData('orderId')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })

  const sendCalls = useSendCallsSync()

  useConnectionEffect({
    onDisconnect() {
      sendCalls.reset()
      clearData('orderId')
    },
  })

  // Extract and store orderId after successful order placement
  React.useEffect(() => {
    if (sendCalls.isSuccess && sendCalls.data?.receipts?.[0]) {
      try {
        const {
          args: { orderId },
        } = Actions.dex.place.extractEvent(sendCalls.data.receipts[0].logs as Log[])
        console.log('orderId', orderId)
        setData('orderId', orderId)
      } catch (error) {
        console.error('Failed to extract orderId:', error)
      }
    }
  }, [sendCalls.isSuccess, sendCalls.data, setData])

  const amount = parseUnits('100', metadata?.decimals || 6)

  const calls = [
    Actions.token.approve.call({
      spender: Addresses.stablecoinDex,
      amount,
      token: pathUsd,
    }),
    Actions.dex.place.call({
      amount,
      tick: 0,
      token: alphaUsd,
      type: 'buy',
    }),
  ]

  const active = React.useMemo(() => {
    return !!address && !orderId
  }, [address, orderId])

  return (
    <Step
      active={active && (last ? true : !sendCalls.isSuccess)}
      completed={sendCalls.isSuccess || !!orderId}
      actions={
        <Button
          variant={active ? (sendCalls.isSuccess ? 'default' : 'accent') : 'default'}
          disabled={!active}
          onClick={() => {
            sendCalls.sendCallsSync({
              calls,
            })
          }}
          type="button"
          className={ui.placeOrderButton().className}
        >
          {sendCalls.isPending ? 'Placing Order...' : 'Place Order'}
        </Button>
      }
      number={stepNumber}
      title="Approve spend and place buy order for 100 AlphaUSD"
    >
      {sendCalls.isSuccess && sendCalls.data && (
        <div {...ui.placeOrderLayout()}>
          <div {...ui.placeOrderLayout2()}>
            <ExplorerLink hash={sendCalls.data.receipts?.at(0)?.transactionHash as `0x${string}`} />
          </div>
        </div>
      )}
    </Step>
  )
}
