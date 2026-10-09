'use client'
import * as React from 'react'
import { formatUnits } from 'viem'
import { Tick } from 'viem/tempo'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, Step } from '../../Demo'
import type { DemoStepProps } from '../types'
import * as ui from './QueryOrder.recipes'

export function QueryOrder(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { getData } = useDemoContext()
  const [hasQueried, setHasQueried] = React.useState(false)
  const [isQuerying, setIsQuerying] = React.useState(false)

  const orderId = getData('orderId')

  const {
    data: order,
    refetch,
    isSuccess,
  } = Hooks.dex.useOrder({
    orderId: orderId || 0n,
  })

  // Reset query state when orderId changes or becomes undefined
  React.useEffect(() => {
    if (!orderId) {
      setHasQueried(false)
      setIsQuerying(false)
    }
  }, [orderId])

  const active = React.useMemo(() => {
    return !!orderId
  }, [orderId])

  const handleQuery = async () => {
    setIsQuerying(true)
    await refetch()
    setHasQueried(true)
    setIsQuerying(false)
  }

  return (
    <Step
      active={active && (last ? true : !hasQueried)}
      completed={hasQueried}
      actions={
        <Button
          variant={active ? (hasQueried ? 'default' : 'accent') : 'default'}
          disabled={!active || isQuerying}
          onClick={handleQuery}
          type="button"
          className={ui.queryOrderButton().className}
        >
          {isQuerying ? 'Querying...' : hasQueried ? 'Query Again' : 'Query Order'}
        </Button>
      }
      number={stepNumber}
      title={`Query order details${orderId ? ` (ID: ${orderId})` : ''}`}
    >
      {hasQueried && isSuccess && order && (
        <div {...ui.queryOrderLayout()}>
          <div {...ui.queryOrderLayout2()}>
            <div {...ui.queryOrderLayout3()}>
              {/* Order Type and Price */}
              <div {...ui.queryOrderLayout4()}>
                <div>
                  <div {...ui.queryOrderLayout5()}>Type</div>
                  <div {...ui.queryOrderLayout6()}>
                    {order.isFlip ? 'Flip ' : 'Limit '}
                    {order.isBid ? (
                      <span {...ui.buy()}>Buy</span>
                    ) : (
                      <span {...ui.sell()}>Sell</span>
                    )}
                  </div>
                </div>
                <div>
                  <div {...ui.queryOrderLayout5()}>Price</div>
                  <div {...ui.queryOrderLayout7()}>
                    ${Tick.toPrice(order.tick)}{' '}
                    <span {...ui.queryOrderText()}>(tick: {order.tick})</span>
                  </div>
                </div>
              </div>

              {/* Amounts */}
              <div {...ui.queryOrderLayout4()}>
                <div>
                  <div {...ui.queryOrderLayout5()}>Original Amount</div>
                  <div {...ui.queryOrderLayout7()}>{formatUnits(order.amount, 6)} AlphaUSD</div>
                </div>
                <div>
                  <div {...ui.queryOrderLayout5()}>Remaining</div>
                  <div {...ui.queryOrderLayout7()}>{formatUnits(order.remaining, 6)} AlphaUSD</div>
                </div>
              </div>

              {/* Fill Progress */}
              {order.amount > 0n && order.amount !== order.remaining && (
                <div>
                  <div {...ui.queryOrderLayout5()}>Fill Progress</div>
                  <div {...ui.queryOrderLayout8()}>
                    <div {...ui.queryOrderLayout9()}>
                      <div
                        {...ui.queryOrderLayoutAppearance({
                          value0: `${Math.max(0, Math.min(100, Number(((order.amount - order.remaining) * 10000n) / order.amount) / 100))}%`,
                          className: ui.queryOrderLayout10().className,
                        })}
                      />
                    </div>
                    <span {...ui.queryOrderText2()}>
                      {Math.max(
                        0,
                        Math.min(
                          100,
                          Number(((order.amount - order.remaining) * 10000n) / order.amount) / 100,
                        ),
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}
