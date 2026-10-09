'use client'
import * as React from 'react'
import { isAddress, parseUnits, toHex } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './PayWithIssuedToken.recipes'

// Current validator token on testnet
const validatorToken = alphaUsd

export function PayWithIssuedToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const [recipient, setRecipient] = React.useState<string>(FAKE_RECIPIENT)
  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)
  const { getData } = useDemoContext()
  const feeToken = getData('tokenAddress')

  // Balance for the payment token (AlphaUSD)
  const { data: alphaBalance, refetch: alphaBalanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })

  // Balance for the fee token (dynamic based on selection)
  const { data: feeTokenBalance, refetch: feeTokenBalanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: feeToken,
  })

  // Metadata for fee token
  const { data: feeTokenMetadata } = Hooks.token.useGetMetadata({
    token: feeToken,
  })
  // Pool details. Fees are paid in feeToken, so it's the userToken
  // validator token is a testnet property set at top of file
  const { data: pool } = Hooks.amm.usePool({
    userToken: feeToken,
    validatorToken,
  })

  const sendPayment = Hooks.token.useTransferSync({
    mutation: {
      onSettled() {
        alphaBalanceRefetch()
        feeTokenBalanceRefetch()
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
      feeToken,
    })
  }

  const active = React.useMemo(() => {
    return Boolean(
      address &&
        alphaBalance &&
        alphaBalance.amount > 0n &&
        feeTokenBalance &&
        feeTokenBalance.amount > 0n &&
        pool &&
        pool.reserveValidatorToken > 0n,
    )
  }, [address, alphaBalance, feeTokenBalance, pool])

  return (
    <Step
      active={active && (last ? true : !sendPayment.isSuccess)}
      completed={sendPayment.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className={ui.payWithIssuedTokenButton().className}
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
            className={ui.payWithIssuedTokenButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Send 100 AlphaUSD and pay fees in ${feeTokenMetadata ? feeTokenMetadata.name : 'your token'}.`}
    >
      {expanded && (
        <div {...ui.payWithIssuedTokenLayout()}>
          <div {...ui.payWithIssuedTokenLayout2()}>
            {/* Token info display */}
            <div {...ui.payWithIssuedTokenLayout3()}>
              <div {...ui.payWithIssuedTokenLayout4()}>
                <div {...ui.payWithIssuedTokenLayout5()}>
                  <span {...ui.payWithIssuedTokenText()}>Payment Token: AlphaUSD</span>
                  <span {...ui.payWithIssuedTokenText2()}>
                    balance: {alphaBalance?.formatted ?? '0'}
                  </span>
                </div>
                <div {...ui.payWithIssuedTokenLayout5()}>
                  <span {...ui.payWithIssuedTokenText()}>
                    {`Fee Token: ${feeTokenMetadata ? feeTokenMetadata.name : ''}`}
                  </span>
                  <span {...ui.payWithIssuedTokenText2()}>
                    balance: {feeTokenBalance?.formatted ?? '0'}
                  </span>
                </div>
              </div>
            </div>

            <div {...ui.payWithIssuedTokenLayout6()}>
              <div {...ui.payWithIssuedTokenLayout7()}>
                <label {...ui.label()} htmlFor="recipient">
                  Recipient address
                </label>
                <input
                  {...ui.payWithIssuedTokenInput()}
                  data-1p-ignore
                  type="text"
                  id="recipient"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div {...ui.payWithIssuedTokenLayout8()}>
                <label {...ui.label()} htmlFor="memo">
                  Memo (optional)
                </label>
                <input
                  {...ui.payWithIssuedTokenInput()}
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
                variant={active ? 'accent' : 'default'}
                disabled={!active}
                onClick={handleTransfer}
                type="button"
                className={ui.payWithIssuedTokenButton().className}
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
