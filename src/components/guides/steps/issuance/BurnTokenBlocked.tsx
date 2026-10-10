'use client'

import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { parseUnits } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function BurnTokenBlocked(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: hasRole } = Hooks.token.useHasRole({
    account: address,
    token: tokenAddress,
    role: 'burnBlocked',
  })
  const { data: recipientBalance } = Hooks.token.useGetBalance({
    account: FAKE_RECIPIENT,
    token: tokenAddress,
  })

  const burnBlocked = Hooks.token.useBurnBlockedSync({
    mutation: {
      onSettled() {
        queryClient.refetchQueries({ queryKey: ['getBalance'] })
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      burnBlocked.reset()
    },
  })

  const handleBurnBlocked = () => {
    if (!tokenAddress || !address || !metadata) return

    burnBlocked.mutate({
      amount: parseUnits('100', metadata.decimals),
      from: FAKE_RECIPIENT,
      token: tokenAddress,
      feeToken: alphaUsd,
    })
  }

  const hasSufficientBalance =
    recipientBalance && metadata && recipientBalance.amount >= parseUnits('100', metadata.decimals)

  const active = React.useMemo(() => {
    return Boolean(
      tokenAddress &&
        hasRole &&
        hasSufficientBalance &&
        metadata.transferPolicyId &&
        metadata.transferPolicyId !== 1n,
    )
  }, [tokenAddress, hasRole, hasSufficientBalance, metadata])

  return (
    <Step
      active={active && (last ? true : !burnBlocked.isSuccess)}
      completed={burnBlocked.isSuccess}
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
            variant={active ? (burnBlocked.isSuccess ? 'default' : 'accent') : 'default'}
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
      title={`Burn 100 ${metadata ? metadata.name : 'tokens'} from blocked address.`}
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...form.fieldsRow()}>
              <div {...form.primaryField()}>
                <label {...form.label()} htmlFor="blockedAddress">
                  Blocked address
                </label>
                <input
                  {...form.input()}
                  data-1p-ignore
                  type="text"
                  id="blockedAddress"
                  name="blockedAddress"
                  value={FAKE_RECIPIENT}
                  disabled={true}
                  onChange={(_e) => {}}
                  placeholder="0x..."
                />
              </div>
              <Button
                variant={address ? 'accent' : 'default'}
                disabled={!address}
                onClick={handleBurnBlocked}
                type="button"
                className={form.actionButton().className}
              >
                {burnBlocked.isPending ? 'Burning...' : 'Burn'}
              </Button>
            </div>
            {burnBlocked.isSuccess && burnBlocked.data && (
              <ExplorerLink hash={burnBlocked.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
