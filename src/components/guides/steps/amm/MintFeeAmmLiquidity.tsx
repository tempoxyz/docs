'use client'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import type { Address } from 'viem'
import { parseUnits } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd, pathUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function MintFeeAmmLiquidity(props: DemoStepProps & { waitForBalance?: boolean }) {
  const { stepNumber, last = false, waitForBalance = true } = props
  const { address } = useConnection()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: tokenBalance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })

  const [pathUsdMinted, setPathUsdMinted] = React.useState(false)
  const [alphaUsdMinted, setAlphaUsdMinted] = React.useState(false)
  const [pathUsdTxHash, setPathUsdTxHash] = React.useState<string>()
  const [alphaUsdTxHash, setAlphaUsdTxHash] = React.useState<string>()

  const mintFeeLiquidity = Hooks.amm.useMintSync({
    mutation: {
      onSettled() {
        queryClient.refetchQueries({ queryKey: ['getPool'] })
        queryClient.refetchQueries({ queryKey: ['getLiquidityBalance'] })
      },
    },
  })

  useConnectionEffect({
    onDisconnect() {
      mintFeeLiquidity.reset()
      setPathUsdMinted(false)
      setAlphaUsdMinted(false)
      setPathUsdTxHash(undefined)
      setAlphaUsdTxHash(undefined)
    },
  })

  const handleMintAll = React.useCallback(async () => {
    if (!address || !tokenAddress) return

    if (!pathUsdMinted) {
      await new Promise<void>((resolve) => {
        mintFeeLiquidity.mutate(
          {
            userTokenAddress: tokenAddress,
            validatorTokenAddress: pathUsd,
            validatorTokenAmount: parseUnits('100', 6),
            to: address,
            feeToken: alphaUsd,
          },
          {
            onSuccess(data) {
              setPathUsdMinted(true)
              setPathUsdTxHash(data.receipt.transactionHash)
              resolve()
            },
            onError() {
              resolve()
            },
          },
        )
      })
    }

    if (!alphaUsdMinted) {
      mintFeeLiquidity.mutate(
        {
          userTokenAddress: tokenAddress,
          validatorTokenAddress: alphaUsd,
          validatorTokenAmount: parseUnits('100', 6),
          to: address,
          feeToken: alphaUsd,
        },
        {
          onSuccess(data) {
            setAlphaUsdMinted(true)
            setAlphaUsdTxHash(data.receipt.transactionHash)
          },
        },
      )
    }
  }, [address, tokenAddress, pathUsdMinted, alphaUsdMinted, mintFeeLiquidity])

  const active = React.useMemo(() => {
    const balanceCheck = waitForBalance ? Boolean(tokenBalance && tokenBalance > 0n) : true
    return Boolean(address && tokenAddress && balanceCheck)
  }, [address, tokenAddress, tokenBalance, waitForBalance])

  const allMinted = pathUsdMinted && alphaUsdMinted
  const someMinted = pathUsdMinted || alphaUsdMinted

  return (
    <Step
      active={active && (last ? true : !allMinted)}
      completed={allMinted}
      actions={
        <Button
          variant={active ? (allMinted ? 'default' : 'accent') : 'default'}
          disabled={!active || mintFeeLiquidity.isPending}
          onClick={handleMintAll}
          type="button"
          className="font-normal text-[14px] -tracking-[2%]"
        >
          {mintFeeLiquidity.isPending
            ? 'Adding...'
            : allMinted
              ? 'Done'
              : someMinted
                ? 'Continue Adding'
                : 'Add Liquidity'}
        </Button>
      }
      error={mintFeeLiquidity.error}
      number={stepNumber}
      title={`Add fee liquidity (pathUSD + AlphaUSD) for ${metadata ? metadata.name : 'your token'}.`}
    >
      {someMinted && (
        <div className="mx-6 flex flex-col gap-2 pb-4">
          <div className="border-gray4 border-s-2 ps-5">
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-[13px]">
                <span className={`w-4 ${pathUsdMinted ? 'text-green9' : 'text-gray9'}`}>
                  {pathUsdMinted ? '✓' : '○'}
                </span>
                <span className="w-20 font-mono">pathUSD</span>
                {pathUsdTxHash && (
                  <span className="-mt-1">
                    <ExplorerLink hash={pathUsdTxHash} />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <span className={`w-4 ${alphaUsdMinted ? 'text-green9' : 'text-gray9'}`}>
                  {alphaUsdMinted ? '✓' : '○'}
                </span>
                <span className="w-20 font-mono">AlphaUSD</span>
                {alphaUsdTxHash && (
                  <span className="-mt-1">
                    <ExplorerLink hash={alphaUsdTxHash} />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}
