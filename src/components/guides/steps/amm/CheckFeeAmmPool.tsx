'use client'

import * as React from 'react'
import { formatUnits } from 'viem'
import { useConnection } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './CheckFeeAmmPool.recipes'

const validatorToken = alphaUsd

export function CheckFeeAmmPool(props: DemoStepProps) {
  const { stepNumber } = props
  const { address } = useConnection()
  const { getData } = useDemoContext()

  const tokenAddress = getData('tokenAddress')

  const { data: pool } = Hooks.amm.usePool({
    userToken: tokenAddress,
    validatorToken,
  })

  const { data: lpBalance } = Hooks.amm.useLiquidityBalance({
    address,
    userToken: tokenAddress,
    validatorToken,
  })

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: validatorMetadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  const active = React.useMemo(() => {
    return Boolean(address && tokenAddress && pool && lpBalance && lpBalance > 0n)
  }, [address, tokenAddress, pool, lpBalance])

  return (
    <Step
      active={active}
      completed={active}
      number={stepNumber}
      title={`View Fee AMM pool for ${metadata ? metadata.name : 'your token'}.`}
    >
      {active && pool && lpBalance && (
        <div {...form.stepBody()}>
          <div {...form.stepRail()}>
            <div {...ui.checkFeeAmmPoolLayout3()}>
              <div {...ui.checkFeeAmmPoolLayout4()}>
                <div {...ui.checkFeeAmmPoolLayout5()}>
                  <span {...ui.checkFeeAmmPoolText()}>Your LP Balance</span>
                  <span {...ui.checkFeeAmmPoolText2()}>
                    {formatUnits(lpBalance, validatorMetadata?.decimals || 6)} LP tokens
                  </span>
                </div>
                <div {...ui.checkFeeAmmPoolLayout5()}>
                  <span {...ui.checkFeeAmmPoolText()}>Validator Token Reserves</span>
                  <span {...ui.checkFeeAmmPoolText2()}>
                    {formatUnits(pool.reserveValidatorToken, validatorMetadata?.decimals || 6)}{' '}
                    AlphaUSD
                  </span>
                </div>
                <div {...ui.checkFeeAmmPoolLayout5()}>
                  <span {...ui.checkFeeAmmPoolText()}>User Token Reserves</span>
                  <span {...ui.checkFeeAmmPoolText2()}>
                    {formatUnits(pool.reserveUserToken, metadata?.decimals || 6)}{' '}
                    {metadata?.symbol || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}
