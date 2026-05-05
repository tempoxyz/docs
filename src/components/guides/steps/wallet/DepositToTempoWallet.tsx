'use client'
import { useMutation } from '@tanstack/react-query'
import { tempo } from 'viem/chains'
import { useConnection } from 'wagmi'
import { Button, Step } from '../../Demo'
import type { DemoStepProps } from '../types'

export function DepositToTempoWallet(props: DemoStepProps) {
  const { stepNumber = 2 } = props
  const { connector } = useConnection()
  const isTempoWallet = connector?.id === 'xyz.tempo'

  const deposit = useMutation({
    async mutationFn() {
      if (!connector) throw new Error('Tempo Wallet not connected')
      const provider = (await connector.getProvider()) as {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      }
      await provider.request({
        method: 'wallet_deposit',
        params: [{ chainId: tempo.id }],
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
          className="font-normal text-[14px] -tracking-[2%]"
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
