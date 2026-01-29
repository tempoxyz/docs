'use client'
import * as React from 'react'
import { formatUnits, isAddress, pad, parseUnits, stringToHex } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function SendRelayerSponsoredPayment(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const [recipient, setRecipient] = React.useState<string>(FAKE_RECIPIENT)
  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)

  const { data: userBalance, refetch: userBalanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })

  const sendPayment = Hooks.token.useTransferSync({
    mutation: {
      onSettled() {
        userBalanceRefetch()
      },
    },
  })

  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      sendPayment.reset()
    },
  })

  const isValidRecipient = recipient && isAddress(recipient)

  const handleTransfer = () => {
    if (!isValidRecipient) return

    sendPayment.mutate({
      amount: parseUnits('100', 6),
      to: recipient as `0x${string}`,
      token: alphaUsd,
      memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
      feePayer: true,
    })
  }

  const active = React.useMemo(() => {
    return Boolean(address && userBalance && userBalance > 0n)
  }, [address, userBalance])

  return (
    <Step
      active={active && (last ? true : !sendPayment.isSuccess)}
      completed={sendPayment.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="font-normal text-[14px] -tracking-[2%]"
            type="button"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant={active ? (sendPayment.isSuccess ? 'default' : 'accent') : 'default'}
            disabled={!active}
            onClick={() => setExpanded(true)}
            type="button"
            className="font-normal text-[14px] -tracking-[2%]"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title="Send 100 AlphaUSD with fees sponsored by the testnet fee payer."
    >
      {expanded && (
        <div className="mx-6 flex flex-col gap-3 pb-4">
          <div className="border-gray4 border-s-2 ps-5">
            <div className="mt-2 mb-3 rounded-lg bg-gray2 p-3 text-[13px] -tracking-[1%]">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray10">Payment Token: AlphaUSD</span>
                  <span className="text-gray12">balance: {formatUnits(userBalance ?? 0n, 6)}</span>
                </div>
              </div>
              <div className="mt-2 border-gray4 border-t pt-2 text-[12px] text-gray9">
                The testnet fee payer at https://sponsor.moderato.tempo.xyz will pay the transaction
                fees.
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2 pe-8 md:flex-row md:items-end">
              <div className="flex flex-2 flex-col">
                <label className="text-[11px] text-gray9 -tracking-[1%]" htmlFor="recipient">
                  Recipient address
                </label>
                <input
                  className="h-[34px] rounded-[50px] border border-gray4 px-3.25 font-normal text-[14px] text-black -tracking-[2%] placeholder-gray9 dark:text-white"
                  data-1p-ignore
                  type="text"
                  id="recipient"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label className="text-[11px] text-gray9 -tracking-[1%]" htmlFor="memo">
                  Memo (optional)
                </label>
                <input
                  className="h-[34px] rounded-[50px] border border-gray4 px-3.25 font-normal text-[14px] text-black -tracking-[2%] placeholder-gray9 dark:text-white"
                  data-1p-ignore
                  type="text"
                  id="memo"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="INV-12345"
                />
              </div>
              <Button
                variant={active && isValidRecipient ? 'accent' : 'default'}
                disabled={!(active && isValidRecipient)}
                onClick={handleTransfer}
                type="button"
                className="font-normal text-[14px] -tracking-[2%]"
              >
                {sendPayment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {sendPayment.isSuccess && sendPayment.data && (
              <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
