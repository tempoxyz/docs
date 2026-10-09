'use client'

import * as React from 'react'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import * as form from '../../form.recipes'
import type { DemoStepProps } from '../types'
import * as ui from './CancelOrder.recipes'

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
          className={form.actionButton().className}
        >
          {cancelOrder.isPending ? 'Canceling...' : 'Cancel Order'}
        </Button>
      }
      number={stepNumber}
      title="Cancel the order"
    >
      {cancelOrder.isSuccess && cancelOrder.data && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <ExplorerLink hash={cancelOrder.data.receipt.transactionHash} />
            <div {...ui.cancelOrderLayout3()}>
              Order #{orderId?.toString()} has been cancelled. Refunded tokens are in your exchange
              balance.
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}
