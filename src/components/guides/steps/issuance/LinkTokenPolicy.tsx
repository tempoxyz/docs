'use client'
import * as React from 'react'
import { useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function LinkTokenPolicy(props: DemoStepProps) {
  const { stepNumber } = props
  const { data } = useDemoContext()
  const [expanded, setExpanded] = React.useState(false)

  const { tokenAddress, policyId } = data

  const { data: metadata, refetch: refetchMetadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  const linkPolicy = Hooks.token.useChangeTransferPolicySync({
    mutation: {
      onSuccess() {
        refetchMetadata()
      },
    },
  })

  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      linkPolicy.reset()
    },
  })

  const handleLinkPolicy = async () => {
    if (!tokenAddress || !policyId) return

    await linkPolicy.mutateAsync({
      policyId,
      token: tokenAddress,
      feeToken: alphaUsd,
    })
  }

  const isLinking = linkPolicy.isPending
  const isComplete = linkPolicy.isSuccess
  const hasError = linkPolicy.isError

  return (
    <Step
      active={!!tokenAddress && !!policyId && !isComplete}
      completed={isComplete}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="-tracking-[2%] font-normal text-[14px]"
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={tokenAddress && policyId && !isComplete ? 'accent' : 'default'}
            disabled={!tokenAddress || !policyId || isComplete}
            onClick={() => setExpanded(true)}
            type="button"
            className="-tracking-[2%] font-normal text-[14px]"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Link the policy to ${metadata ? metadata.name : 'your token'}.`}
    >
      {expanded && (
        <div className="mx-6 flex flex-col gap-3 pb-4">
          <div className="border-gray4 border-s-2 ps-5">
            <div className="mt-2 flex flex-col gap-2 pe-8 md:flex-row md:items-end">
              <div className="flex flex-1 flex-col">
                <div className="-tracking-[1%] mb-2 text-[13px] text-gray9">
                  This will link the transfer policy to {metadata ? metadata.name : 'your token'},
                  enforcing the blacklist.
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 pe-8 md:flex-row md:items-end">
              <Button
                variant="accent"
                onClick={handleLinkPolicy}
                disabled={isLinking}
                type="button"
                className="-tracking-[2%] font-normal text-[14px]"
              >
                {isLinking ? 'Linking...' : 'Link Policy'}
              </Button>
            </div>

            {hasError && (
              <div className="mt-2 text-[13px] text-red-500">
                Failed to link policy. Please try again.
              </div>
            )}

            {isComplete && linkPolicy.data && (
              <ExplorerLink hash={linkPolicy.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
