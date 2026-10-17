'use client'

import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { parseUnits } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import LucideCheck from '~icons/lucide/check'
import LucideCircle from '~icons/lucide/circle'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd, pathUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './MintFeeAmmLiquidity.recipes'

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
    const balanceCheck = waitForBalance ? Boolean(tokenBalance && tokenBalance.amount > 0n) : true
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
          className={form.actionButton().className}
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
      title={`Add fee liquidity for ${metadata ? metadata.name : 'your token'}.`}
    >
      {someMinted && (
        <div {...ui.mintFeeAmmLiquidityLayout()}>
          <div {...form.stepRail()}>
            <div {...ui.mintFeeAmmLiquidityLayout3()}>
              <div {...ui.mintFeeAmmLiquidityLayout4()}>
                {pathUsdMinted ? (
                  <LucideCheck className={ui.lucideCheck().className} />
                ) : (
                  <LucideCircle className={ui.lucideCircle().className} />
                )}
                <span {...ui.mintFeeAmmLiquidityText()}>pathUSD</span>
                {pathUsdTxHash && (
                  <span {...ui.mintFeeAmmLiquidityText2()}>
                    <ExplorerLink hash={pathUsdTxHash} />
                  </span>
                )}
              </div>
              <div {...ui.mintFeeAmmLiquidityLayout4()}>
                {alphaUsdMinted ? (
                  <LucideCheck className={ui.lucideCheck().className} />
                ) : (
                  <LucideCircle className={ui.lucideCircle().className} />
                )}
                <span {...ui.mintFeeAmmLiquidityText()}>AlphaUSD</span>
                {alphaUsdTxHash && (
                  <span {...ui.mintFeeAmmLiquidityText2()}>
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
