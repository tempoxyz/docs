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

export function RevokeTokenRoles(
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

  // Check if user has any of the roles to revoke
  const hasAnyRole = roleChecks.some((check) => check.data === true)

  const revoke = Hooks.token.useRevokeRolesSync({
    mutation: {
      onSettled() {
        queryClient.refetchQueries({ queryKey: ['hasRole'] })
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      revoke.reset()
    },
  })

  const handleRevoke = async () => {
    if (!tokenAddress || !address) return

    await revoke.mutate({
      token: tokenAddress,
      roles: roles,
      from: address,
      feeToken: alphaUsd,
    })
  }

  return (
    <Step
      active={!!tokenAddress && hasAnyRole && (last ? true : !revoke.isSuccess)}
      completed={revoke.isSuccess}
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
              tokenAddress && hasAnyRole ? (revoke.isSuccess ? 'default' : 'accent') : 'default'
            }
            disabled={!tokenAddress || !hasAnyRole}
            onClick={() => setExpanded(true)}
            type="button"
            className={form.actionButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Revoke ${roles.join(', ')} role${roles.length > 1 ? 's' : ''} on ${metadata ? metadata.name : 'token'}.`}
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...form.fieldsRow()}>
              <div {...form.primaryField()}>
                <label {...form.label()} htmlFor="recipient">
                  Revoke role from yourself
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
                onClick={handleRevoke}
                type="button"
                className={form.actionButton().className}
              >
                {revoke.isPending ? 'Revoking...' : 'Revoke'}
              </Button>
            </div>
            {revoke.isSuccess && revoke.data && (
              <ExplorerLink hash={revoke.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
