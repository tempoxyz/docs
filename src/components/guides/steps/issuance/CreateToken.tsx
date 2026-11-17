'use client'

import * as React from 'react'
import type { Address } from 'viem'
import type { Transaction } from 'viem/tempo'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { demoWalletAuthorization } from '../../../../lib/demo-wallet-authorization'
import { tempoIdConnectorId } from '../../../../wagmi.config'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Login, Step } from '../../Demo'
import * as form from '../../form.recipes'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './CreateToken.recipes'

type Created = { token: Address; receipt: Transaction.TransactionReceipt }

export function CreateToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address, connector } = useConnection()
  const { setData } = useDemoContext()
  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const save = React.useCallback(
    (created: Created) => {
      setData('tokenAddress', created.token)
      setData('tokenReceipt', created.receipt)
    },
    [setData],
  )
  // Tempo ID's access key can call only the contracts it names. A new token has no address until
  // it exists, so the user approves an access key that adds it before the next steps use it.
  const [unapproved, setUnapproved] = React.useState<Created>()
  const [approving, setApproving] = React.useState(false)
  const [approveError, setApproveError] = React.useState<Error>()
  const approve = async () => {
    if (!unapproved || !connector) return
    setApproving(true)
    setApproveError(undefined)
    try {
      const instance = await (
        connector as unknown as {
          getInstance(): Promise<{
            dialog: { signIn(p: { accessKey: unknown }): Promise<unknown> }
          }>
        }
      ).getInstance()
      await instance.dialog.signIn({ accessKey: demoWalletAuthorization([unapproved.token]) })
      save(unapproved)
      setUnapproved(undefined)
    } catch (error) {
      setApproveError(error as Error)
    } finally {
      setApproving(false)
    }
  }
  const create = Hooks.token.useCreateSync({
    mutation: {
      onSettled(data) {
        balanceRefetch()
        if (!data) return
        if (connector?.id === tempoIdConnectorId) setUnapproved(data)
        else save(data)
      },
    },
  })
  useConnectionEffect({
    onDisconnect() {
      create.reset()
      setUnapproved(undefined)
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
    return activeWithBalance && (!create.isSuccess || Boolean(unapproved))
  }, [address, balance, create.isSuccess, last, showLogin, unapproved])

  return (
    <Step
      active={active}
      completed={create.isSuccess && !unapproved}
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
              {unapproved && (
                <div {...ui.createTokenLayout5()}>
                  <div>Approve an access key that can use the new token in the next steps.</div>
                  <Button variant="accent" type="button" disabled={approving} onClick={approve}>
                    {approving ? 'Check Tempo ID…' : 'Approve token'}
                  </Button>
                  {approveError && (
                    <div>
                      {'shortMessage' in approveError
                        ? String(approveError.shortMessage)
                        : approveError.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Step>
  )
}
