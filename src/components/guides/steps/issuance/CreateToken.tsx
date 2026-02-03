'use client'
import * as React from 'react'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { cx } from '../../../../../cva.config'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Login, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'

export function CreateToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { setData } = useDemoContext()
  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const create = Hooks.token.useCreateSync({
    mutation: {
      onSettled(data) {
        balanceRefetch()
        if (data) {
          setData('tokenAddress', data.token)
          setData('tokenReceipt', data.receipt)
        }
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      create.reset()
    },
  })

  const showLogin = stepNumber === 1 && !address

  const active = React.useMemo(() => {
    // If we need to show the login button, we are active.
    if (showLogin) return true

    // If this is the last step has to be logged in and funded.
    const activeWithBalance = Boolean(address && balance && balance > 0n)
    if (last) return activeWithBalance

    // If this is an intermediate step, also needs to not have succeeded
    return activeWithBalance && !create.isSuccess
  }, [address, balance, create.isSuccess, last, showLogin])

  return (
    <Step
      active={active}
      completed={create.isSuccess}
      number={stepNumber}
      actions={showLogin && <Login />}
      title="Create & deploy a token to testnet."
    >
      {(active || create.isSuccess) && (
        <div className="ml-6 flex flex-col gap-3 py-4">
          <div className="border-gray4 border-s-2 ps-5">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.target as HTMLFormElement)
                const name = formData.get('name') as string
                const symbol = formData.get('symbol') as string
                create.mutate({
                  name,
                  symbol,
                  currency: 'USD',
                  feeToken: alphaUsd,
                })
              }}
              className="-mt-2.5 flex flex-col gap-2 md:flex-row md:items-end"
            >
              <div className="flex flex-1 flex-col">
                <label className="-tracking-[1%] text-[11px] text-gray9" htmlFor="name">
                  Token name
                </label>
                <input
                  className="-tracking-[2%] h-[34px] rounded-lg border border-gray4 px-3.25 font-normal text-[14px] text-black placeholder-gray9 dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="name"
                  required
                  spellCheck={false}
                  placeholder="demoUSD"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label className="-tracking-[1%] text-[11px] text-gray9" htmlFor="symbol">
                  Token symbol
                </label>
                <input
                  className="-tracking-[2%] h-[34px] rounded-lg border border-gray4 px-3.25 font-normal text-[14px] text-black placeholder-gray9 dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="symbol"
                  required
                  spellCheck={false}
                  placeholder="DEMO"
                />
              </div>
              <Button variant="accent" type="submit" disabled={create.isPending}>
                {create.isPending ? 'Deploying...' : 'Deploy'}
              </Button>
            </form>
          </div>

          {create.data && (
            <div className="relative">
              <div
                className={cx(
                  '-tracking-[2%] flex flex-col items-center rounded-[10px] bg-gray2 p-4 text-center font-normal text-[13px] text-gray9 leading-snug',
                )}
              >
                <div>
                  Token{' '}
                  <span className="font-medium text-primary">
                    {' '}
                    {create.data.name} ({create.data.symbol}){' '}
                  </span>{' '}
                  successfully created and deployed to Tempo!
                </div>
                <ExplorerLink hash={create.data?.receipt.transactionHash ?? ''} />
              </div>
            </div>
          )}
        </div>
      )}
    </Step>
  )
}
