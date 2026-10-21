'use client'

import * as React from 'react'
import { fromHex, isAddress, parseUnits, toHex } from 'viem'
import { Abis } from 'viem/tempo'
import { useConnection, useConnectionEffect, useWatchContractEvent } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { cx as composeStyles } from 'zyzz'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './SendPaymentWithMemo.recipes'

interface MemoEvent {
  from: `0x${string}`
  to: `0x${string}`
  value: bigint
  memo: string
}

export function SendPaymentWithMemo(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const [recipient, setRecipient] = React.useState<string>(FAKE_RECIPIENT)
  const [memo, setMemo] = React.useState<string>('CUST-12345')
  const [memoError, setMemoError] = React.useState<string | null>(null)
  const [expanded, setExpanded] = React.useState(false)
  const [memoEvents, setMemoEvents] = React.useState<MemoEvent[]>([])
  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const sendPayment = Hooks.token.useTransferSync({
    mutation: {
      onSettled() {
        balanceRefetch()
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      setMemoError(null)
      setMemoEvents([])
      sendPayment.reset()
    },
  })

  useWatchContractEvent({
    address: alphaUsd,
    abi: Abis.tip20,
    eventName: 'TransferWithMemo',
    enabled: sendPayment.isSuccess,
    onLogs: (logs) => {
      for (const log of logs) {
        if (log.args.from === address) {
          const memoStr = fromHex(log.args.memo as `0x${string}`, 'string').replace(/\0/g, '')
          setMemoEvents((prev) => [
            ...prev,
            {
              from: log.args.from as `0x${string}`,
              to: log.args.to as `0x${string}`,
              value: log.args.amount as bigint,
              memo: memoStr,
            },
          ])
        }
      }
    },
  })

  const isValidRecipient = recipient && isAddress(recipient)

  const validateMemo = (value: string): string | null => {
    if (!value.trim()) {
      return 'Memo is required for reconciliation'
    }
    const byteLength = new TextEncoder().encode(value).length
    if (byteLength > 32) {
      return 'Memo must fit in 32 UTF-8 bytes'
    }
    return null
  }

  const handleMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMemo(value)
    setMemoError(validateMemo(value))
  }

  const handleTransfer = () => {
    const error = validateMemo(memo)
    if (!isValidRecipient || error) {
      setMemoError(error)
      return
    }
    sendPayment.mutate({
      amount: parseUnits('100', 6),
      to: recipient as `0x${string}`,
      token: alphaUsd,
      memo: toHex(memo, { size: 32 }),
    })
  }

  return (
    <Step
      active={
        Boolean(address && balance && balance.amount > 0n) && (last ? true : !sendPayment.isSuccess)
      }
      completed={sendPayment.isSuccess}
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
              address && balance && balance.amount > 0n
                ? sendPayment.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!(address && balance && balance.amount > 0n)}
            onClick={() => setExpanded(true)}
            type="button"
            className={form.actionButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title="Send a payment with a memo for reconciliation."
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...ui.sendPaymentWithMemoLayout3()}>
              <div {...ui.sendPaymentWithMemoLayout4()}>
                <label {...form.label()} htmlFor="memo">
                  Memo (e.g., customer ID, invoice number)
                </label>
                <input
                  {...composeStyles(
                    form.validatedInput(),
                    !!memoError && form.invalidBorder(),
                    !memoError && form.defaultBorder(),
                  )}
                  data-1p-ignore
                  type="text"
                  id="memo"
                  name="memo"
                  value={memo}
                  onChange={handleMemoChange}
                  placeholder="CUST-12345"
                />
                {memoError && <span {...form.errorText()}>{memoError}</span>}
              </div>
              <div {...ui.sendPaymentWithMemoLayout5()}>
                <div {...form.secondaryField()}>
                  <label {...form.label()} htmlFor="recipient">
                    Recipient address
                  </label>
                  <input
                    {...form.input()}
                    data-1p-ignore
                    type="text"
                    id="recipient"
                    name="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <Button
                  variant={
                    address &&
                    balance &&
                    balance.amount > 0n &&
                    isValidRecipient &&
                    !memoError &&
                    memo.trim()
                      ? 'accent'
                      : 'default'
                  }
                  disabled={
                    !(
                      address &&
                      balance &&
                      balance.amount > 0n &&
                      isValidRecipient &&
                      memo.trim()
                    ) || !!memoError
                  }
                  onClick={handleTransfer}
                  type="button"
                  className={form.actionButton().className}
                >
                  {sendPayment.isPending ? 'Sending...' : 'Send with Memo'}
                </Button>
              </div>
            </div>
            {sendPayment.isSuccess && sendPayment.data && (
              <div {...ui.sendPaymentWithMemoLayout7()}>
                <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
                {memoEvents.length > 0 && (
                  <div {...ui.sendPaymentWithMemoLayout8()}>
                    <p {...ui.sendPaymentWithMemoDescription()}>TransferWithMemo event detected:</p>
                    {memoEvents.map((event) => (
                      <div
                        key={`${event.from}-${event.to}-${event.memo}`}
                        {...ui.sendPaymentWithMemoLayout9()}
                      >
                        <span {...ui.sendPaymentWithMemoText2()}>memo:</span> "{event.memo}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
