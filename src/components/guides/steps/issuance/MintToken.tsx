'use client'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { type Address, parseUnits, toHex } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './MintToken.recipes'

export function MintToken(props: DemoStepProps & { recipient?: Address }) {
  const { stepNumber, recipient, last = false } = props
  const { address } = useConnection()
  const { getData, setData } = useDemoContext()
  const queryClient = useQueryClient()

  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: hasRole } = Hooks.token.useHasRole({
    account: address,
    token: tokenAddress,
    role: 'issuer',
  })
  const { data: balance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })

  const mint = Hooks.token.useMintSync({
    mutation: {
      onSettled(data) {
        queryClient.refetchQueries({ queryKey: ['getBalance'] })
        setData('transferId', data?.receipt.transactionHash || 'mint')
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      mint.reset()
    },
  })

  const handleMint = async () => {
    if (!tokenAddress || !address || !metadata) return

    await mint.mutate({
      amount: parseUnits('100', metadata.decimals),
      to: recipient || address,
      token: tokenAddress,
      memo: memo ? toHex(memo, { size: 32 }) : undefined,
      feeToken: alphaUsd,
    })
  }

  const hasSufficientBalance =
    balance && metadata && balance.amount >= parseUnits('90', metadata.decimals)

  return (
    <Step
      active={Boolean(
        !!tokenAddress && !!hasRole && !hasSufficientBalance && (last ? true : !mint.isSuccess),
      )}
      completed={mint.isSuccess || Boolean(hasSufficientBalance)}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className={ui.mintTokenButton().className}
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={
              tokenAddress && hasRole && !hasSufficientBalance
                ? mint.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={Boolean(!tokenAddress || !hasRole || hasSufficientBalance)}
            onClick={() => setExpanded(true)}
            type="button"
            className={ui.mintTokenButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Mint 100 ${metadata ? metadata.name : 'tokens'} to ${recipient ? 'recipient' : 'yourself'}.`}
    >
      {expanded && (
        <div {...ui.mintTokenLayout()}>
          <div {...ui.mintTokenLayout2()}>
            <div {...ui.mintTokenLayout3()}>
              <div {...ui.mintTokenLayout4()}>
                <label {...ui.label()} htmlFor="recipient">
                  Recipient address
                </label>
                <input
                  {...ui.mintTokenInput()}
                  data-1p-ignore
                  type="text"
                  id="recipient"
                  name="recipient"
                  value={recipient || address}
                  disabled={true}
                  onChange={(_e) => {}}
                  placeholder="0x..."
                />
              </div>
              <div {...ui.mintTokenLayout5()}>
                <label {...ui.label()} htmlFor="memo">
                  Memo (optional)
                </label>
                <input
                  {...ui.mintTokenInput()}
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
                variant={address ? 'accent' : 'default'}
                disabled={!address}
                onClick={handleMint}
                type="button"
                className={ui.mintTokenButton().className}
              >
                {mint.isPending ? 'Minting...' : 'Mint'}
              </Button>
            </div>
            {mint.isSuccess && mint.data && (
              <ExplorerLink hash={mint.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
