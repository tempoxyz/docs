'use client'

import { useQueryClient } from '@tanstack/react-query'
import { TextInput } from '@tempoxyz/ds/platform/components'
import * as React from 'react'
import { parseUnits, toHex } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function BurnToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: hasRole } = Hooks.token.useHasRole({
    account: address,
    token: tokenAddress,
    role: 'issuer',
  })
  const { data: balance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })

  const burn = Hooks.token.useBurnSync({
    mutation: {
      onSettled() {
        // refetch token balance after burning
        queryClient.refetchQueries({ queryKey: ['getBalance'] })
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      burn.reset()
    },
  })

  const handleBurn = async () => {
    if (!tokenAddress || !address || !metadata) return

    await burn.mutate({
      amount: parseUnits('100', metadata.decimals),
      token: tokenAddress,
      memo: memo ? toHex(memo, { size: 32 }) : undefined,
      feeToken: alphaUsd,
    })
  }

  const hasSufficientBalance =
    balance && metadata && balance.amount >= parseUnits('100', metadata.decimals)
  const canBurn = !!tokenAddress && !!hasRole && hasSufficientBalance

  return (
    <Step
      active={Boolean(canBurn && (last ? true : !burn.isSuccess))}
      completed={burn.isSuccess}
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
            variant={canBurn ? (burn.isSuccess ? 'default' : 'accent') : 'default'}
            disabled={!canBurn}
            onClick={() => setExpanded(true)}
            type="button"
            className={form.actionButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Burn 100 ${metadata ? metadata.name : 'tokens'} from yourself.`}
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...form.fieldsRow()}>
              <div {...form.secondaryField()}>
                <label {...form.label()} htmlFor="memo">
                  Memo (optional)
                </label>
                <TextInput
                  appearance="secondary"
                  data-1p-ignore
                  type="text"
                  id="memo"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="INV-12345"
                />
              </div>
              <Button
                variant={address ? 'accent' : 'default'}
                disabled={!address}
                onClick={handleBurn}
                type="button"
                className={form.actionButton().className}
              >
                {burn.isPending ? 'Burning...' : 'Burn'}
              </Button>
            </div>
            {burn.isSuccess && burn.data && (
              <ExplorerLink hash={burn.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
