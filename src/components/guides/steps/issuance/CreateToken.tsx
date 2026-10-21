'use client'

import * as React from 'react'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Login, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './CreateToken.recipes'

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
    const activeWithBalance = Boolean(address && balance && balance.amount > 0n)
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
        <div {...ui.createTokenLayout()}>
          <div {...form.stepRail()}>
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
              {...ui.form()}
            >
              <div {...form.secondaryField()}>
                <label {...form.label()} htmlFor="name">
                  Token name
                </label>
                <input
                  {...ui.createTokenInput()}
                  data-1p-ignore
                  type="text"
                  id="name"
                  name="name"
                  required
                  spellCheck={false}
                  placeholder="demoUSD"
                />
              </div>
              <div {...form.secondaryField()}>
                <label {...form.label()} htmlFor="symbol">
                  Token symbol
                </label>
                <input
                  {...ui.createTokenInput()}
                  data-1p-ignore
                  type="text"
                  id="symbol"
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
            <div {...ui.createTokenLayout4()}>
              <div {...ui.createTokenLayout5()}>
                <div>
                  Token{' '}
                  <span {...ui.createTokenText()}>
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
