'use client'

import { useMutation } from '@tanstack/react-query'
import { numberToHex } from 'viem'
import { tempo } from 'viem/chains'
import { useChainId, useConnection, useSwitchChain } from 'wagmi'
import { useTempoWalletConnector } from '../../../../wagmi.config'
import { Button, Step } from '../../Demo'
import * as form from '../../form.recipes'
import type { DemoStepProps } from '../types'

export function DepositToTempoWallet(props: DemoStepProps) {
  const { stepNumber = 2 } = props
  const { address, connector: activeConnector, status } = useConnection()
  const chainId = useChainId()
  const switchChain = useSwitchChain()
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
      // The wallet runs each request on the app's current chain, and the guides connect on
      // Moderato, so fund on mainnet and switch back for the other demos.
      const previousChainId = chainId
      if (previousChainId !== tempo.id)
        await switchChain.switchChainAsync({ chainId: tempo.id, connector })
      try {
        await provider.request({
          method: 'wallet_deposit',
          params: [{ address, chainId: numberToHex(tempo.id) }],
        })
      } finally {
        if (previousChainId !== tempo.id)
          await switchChain
            .switchChainAsync({ chainId: previousChainId, connector })
            .catch(() => {})
      }
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
          className={form.actionButton().className}
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
