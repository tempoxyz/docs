'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import type { Chain, Client, Transport } from 'viem'
import { parseUnits } from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { Actions } from 'viem/tempo'
import { useBlockNumber, useClient, useConnections } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { assertSuccessfulFaucetReceipts } from '../../../../lib/developer-activation'
import { isFundableWalletConnector } from '../../../lib/wallets'
import { Button, Step } from '../../Demo'
import { useFaucetActivation } from '../../FaucetActivationExperiment'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function AddFundsToWallet(props: DemoStepProps) {
  const { stepNumber = 2, last = false } = props
  const isE2E = import.meta.env.VITE_E2E === 'true'
  const connections = useConnections()
  const walletConnection = connections.find((c) =>
    isFundableWalletConnector(c.connector, { includeWebAuthn: isE2E }),
  )
  const address = walletConnection?.accounts[0]
  const hasNonWebAuthnWallet = Boolean(address)
  const queryClient = useQueryClient()
  const activation = useFaucetActivation()

  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
    query: {
      enabled: hasNonWebAuthnWallet,
    },
  })
  const { data: blockNumber } = useBlockNumber({
    query: {
      enabled: Boolean(hasNonWebAuthnWallet && (!balance || balance.amount < 0)),
      refetchInterval: 1_500,
    },
  })
  React.useEffect(() => {
    balanceRefetch()
  }, [blockNumber])
  const client = useClient()
  const fundAccount = useMutation({
    async mutationFn() {
      if (!address) throw new Error('account.address not found')
      if (!client) throw new Error('client not found')

      let receipts: readonly { status?: string }[]
      if (import.meta.env.VITE_TEMPO_ENV !== 'localnet')
        receipts = await Actions.faucet.fundSync(client as unknown as Client<Transport, Chain>, {
          account: address,
        })
      else {
        const result = await Actions.token.transferSync(
          client as unknown as Client<Transport, Chain>,
          {
            account: mnemonicToAccount(
              'test test test test test test test test test test test junk',
            ),
            amount: parseUnits('10000', 6),
            to: address,
            token: alphaUsd,
          },
        )
        receipts = [result.receipt]
      }
      assertSuccessfulFaucetReceipts(receipts)
      await new Promise((resolve) => setTimeout(resolve, 400))
      queryClient.refetchQueries({ queryKey: ['getBalance'] })
      return receipts
    },
    onSuccess(receipts) {
      activation.claimSucceeded('connected_wallet', receipts.length)
    },
    onError(error) {
      activation.claimFailed('connected_wallet', error)
    },
  })

  const claimFunds = React.useCallback(() => {
    activation.claimStarted('connected_wallet')
    fundAccount.mutate()
  }, [activation, fundAccount.mutate])

  const active = React.useMemo(() => {
    // If this is the last step, simply has to have a non-webauthn wallet
    if (last) return hasNonWebAuthnWallet

    // If this is an intermediate step, also needs to not have balance yet
    return hasNonWebAuthnWallet && !balance
  }, [hasNonWebAuthnWallet, balance, last])

  const actions = React.useMemo(() => {
    if (balance && balance.amount > 0n)
      return (
        <Button
          disabled={!hasNonWebAuthnWallet || fundAccount.isPending}
          variant="default"
          className="font-normal text-[14px] -tracking-[2%]"
          onClick={claimFunds}
          type="button"
        >
          {fundAccount.isPending ? 'Adding funds' : 'Add more funds'}
        </Button>
      )
    return (
      <Button
        disabled={!hasNonWebAuthnWallet || fundAccount.isPending}
        variant={hasNonWebAuthnWallet ? 'accent' : 'default'}
        className="font-normal text-[14px] -tracking-[2%]"
        type="button"
        onClick={claimFunds}
      >
        {fundAccount.isPending ? 'Adding funds' : 'Add funds'}
      </Button>
    )
  }, [hasNonWebAuthnWallet, balance, fundAccount.isPending, claimFunds, fundAccount])

  return (
    <Step
      active={active}
      completed={Boolean(hasNonWebAuthnWallet && balance && balance.amount > 0n)}
      actions={actions}
      error={fundAccount.error}
      number={stepNumber}
      title="Add testnet funds to your wallet."
    />
  )
}
