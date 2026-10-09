'use client'
import * as React from 'react'
import { parseUnits } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Step } from '../../Demo'
import { alphaUsd, betaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import { BuySwap } from './BuySwap'
import * as ui from './MakeSwaps.recipes'
import { SellSwap } from './SellSwap'

export function MakeSwaps({ stepNumber, last = false }: DemoStepProps) {
  const { address } = useConnection()
  const [buyCompleted, setBuyCompleted] = React.useState(false)
  const [sellCompleted, setSellCompleted] = React.useState(false)

  const { data: alphaUsdMetadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })
  const { data: betaUsdMetadata } = Hooks.token.useGetMetadata({
    token: betaUsd,
  })
  const { data: alphaUsdBalance } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const { data: betaUsdBalance } = Hooks.token.useGetBalance({
    account: address,
    token: betaUsd,
  })

  const active = React.useMemo(() => {
    return (
      !!address &&
      (alphaUsdBalance?.amount ?? 0n) > parseUnits('11', alphaUsdMetadata?.decimals || 6) &&
      (betaUsdBalance?.amount ?? 0n) > parseUnits('11', betaUsdMetadata?.decimals || 6)
    )
  }, [
    address,
    alphaUsdBalance,
    betaUsdBalance,
    alphaUsdMetadata?.decimals,
    betaUsdMetadata?.decimals,
  ])

  const completed = buyCompleted && sellCompleted

  useConnectionEffect({
    onDisconnect() {
      setBuyCompleted(false)
      setSellCompleted(false)
    },
  })

  return (
    <Step
      active={active && (last ? true : !completed)}
      completed={completed}
      number={stepNumber}
      title="Make Swaps"
    >
      {(active || completed) && (
        <div {...ui.makeSwapsLayout()}>
          <div {...ui.makeSwapsLayout2()}>
            <div {...ui.makeSwapsLayout3()}>
              <BuySwap onSuccess={() => setBuyCompleted(true)} />
              <SellSwap onSuccess={() => setSellCompleted(true)} />
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}
