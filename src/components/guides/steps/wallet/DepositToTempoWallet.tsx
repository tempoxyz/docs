'use client'

import { useMutation } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { getTempoIdInstance } from '../../../../lib/tempo-id'
import { useTempoIdConnector } from '../../../../wagmi.config'
import { Button, Step } from '../../Demo'
import * as form from '../../form.recipes'
import type { DemoStepProps } from '../types'

export function DepositToTempoWallet(props: DemoStepProps) {
  const { stepNumber = 2 } = props
  const { address, connector: activeConnector, status } = useConnection()
  const connector = useTempoIdConnector()
  const isTempoId = Boolean(
    status === 'connected' && address && activeConnector?.id === 'tempoId' && connector,
  )

  const deposit = useMutation({
    async mutationFn() {
      if (!isTempoId || !connector) throw new Error('Sign in with Tempo before adding funds.')
      const instance = await getTempoIdInstance(connector)
      // The guides sign in on testnet, where Tempo's funding page offers the faucet first.
      await instance.funding.open()
    },
  })

  return (
    <Step
      active={isTempoId}
      completed={false}
      actions={
        <Button
          disabled={!isTempoId || deposit.isPending}
          variant={isTempoId ? 'accent' : 'default'}
          className={form.actionButton().className}
          onClick={() => deposit.mutate()}
          type="button"
        >
          {deposit.isPending ? 'Opening…' : 'Add funds'}
        </Button>
      }
      error={deposit.error}
      number={stepNumber}
      title="Add funds to your Tempo Account."
    />
  )
}
