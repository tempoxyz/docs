'use client'

import * as React from 'react'
import { type Log, parseUnits } from 'viem'
import { Actions } from 'viem/tempo'
import { useConnection, useConnectionEffect, useSendTransactionSync } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function PlaceOrder(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { setData, clearData, getData } = useDemoContext()

  const orderId = getData('orderId')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })

  const sendTransaction = useSendTransactionSync()

  useConnectionEffect({
    onDisconnect() {
      sendTransaction.reset()
      clearData('orderId')
    },
  })

  // Extract and store orderId after successful order placement
  React.useEffect(() => {
    if (sendTransaction.isSuccess && sendTransaction.data) {
      try {
        const {
          args: { orderId },
        } = Actions.dex.place.extractEvent(sendTransaction.data.logs as Log[])
        console.log('orderId', orderId)
        setData('orderId', orderId)
      } catch (error) {
        console.error('Failed to extract orderId:', error)
      }
    }
  }, [sendTransaction.isSuccess, sendTransaction.data, setData])

  const amount = parseUnits('100', metadata?.decimals || 6)

  const calls = [
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
      active={active && (last ? true : !sendTransaction.isSuccess)}
      completed={sendTransaction.isSuccess || !!orderId}
      actions={
        <Button
          variant={active ? (sendTransaction.isSuccess ? 'default' : 'accent') : 'default'}
          disabled={!active}
          onClick={() => {
            sendTransaction.sendTransactionSync({
              calls,
            })
          }}
          type="button"
          className={form.actionButton().className}
        >
          {sendTransaction.isPending ? 'Placing Order...' : 'Place Order'}
        </Button>
      }
      number={stepNumber}
      title="Place buy order for 100 AlphaUSD"
    >
      {sendTransaction.isSuccess && sendTransaction.data && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <ExplorerLink hash={sendTransaction.data.transactionHash} />
          </div>
        </div>
      )}
    </Step>
  )
}
