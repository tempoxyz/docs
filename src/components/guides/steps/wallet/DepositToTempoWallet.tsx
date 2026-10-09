'use client'
import { useMutation } from '@tanstack/react-query'
import { numberToHex } from 'viem'
import { tempo } from 'viem/chains'
import { useConnection } from 'wagmi'
import { useTempoWalletConnector } from '../../../../wagmi.config'
import { Button, Step } from '../../Demo'
import type { DemoStepProps } from '../types'
import * as ui from './DepositToTempoWallet.recipes'

export function DepositToTempoWallet(props: DemoStepProps) {
  const { stepNumber = 2 } = props
  const { address, connector: activeConnector, status } = useConnection()
  const connector = useTempoWalletConnector()
  const isTempoWallet = Boolean(
    status === 'connected' && address && activeConnector?.id === 'xyz.tempo' && connector,
  )

  const deposit = useMutation({
    async mutationFn() {
      if (!isTempoWallet || !connector) throw new Error('Connect Tempo Wallet before adding funds.')
      const provider = (await connector.getProvider()) as {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      }
      await provider.request({
        method: 'wallet_deposit',
        params: [{ address, chainId: numberToHex(tempo.id) }],
      })
    },
  })

  return (
    <Step
      active={isTempoWallet}
      completed={false}
      actions={
        <Button
          disabled={!isTempoWallet || deposit.isPending}
          variant={isTempoWallet ? 'accent' : 'default'}
          className={ui.depositToTempoWalletButton().className}
          onClick={() => deposit.mutate()}
          type="button"
        >
          {deposit.isPending ? 'Opening…' : 'Add funds'}
        </Button>
      }
      error={deposit.error}
      number={stepNumber}
      title="Deposit funds into your Tempo Wallet."
    />
  )
}
