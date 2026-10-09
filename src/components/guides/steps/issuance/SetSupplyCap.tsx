'use client'
import * as React from 'react'
import { parseUnits } from 'viem'
import { useConnection, useConnectionEffect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import { alphaUsd } from '../../tokens'
import type { DemoStepProps } from '../types'
import * as ui from './SetSupplyCap.recipes'

export function SetSupplyCap(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useConnection()
  const { getData } = useDemoContext()
  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata, refetch: refetchMetadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  const setSupplyCap = Hooks.token.useSetSupplyCapSync({
    mutation: {
      onSettled() {
        refetchMetadata()
      },
    },
  })

  useConnectionEffect({
    onDisconnect() {
      setExpanded(false)
      setSupplyCap.reset()
    },
  })

  const handleSetSupplyCap = () => {
    if (!tokenAddress) return

    setSupplyCap.mutate({
      token: tokenAddress,
      supplyCap: parseUnits('1000', metadata?.decimals || 6),
      feeToken: alphaUsd,
    })
  }

  const active = Boolean(tokenAddress && address)
  const hasSupplyCap = Boolean(
    metadata?.supplyCap && metadata.supplyCap <= parseUnits('1000', metadata.decimals || 6),
  )

  return (
    <Step
      active={active && (last ? true : !setSupplyCap.isSuccess)}
      completed={setSupplyCap.isSuccess || hasSupplyCap}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className={ui.setSupplyCapButton().className}
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={active ? (setSupplyCap.isSuccess ? 'default' : 'accent') : 'default'}
            disabled={!active}
            onClick={() => setExpanded(true)}
            type="button"
            className={ui.setSupplyCapButton().className}
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Set supply cap to 1,000 ${metadata ? metadata.name : 'tokens'}.`}
    >
      {expanded && (
        <div {...ui.setSupplyCapLayout()}>
          <div {...ui.setSupplyCapLayout2()}>
            <div {...ui.setSupplyCapLayout3()}>
              <div {...ui.setSupplyCapLayout4()}>
                <label {...ui.label()} htmlFor="supplyCap">
                  Supply cap amount
                </label>
                <input
                  {...ui.setSupplyCapInput()}
                  data-1p-ignore
                  type="text"
                  id="supplyCap"
                  name="supplyCap"
                  value="1,000"
                  disabled={true}
                  onChange={() => {}}
                />
              </div>
              <Button
                variant={active ? 'accent' : 'default'}
                disabled={!active}
                onClick={handleSetSupplyCap}
                type="button"
                className={ui.setSupplyCapButton().className}
              >
                {setSupplyCap.isPending ? 'Setting...' : 'Set Cap'}
              </Button>
            </div>
            {setSupplyCap.isSuccess && setSupplyCap.data && (
              <ExplorerLink hash={setSupplyCap.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}
