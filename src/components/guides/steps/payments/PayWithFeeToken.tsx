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
  // Resolve the current validator's fee token rather than assuming a test token.
  const feeLiquidity = useQuery({
    queryKey: ['fee-demo-liquidity', client?.chain.id, feeToken],
    enabled: Boolean(client),
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
        feeLiquidity.data === true,
    )
  }, [address, alphaBalance, feeTokenBalance, feeLiquidity.data])

  return (
    <Step
      active={active && (last ? true : !sendPayment.isSuccess)}
      completed={sendPayment.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className={ui.payWithFeeTokenButton().className}
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
            className={ui.payWithFeeTokenButton().className}
          >
            Enter details
          </Button>
        )
      }
      error={sendPayment.error ?? feeLiquidity.error}
      number={stepNumber}
      title={`Send 100 AlphaUSD and pay fees in ${feeTokenMetadata ? feeTokenMetadata.name : 'another token'}.`}
    >
      {expanded && (
        <div {...ui.payWithFeeTokenLayout()}>
          <div {...ui.payWithFeeTokenLayout2()}>
            {/* Token info display */}
            <div {...ui.payWithFeeTokenLayout3()}>
              <div {...ui.payWithFeeTokenLayout4()}>
                <div {...ui.payWithFeeTokenLayout5()}>
                  <span {...ui.payWithFeeTokenText()}>Payment Token: AlphaUSD</span>
                  <span {...ui.payWithFeeTokenText2()}>
                    balance: {alphaBalance?.formatted ?? '0'}
                  </span>
                </div>
                <div {...ui.payWithFeeTokenLayout5()}>
                  <span {...ui.payWithFeeTokenText()}>Fee Token</span>
                  <TokenSelector
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
                    balance: {feeTokenBalance?.formatted ?? '0'}
                  </span>
                </div>
              </div>
            </div>

            <div {...ui.payWithFeeTokenLayout6()}>
              <div {...ui.payWithFeeTokenLayout7()}>
                <label {...ui.label()} htmlFor="recipient">
                  Recipient address
                </label>
                <input
                  {...ui.payWithFeeTokenInput()}
                  data-1p-ignore
                  type="text"
                  id="recipient"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div {...ui.payWithFeeTokenLayout8()}>
                <label {...ui.label()} htmlFor="memo">
                  Memo (optional)
                </label>
                <input
                  {...ui.payWithFeeTokenInput()}
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
                className={ui.payWithFeeTokenButton().className}
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
