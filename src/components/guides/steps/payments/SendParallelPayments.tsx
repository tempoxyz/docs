'use client'

import { useQueryClient } from '@tanstack/react-query'
import { type Config, getPublicClient } from '@wagmi/core'
import * as React from 'react'
import { type Hash, parseEventLogs, parseUnits } from 'viem'
import { Abis } from 'viem/tempo'
import { useConfig, useConnection, useConnectionEffect, useTransaction } from 'wagmi'
import { Actions, Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink, FAKE_RECIPIENT, FAKE_RECIPIENT_2, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './SendParallelPayments.recipes'

export type TransferState = {
  status: 'idle' | 'pending' | 'submitted' | 'success' | 'error' | 'unconfirmed'
  hash?: Hash
  error?: string
}

type FirstArgument<T> = T extends (arg: infer Arg, ...args: never[]) => unknown ? Arg : never

type TransferParameters = {
  account: `0x${string}`
  amount: bigint
  to: `0x${string}`
  token: typeof alphaUsd
  nonceKey: bigint
  nonce: number
}

export async function submitParallelPayment(
  config: Config,
  parameters: TransferParameters,
  onStateChange: (state: TransferState) => void,
): Promise<boolean> {
  onStateChange({ status: 'pending' })
  const chainId = config.state.chainId
  let hash: Hash | undefined
  try {
    hash = await Actions.token.transfer(config as FirstArgument<typeof Actions.token.transfer>, {
      ...parameters,
      chainId,
    })
    onStateChange({ status: 'submitted', hash })
    const publicClient = getPublicClient(config, { chainId })
    if (!publicClient) throw new Error('No client for the submitted transaction network')
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    if (receipt.status !== 'success') {
      onStateChange({ status: 'error', hash, error: 'Transaction reverted' })
      return false
    }
    const transfers = parseEventLogs({
      abi: Abis.tip20,
      eventName: 'Transfer',
      logs: receipt.logs.filter((log) => log.address.toLowerCase() === parameters.token),
      strict: true,
    })
    const delivered = transfers.some(
      ({ args }) =>
        args.from.toLowerCase() === parameters.account.toLowerCase() &&
        args.to.toLowerCase() === parameters.to.toLowerCase() &&
        args.amount === parameters.amount,
    )
    if (!delivered) throw new Error('The receipt does not confirm the expected payment')
    onStateChange({ status: 'success', hash: receipt.transactionHash })
    return true
  } catch (error) {
    onStateChange({
      status: hash ? 'unconfirmed' : 'error',
      hash,
      error: error instanceof Error ? error.message : 'Payment could not be confirmed',
    })
    return false
  }
}

function TransferResult({ label, state }: { label: string; state: TransferState }) {
  const { data: transaction } = useTransaction({
    hash: state.hash as `0x${string}` | undefined,
    query: {
      enabled: state.status === 'success' && !!state.hash,
    },
  })

  if (state.status === 'idle') return null

  return (
    <div {...ui.transferResultLayout()}>
      <div {...ui.transferResultLayout2()}>
        <span {...ui.transferResultText()}>{label}:</span>
        {state.status === 'pending' && (
          <span {...ui.transferResultText()}>Waiting for wallet...</span>
        )}
        {state.status === 'submitted' && (
          <span {...ui.transferResultText()}>Submitted; confirming...</span>
        )}
        {state.status === 'error' && (
          <span {...ui.transferResultText2()}>
            {state.hash ? 'Transaction reverted' : 'Transfer not submitted'}
          </span>
        )}
        {state.status === 'unconfirmed' && (
          <span {...ui.transferResultText()}>
            Payment not verified. Check the transaction before retrying.
          </span>
        )}
        {state.status === 'success' && <span {...ui.transferResultText()}>Confirmed</span>}
        {state.hash && <ExplorerLink hash={state.hash} />}
      </div>

      {state.status === 'success' && (
        <div {...ui.transferResultLayout3()}>
          {transaction ? (
            <>
              <span>Nonce Key: {transaction.nonceKey}</span>
              <span>Nonce: {transaction.nonce}</span>
            </>
          ) : (
            <span {...ui.transferResultText3()}>Loading nonce details...</span>
          )}
        </div>
      )}
    </div>
  )
}

export function SendParallelPayments(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const config = useConfig()
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = React.useState(false)

  const [transfer1, setTransfer1] = React.useState<TransferState>({
    status: 'idle',
  })
  const [transfer2, setTransfer2] = React.useState<TransferState>({
    status: 'idle',
  })

  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })

  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      setTransfer1({ status: 'idle' })
      setTransfer2({ status: 'idle' })
    },
  })

  const sendTransfer = async (
    params: TransferParameters,
    setTransfer: React.Dispatch<React.SetStateAction<TransferState>>,
  ) => {
    if (await submitParallelPayment(config, params, setTransfer)) {
      queryClient.refetchQueries({ queryKey: ['getBalance'] })
      balanceRefetch()
    }
  }

  const handleSendParallel = async () => {
    if (!address) return
    const actionConfig = config as FirstArgument<typeof Actions.nonce.getNonce>

    const [nonce1, nonce2] = await Promise.all([
      Actions.nonce.getNonce(actionConfig, { account: address, nonceKey: 1n }),
      Actions.nonce.getNonce(actionConfig, { account: address, nonceKey: 2n }),
    ])

    // Send both transfers without blocking
    sendTransfer(
      {
        account: address,
        amount: parseUnits('50', 6),
        to: FAKE_RECIPIENT,
        token: alphaUsd,
        nonceKey: 1n,
        nonce: Number(nonce1),
      },
      setTransfer1,
    )

    sendTransfer(
      {
        account: address,
        amount: parseUnits('50', 6),
        to: FAKE_RECIPIENT_2,
        token: alphaUsd,
        nonceKey: 2n,
        nonce: Number(nonce2),
      },
      setTransfer2,
    )
  }

  const bothSucceeded = transfer1.status === 'success' && transfer2.status === 'success'
  const isSending = [transfer1, transfer2].some(
    (transfer) => transfer.status === 'pending' || transfer.status === 'submitted',
  )
  const needsInspection = [transfer1, transfer2].some(
    (transfer) => transfer.status === 'unconfirmed',
  )
  const hasStarted = transfer1.status !== 'idle' || transfer2.status !== 'idle'

  return (
    <Step
      active={
        Boolean(address && balance && balance.amount >= parseUnits('100', 6)) &&
        (last ? true : !bothSucceeded)
      }
      completed={bothSucceeded}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className={form.actionButton().className}
            type="button"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant={
              address && balance && balance.amount >= parseUnits('100', 6)
                ? bothSucceeded
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!(address && balance && balance.amount >= parseUnits('100', 6))}
            onClick={() => setExpanded(true)}
            type="button"
            className={form.actionButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title="Send 50 AlphaUSD to two recipients in parallel."
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...ui.sendParallelPaymentsLayout3()}>
              <div {...ui.sendParallelPaymentsLayout4()}>
                <div {...ui.transferResultLayout()}>
                  <label {...form.label()} htmlFor="recipient1">
                    Recipient 1
                  </label>
                  <input
                    {...ui.sendParallelPaymentsInput()}
                    data-1p-ignore
                    type="text"
                    id="recipient1"
                    name="recipient1"
                    value={FAKE_RECIPIENT}
                    disabled
                    placeholder="0x..."
                  />
                </div>
                <div {...ui.transferResultLayout()}>
                  <label {...form.label()} htmlFor="recipient2">
                    Recipient 2
                  </label>
                  <input
                    {...ui.sendParallelPaymentsInput()}
                    data-1p-ignore
                    type="text"
                    id="recipient2"
                    name="recipient2"
                    value={FAKE_RECIPIENT_2}
                    disabled
                    placeholder="0x..."
                  />
                </div>
              </div>
              <div {...ui.sendParallelPaymentsLayout5()}>
                <Button
                  variant={
                    address && balance && balance.amount >= parseUnits('100', 6)
                      ? 'accent'
                      : 'default'
                  }
                  disabled={
                    !(address && balance && balance.amount >= parseUnits('100', 6)) ||
                    isSending ||
                    needsInspection
                  }
                  onClick={handleSendParallel}
                  type="button"
                  className={form.actionButton().className}
                >
                  {isSending ? 'Confirming payments...' : 'Send both payments'}
                </Button>
              </div>
            </div>
            {hasStarted && (
              <div {...ui.sendParallelPaymentsLayout6()}>
                <TransferResult label="Payment 1" state={transfer1} />
                <TransferResult label="Payment 2" state={transfer2} />
              </div>
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
