'use client'

import * as React from 'react'
import { isAddress, parseUnits, toHex } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './SponsorUserFees.recipes'

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
      memo: memo ? toHex(memo, { size: 32 }) : undefined,
    })
  }

  const active = React.useMemo(() => {
    return Boolean(address && userBalance && userBalance.amount > 0n)
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
            className={form.actionButton().className}
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
            className={form.actionButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title="Send 100 AlphaUSD with fees sponsored by the testnet fee payer."
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...ui.sendRelayerSponsoredPaymentLayout3()}>
              <div {...ui.sendRelayerSponsoredPaymentLayout4()}>
                <div {...ui.sendRelayerSponsoredPaymentLayout5()}>
                  <span {...ui.sendRelayerSponsoredPaymentText()}>Payment Token: AlphaUSD</span>
                  <span {...ui.sendRelayerSponsoredPaymentText2()}>
                    balance: {userBalance?.formatted ?? '0'}
                  </span>
                </div>
              </div>
              <div {...ui.sendRelayerSponsoredPaymentLayout6()}>
                The testnet fee payer at https://sponsor.moderato.tempo.xyz will pay the transaction
                fees.
              </div>
            </div>

            <div {...form.fieldsRow()}>
              <div {...form.primaryField()}>
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
              <div {...form.secondaryField()}>
                <label {...form.label()} htmlFor="memo">
                  Memo (optional)
                </label>
                <input
                  {...form.input()}
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
                className={form.actionButton().className}
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
