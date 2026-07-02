'use client'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { useConnection, useConnectionEffect, useWaitForTransactionReceipt } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import { REWARD_AMOUNT } from './Constants'

export function ClaimReward(props: DemoStepProps) {
  const { stepNumber, last = false, flowDependencies = [] } = props
  const { address } = useConnection()
  const { getData, checkFlowDependencies } = useDemoContext()
  const queryClient = useQueryClient()
  const tokenAddress = getData('tokenAddress')

  const [expanded, setExpanded] = React.useState(true)

  const { data: balance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  const claim = Hooks.reward.useClaim()
  const receipt = useWaitForTransactionReceipt({
    hash: claim.data,
  })

  React.useEffect(() => {
    if (!receipt.data) return
    queryClient.refetchQueries({ queryKey: ['getBalance'] })
  }, [queryClient, receipt.data])

  const isSuccess = Boolean(receipt.data)
  const isConfirming = Boolean(claim.data && !receipt.data && !receipt.error)
  const isPending = claim.isPending || isConfirming
  const error = claim.error ?? receipt.error

  const txHash = receipt.data?.transactionHash ?? claim.data

  useConnectionEffect({
    onDisconnect() {
      setExpanded(true)
      claim.reset()
    },
  })

  const flowDependenciesMet = checkFlowDependencies(flowDependencies)

  const active = React.useMemo(() => {
    const activeWithBalance = Boolean(
      address && balance && balance > 0n && tokenAddress && flowDependenciesMet,
    )
    if (last) return activeWithBalance
    return activeWithBalance && !isSuccess
  }, [address, balance, tokenAddress, flowDependenciesMet, isSuccess, last])

  return (
    <Step
      active={active}
      completed={isSuccess}
      number={stepNumber}
      title="Claim your rewards."
      error={error}
      actions={
        isSuccess ? (
          <Button
            variant="default"
            onClick={() => setExpanded(!expanded)}
            className="font-normal text-[14px] -tracking-[2%]"
            type="button"
          >
            {expanded ? 'Hide' : 'Show'}
          </Button>
        ) : (
          <Button
            variant={active ? 'accent' : 'default'}
            disabled={!active || isPending}
            onClick={() => {
              if (!tokenAddress) return
              claim.mutate({
                token: tokenAddress,
                feeToken: alphaUsd,
              })
            }}
          >
            {isPending ? 'Claiming...' : 'Claim'}
          </Button>
        )
      }
    >
      {txHash && isSuccess && expanded && (
        <div className="ml-6 flex flex-col gap-3 py-4">
          <div className="border-gray4 border-s-2 ps-5">
            <div className="text-[13px] text-gray9 -tracking-[2%]">
              Successfully claimed {REWARD_AMOUNT} {metadata?.name ?? 'token'}.
            </div>
            <ExplorerLink hash={txHash} />
          </div>
        </div>
      )}
    </Step>
  )
}
