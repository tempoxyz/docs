'use client'
import * as React from 'react'
import { parseUnits } from 'viem'
import { Addresses } from 'viem/tempo'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd, pathUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function ApproveSpend(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()

  const approve = Hooks.token.useApproveSync()

  useConnectionEffect({
    onDisconnect() {
      approve.reset()
    },
  })

  const amount = parseUnits('100', 6)

  const active = React.useMemo(() => {
    return !!address
  }, [address])

  return (
    <Step
      active={active && (last ? true : !approve.isSuccess)}
      completed={approve.isSuccess}
      actions={
        <Button
          variant={active ? (approve.isSuccess ? 'default' : 'accent') : 'default'}
          disabled={!active}
          onClick={() => {
            approve.mutate({
              amount,
              spender: Addresses.stablecoinDex,
              token: pathUsd,
              feeToken: alphaUsd,
            })
          }}
          type="button"
          className="-tracking-[2%] font-normal text-[14px]"
        >
          {approve.isPending ? 'Approving...' : 'Approve Spend'}
        </Button>
      }
      number={stepNumber}
      title="Approve the Stablecoin DEX to spend pathUSD"
    >
      {approve.data && (
        <div className="mx-6 flex flex-col gap-3 pb-4">
          <div className="border-gray4 border-s-2 ps-5">
            <ExplorerLink hash={approve.data.receipt.transactionHash} />
          </div>
        </div>
      )}
    </Step>
  )
}
