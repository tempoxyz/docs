'use client'

import * as React from 'react'
import { useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './CreateTokenPolicy.recipes'

export function CreateTokenPolicy(props: DemoStepProps) {
  const { stepNumber, flowDependencies = [] } = props
  const { data, setData, checkFlowDependencies } = useDemoContext()
  const [expanded, setExpanded] = React.useState(false)

  const { tokenAddress } = data

  const createPolicy = Hooks.policy.useCreateSync({
    mutation: {
      onSuccess(result) {
        setData('policyId', result.policyId)
      },
    },
  })

  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      createPolicy.reset()
    },
  })

  const handleCreatePolicy = async () => {
    if (!tokenAddress) return

    await createPolicy.mutateAsync({
      addresses: [FAKE_RECIPIENT],
      type: 'blacklist',
      feeToken: alphaUsd,
    })
  }

  const isCreating = createPolicy.isPending
  const isComplete = createPolicy.isSuccess
  const hasError = createPolicy.isError

  const active = !!tokenAddress && !isComplete && checkFlowDependencies(flowDependencies)

  return (
    <Step
      active={active}
      completed={isComplete}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className={form.actionButton().className}
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={active ? 'accent' : 'default'}
            disabled={!active}
            onClick={() => setExpanded(true)}
            type="button"
            className={form.actionButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title="Create a transfer policy."
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...form.fieldsRow()}>
              <div {...form.secondaryField()}>
                <div {...ui.createTokenPolicyLayout5()}>
                  This will create a blacklist policy that blocks {FAKE_RECIPIENT} from sending or
                  receiving tokens.
                </div>
              </div>
            </div>

            <div {...ui.createTokenPolicyLayout6()}>
              <Button
                variant="accent"
                onClick={handleCreatePolicy}
                disabled={isCreating}
                type="button"
                className={form.actionButton().className}
              >
                {isCreating ? 'Creating...' : 'Create Policy'}
              </Button>
            </div>

            {hasError && (
              <div {...ui.createTokenPolicyLayout7()}>
                Failed to create policy. Please try again.
              </div>
            )}

            {isComplete && createPolicy.data && (
              <ExplorerLink hash={createPolicy.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
