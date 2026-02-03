'use client'
import * as React from 'react'
import { isAddress, pad, parseUnits, stringToHex } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
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
      return `${byteLength - 32} characters too long`
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
      memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
    })
  }

  return (
    <Step
      active={Boolean(address && balance && balance > 0n) && (last ? true : !sendPayment.isSuccess)}
      completed={sendPayment.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="-tracking-[2%] font-normal text-[14px]"
            type="button"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant={
              address && balance && balance > 0n
                ? sendPayment.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!(address && balance && balance > 0n)}
            onClick={() => setExpanded(true)}
            type="button"
            className="-tracking-[2%] font-normal text-[14px]"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title="Send 100 AlphaUSD to a recipient."
    >
      {expanded && (
        <div className="mx-6 flex flex-col gap-3 pb-4">
          <div className="border-gray4 border-s-2 ps-5">
            <div className="mt-2 flex flex-col gap-2 pe-8 md:flex-row md:items-end">
              <div className="flex flex-2 flex-col">
                <label className="-tracking-[1%] text-[11px] text-gray9" htmlFor="recipient">
                  Recipient address
                </label>
                <input
                  className="-tracking-[2%] h-[34px] rounded-[50px] border border-gray4 px-3.25 font-normal text-[14px] text-black placeholder-gray9 dark:text-white"
                  data-1p-ignore
                  id="recipient"
                  type="text"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label className="-tracking-[1%] text-[11px] text-gray9" htmlFor="memo">
                  Memo (optional)
                </label>
                <input
                  className={`-tracking-[2%] h-[34px] rounded-[50px] border px-3.25 font-normal text-[14px] text-black placeholder-gray9 dark:text-white ${memoError ? 'border-red-500' : 'border-gray4'}`}
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
                  address && balance && balance > 0n && isValidRecipient && !memoError
                    ? 'accent'
                    : 'default'
                }
                disabled={!(address && balance && balance > 0n && isValidRecipient) || !!memoError}
                onClick={handleTransfer}
                type="button"
                className="-tracking-[2%] font-normal text-[14px]"
              >
                {sendPayment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {memoError && <span className="mt-1 text-[11px] text-red-500">{memoError}</span>}
            {sendPayment.isSuccess && sendPayment.data && (
              <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
