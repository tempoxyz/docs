'use client'

import { useQueryClient } from '@tanstack/react-query'
import type { TokenRole } from 'ox/tempo'
import * as React from 'react'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function GrantTokenRoles(
  props: DemoStepProps & {
    roles: TokenRole.TokenRole[]
  },
) {
  const { stepNumber, roles, last = false } = props
  const { address } = useConnection()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  // Check if user has each requested role
  const roleChecks = roles.map((role) =>
    // biome-ignore lint/correctness/useHookAtTopLevel: _
    Hooks.token.useHasRole({
      account: address,
      token: tokenAddress,
      role: role,
    }),
  )

  // Check if user has all roles
  const hasAllRoles = roleChecks.every((check) => check.data === true)

  const grant = Hooks.token.useGrantRolesSync({
    mutation: {
      onSettled() {
        queryClient.refetchQueries({ queryKey: ['hasRole'] })
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      grant.reset()
    },
  })

  const handleGrant = async () => {
    if (!tokenAddress || !address) return

    await grant.mutate({
      token: tokenAddress,
      roles: roles,
      to: address,
      feeToken: alphaUsd,
    })
  }

  return (
    <Step
      active={!!tokenAddress && !hasAllRoles && (last ? true : !grant.isSuccess)}
      completed={grant.isSuccess || hasAllRoles}
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
            variant={
              tokenAddress && !hasAllRoles ? (grant.isSuccess ? 'default' : 'accent') : 'default'
            }
            disabled={!tokenAddress || hasAllRoles}
            onClick={() => setExpanded(true)}
            type="button"
            className={form.actionButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Grant ${roles.join(', ')} role${roles.length > 1 ? 's' : ''} on ${metadata ? metadata.name : 'token'}.`}
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...form.fieldsRow()}>
              <div {...form.primaryField()}>
                <label {...form.label()} htmlFor="recipient">
                  Grant role to yourself
                </label>
                <input
                  {...form.input()}
                  data-1p-ignore
                  type="text"
                  id="recipient"
                  name="recipient"
                  value={address}
                  disabled={true}
                  onChange={() => {}}
                  placeholder="0x..."
                />
              </div>
              <Button
                variant={address ? 'accent' : 'default'}
                disabled={!address}
                onClick={handleGrant}
                type="button"
                className={form.actionButton().className}
              >
                {grant.isPending ? 'Granting...' : 'Grant'}
              </Button>
            </div>
            {grant.isSuccess && grant.data && (
              <ExplorerLink hash={grant.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
