'use client'

import * as React from 'react'
import { isAddress, parseUnits, toHex } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { cx as composeStyles } from 'zyzz'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function SendPayment(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const [recipient, setRecipient] = React.useState<string>(FAKE_RECIPIENT)
  const [memo, setMemo] = React.useState<string>('')
  const [memoError, setMemoError] = React.useState<string | null>(null)
  const [expanded, setExpanded] = React.useState(false)
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
      sendPayment.reset()
    },
  })

  const isValidRecipient = recipient && isAddress(recipient)

  const validateMemo = (value: string): string | null => {
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
    if (!isValidRecipient || memoError) return
    sendPayment.mutate({
      amount: parseUnits('100', 6),
      to: recipient as `0x${string}`,
      token: alphaUsd,
      memo: memo ? toHex(memo, { size: 32 }) : undefined,
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
      title="Send 100 AlphaUSD to a recipient."
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...form.fieldsRow()}>
              <div {...form.primaryField()}>
                <label {...form.label()} htmlFor="recipient">
                  Recipient address
                </label>
                <input
                  {...form.input()}
                  data-1p-ignore
                  id="recipient"
                  type="text"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div {...form.secondaryField()}>
                <label {...form.label()} htmlFor="memo">
                  Memo (optional)
                </label>
                <input
                  {...composeStyles(
                    form.validatedInput(),
                    !!memoError && form.invalidBorder(),
                    !memoError && form.defaultBorder(),
                  )}
                  data-1p-ignore
                  id="memo"
                  type="text"
                  name="memo"
                  value={memo}
                  onChange={handleMemoChange}
                  placeholder="Optional"
                />
              </div>
              <Button
                variant={
                  address && balance && balance.amount > 0n && isValidRecipient && !memoError
                    ? 'accent'
                    : 'default'
                }
                disabled={
                  !(address && balance && balance.amount > 0n && isValidRecipient) || !!memoError
                }
                onClick={handleTransfer}
                type="button"
                className={form.actionButton().className}
              >
                {sendPayment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {memoError && <span {...form.errorText()}>{memoError}</span>}
            {sendPayment.isSuccess && sendPayment.data && (
              <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
