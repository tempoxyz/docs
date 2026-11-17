'use client'

import { useMutation } from '@tanstack/react-query'
import { tempo } from 'viem/chains'
import { useConnection } from 'wagmi'
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
      if (!isTempoId || !connector) throw new Error('Sign in with Tempo ID before adding funds.')
      const instance = await (
        connector as unknown as {
          getInstance(): Promise<{
            funding: { open(p: { chainId: number }): Promise<unknown> }
          }>
        }
      ).getInstance()
      // The guides run on testnet, so open the deposit page for mainnet funds.
      await instance.funding.open({ chainId: tempo.id })
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
