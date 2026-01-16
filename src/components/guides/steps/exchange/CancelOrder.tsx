'use client'
import * as React from 'react'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import type { DemoStepProps } from '../types'

export function CancelOrder(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { getData, clearData } = useDemoContext()

  const orderId = getData('orderId')
  const cancelOrder = Hooks.dex.useCancelSync()

  useConnectionEffect({
    onDisconnect() {
      cancelOrder.reset()
    },
  })

  // Clear orderId from context after successful cancellation
  React.useEffect(() => {
    if (cancelOrder.isSuccess) {
      clearData('orderId')
    }
  }, [cancelOrder.isSuccess, clearData])

  const active = React.useMemo(() => {
    return !!address && !!orderId
  }, [address, orderId])

  return (
    <Step
      active={active && (last ? true : !cancelOrder.isSuccess)}
      completed={cancelOrder.isSuccess}
      actions={
        <Button
          variant={active ? (cancelOrder.isSuccess ? 'default' : 'accent') : 'default'}
          disabled={!active}
          onClick={() => {
            if (orderId) {
              cancelOrder.mutate({ orderId })
            }
          }}
          type="button"
          className="font-normal text-[14px] -tracking-[2%]"
        >
          {cancelOrder.isPending ? 'Canceling...' : 'Cancel Order'}
        </Button>
      }
      number={stepNumber}
      title="Cancel the order"
    >
      {cancelOrder.isSuccess && cancelOrder.data && (
        <div className="mx-6 flex flex-col gap-3 pb-4">
          <div className="border-gray4 border-s-2 ps-5">
            <ExplorerLink hash={cancelOrder.data.receipt.transactionHash} />
            <div className="mt-2 text-gray-600 text-xs">
              Order #{orderId?.toString()} has been cancelled. Refunded tokens are in your exchange
              balance.
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}
