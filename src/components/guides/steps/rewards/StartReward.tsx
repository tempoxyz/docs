'use client'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { parseUnits } from 'viem'
import { useConnection, useConnectionEffect, useWaitForTransactionReceipt } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import { REWARD_AMOUNT, REWARD_RECIPIENT_UNSET } from './Constants'

export function StartReward(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { getData, setData } = useDemoContext()
  const queryClient = useQueryClient()
  const tokenAddress = getData('tokenAddress')
  const rewardOptedIn = getData('rewardOptedIn')

  const [expanded, setExpanded] = React.useState(true)

  const { data: balance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  const { data: rewardInfo } = Hooks.reward.useUserRewardInfo({
    token: tokenAddress,
    account: address,
  })

  const start = Hooks.reward.useDistribute()
  const receipt = useWaitForTransactionReceipt({
    hash: start.data,
  })

  React.useEffect(() => {
    if (!receipt.data) return
    setData('rewardId', 1n)
    queryClient.refetchQueries({ queryKey: ['getUserRewardInfo'] })
    queryClient.refetchQueries({ queryKey: ['getBalance'] })
  }, [queryClient, receipt.data, setData])

  const isSuccess = Boolean(receipt.data)
  const isConfirming = Boolean(start.data && !receipt.data && !receipt.error)
  const isPending = start.isPending || isConfirming
  const error = start.error ?? receipt.error

  const txHash = receipt.data?.transactionHash ?? start.data

  useConnectionEffect({
    onDisconnect() {
      setExpanded(true)
      start.reset()
    },
  })

  const active = React.useMemo(() => {
    const activeWithBalance = Boolean(
      address &&
        balance &&
        balance > 0n &&
        tokenAddress &&
        metadata &&
        (rewardOptedIn || (!!rewardInfo && rewardInfo.rewardRecipient !== REWARD_RECIPIENT_UNSET)),
    )
    if (last) return activeWithBalance
    return activeWithBalance && !isSuccess
  }, [address, balance, tokenAddress, metadata, rewardOptedIn, rewardInfo, last, isSuccess])

  return (
    <Step
      active={active}
      completed={isSuccess}
      number={stepNumber}
      title={`Start a reward of ${REWARD_AMOUNT} ${metadata?.name || 'tokens'}.`}
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
            disabled={!active || isPending || !metadata}
            onClick={() => {
              if (!tokenAddress || !metadata) return
              start.mutate({
                amount: parseUnits(REWARD_AMOUNT, metadata.decimals),
                token: tokenAddress,
                feeToken: alphaUsd,
              })
            }}
          >
            {isPending ? 'Starting...' : 'Start Reward'}
          </Button>
        )
      }
    >
      {txHash && isSuccess && expanded && (
        <div className="ml-6 flex flex-col gap-3 py-4">
          <div className="border-gray4 border-s-2 ps-5">
            <div className="text-[13px] text-gray9 -tracking-[2%]">
              Successfully started reward distribution.
            </div>
            <ExplorerLink hash={txHash} />
          </div>
        </div>
      )}
    </Step>
  )
}
