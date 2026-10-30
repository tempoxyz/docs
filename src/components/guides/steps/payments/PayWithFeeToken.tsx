'use client'

import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import type { Address } from 'viem'
import { isAddress, parseUnits, toHex } from 'viem'
import { createClient, custom } from 'viem/tempo'
import { useConnection, useConnectionEffect, usePublicClient } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { TokenSelector } from '../../../TokenSelector'
import { Button, ExplorerLink, FAKE_RECIPIENT, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd, betaUsd, ousd, thetaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './PayWithFeeToken.recipes'

export function PayWithFeeToken(props: DemoStepProps & { feeToken?: Address }) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const publicClient = usePublicClient()
  const client = React.useMemo(
    () =>
      publicClient && createClient({ chain: publicClient.chain, transport: custom(publicClient) }),
    [publicClient],
  )
  const [recipient, setRecipient] = React.useState<string>(FAKE_RECIPIENT)
  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)
  const [feeToken, setFeeToken] = React.useState<Address>(props.feeToken || ousd)

  // Balance for the payment token (AlphaUSD)
  const {
    data: alphaBalance,
    error: alphaBalanceError,
    refetch: alphaBalanceRefetch,
  } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })

  // Balance for the fee token (dynamic based on selection)
  const {
    data: feeTokenBalance,
    error: feeTokenBalanceError,
    refetch: feeTokenBalanceRefetch,
  } = Hooks.token.useGetBalance({
    account: address,
    token: feeToken,
  })

  // Metadata for fee token
  const { data: feeTokenMetadata } = Hooks.token.useGetMetadata({
    token: feeToken,
  })
  // Resolve the current validator's fee token rather than assuming a test token.
  const feeLiquidity = useQuery({
    queryKey: ['fee-demo-liquidity', client?.chain.id, feeToken],
    enabled: Boolean(client && address),
    queryFn: async () => {
      if (!client) throw new Error('public client not ready')
      const block = await client.getBlock()
      const validatorToken = await client.fee.getValidatorToken({
        validator: block.miner,
      })
      if (!validatorToken) return false
      if (feeToken.toLowerCase() === validatorToken.address.toLowerCase()) return true
      const pool = await client.amm.getPool({
        userToken: feeToken,
        validatorToken: validatorToken.address,
      })
      return pool.reserveValidatorToken > 0n
    },
    staleTime: 10_000,
    refetchInterval: 10_000,
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

  const isValidRecipient = isAddress(recipient)
  const paymentAmount = parseUnits('100', 6)
  const feeTokenName = feeTokenMetadata?.name ?? 'the selected fee token'
  const balanceError = alphaBalanceError ?? feeTokenBalanceError
  const requirement = (() => {
    if (!address) return 'Sign in to send a payment.'
    if (balanceError) return 'Could not check your balances. Retry the checks to continue.'
    if (!alphaBalance || !feeTokenBalance) return 'Checking your token balances…'
    if (alphaBalance.amount < paymentAmount)
      return 'You need at least 100 AlphaUSD to send this payment. Add testnet funds above.'
    if (feeTokenBalance.amount === 0n)
      return `You need ${feeTokenName} to pay fees. Choose a token you already have, or add testnet funds above.`
    if (feeToken.toLowerCase() === alphaUsd.toLowerCase() && alphaBalance.amount === paymentAmount)
      return 'You need more than 100 AlphaUSD to cover both the payment and its fee, or choose another fee token.'
    if (feeLiquidity.isError)
      return 'Could not check whether this token can pay fees. Retry the checks or choose another fee token.'
    if (feeLiquidity.data === undefined) return 'Checking whether this token can pay fees…'
    if (!feeLiquidity.data)
      return `${feeTokenName} currently has no available fee-conversion liquidity. Choose another fee token.`
    if (!isValidRecipient) return 'Enter a valid recipient address.'
    return undefined
  })()
  const canSend = !requirement && !sendPayment.isPending

  const handleTransfer = () => {
    if (!canSend) return
    sendPayment.mutate({
      amount: paymentAmount,
      to: recipient as `0x${string}`,
      token: alphaUsd,
      memo: memo ? toHex(memo, { size: 32 }) : undefined,
      feeToken,
    })
  }

  // Opening the form must not depend on the fee token selected inside it.
  const active = Boolean(address)

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
      error={sendPayment.error}
      number={stepNumber}
      title={`Send 100 AlphaUSD and pay fees in ${feeTokenMetadata ? feeTokenMetadata.name : 'another token'}.`}
    >
      {expanded && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            {/* Token info display */}
            <div {...ui.payWithFeeTokenLayout3()}>
              <div {...ui.payWithFeeTokenLayout4()}>
                <div {...ui.payWithFeeTokenLayout5()}>
                  <span {...ui.payWithFeeTokenText()}>Payment Token: AlphaUSD</span>
                  <span {...ui.payWithFeeTokenText2()}>
                    balance:{' '}
                    {alphaBalance?.formatted ?? (alphaBalanceError ? 'Unavailable' : 'Loading…')}
                  </span>
                </div>
                <div {...ui.payWithFeeTokenLayout5()}>
                  <span {...ui.payWithFeeTokenText()}>Fee Token</span>
                  <TokenSelector
                    aria-label="Fee token"
                    tokens={[alphaUsd, betaUsd, thetaUsd, ousd]}
                    value={feeToken}
                    onChange={setFeeToken}
                    name="feeToken"
                  />
                </div>
                <div {...ui.payWithFeeTokenLayout5()}>
                  <span {...ui.payWithFeeTokenText()}>
                    {`Fee Token: ${feeTokenMetadata ? feeTokenMetadata.name : ''}`}
                  </span>
                  <span {...ui.payWithFeeTokenText2()}>
                    balance:{' '}
                    {feeTokenBalance?.formatted ??
                      (feeTokenBalanceError ? 'Unavailable' : 'Loading…')}
                  </span>
                </div>
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
                variant={canSend ? 'accent' : 'default'}
                disabled={!canSend}
                onClick={handleTransfer}
                type="button"
                className={form.actionButton().className}
              >
                {sendPayment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {requirement && <p role="status">{requirement}</p>}
            {(balanceError || feeLiquidity.isError) && (
              <Button
                variant="default"
                type="button"
                disabled={feeLiquidity.isFetching}
                onClick={() => {
                  alphaBalanceRefetch()
                  feeTokenBalanceRefetch()
                  feeLiquidity.refetch()
                }}
              >
                Retry checks
              </Button>
            )}
            {sendPayment.isSuccess && sendPayment.data && (
              <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
