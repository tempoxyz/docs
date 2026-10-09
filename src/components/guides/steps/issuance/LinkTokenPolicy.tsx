'use client'
import * as React from 'react'
import { useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './LinkTokenPolicy.recipes'

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
            className={ui.linkTokenPolicyButton().className}
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
            className={ui.linkTokenPolicyButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Link the policy to ${metadata ? metadata.name : 'your token'}.`}
    >
      {expanded && (
        <div {...ui.linkTokenPolicyLayout()}>
          <div {...ui.linkTokenPolicyLayout2()}>
            <div {...ui.linkTokenPolicyLayout3()}>
              <div {...ui.linkTokenPolicyLayout4()}>
                <div {...ui.linkTokenPolicyLayout5()}>
                  This will link the transfer policy to {metadata ? metadata.name : 'your token'},
                  enforcing the blacklist.
                </div>
              </div>
            </div>

            <div {...ui.linkTokenPolicyLayout6()}>
              <Button
                variant="accent"
                onClick={handleLinkPolicy}
                disabled={isLinking}
                type="button"
                className={ui.linkTokenPolicyButton().className}
              >
                {isLinking ? 'Linking...' : 'Link Policy'}
              </Button>
            </div>

            {hasError && (
              <div {...ui.linkTokenPolicyLayout7()}>Failed to link policy. Please try again.</div>
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
