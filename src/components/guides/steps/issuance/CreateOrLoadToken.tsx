'use client'
import { Hooks } from 'wagmi/tempo'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import type { DemoStepProps } from '../types'
import * as ui from './CreateOrLoadToken.recipes'
import { CreateToken } from './CreateToken'

export function CreateOrLoadToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { data: contextData, clearData } = useDemoContext()

  const { tokenAddress, tokenReceipt } = contextData

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  const handleClear = () => {
    clearData('tokenReceipt')
    clearData('tokenAddress')
  }

  if (last || !metadata || !tokenAddress) {
    return <CreateToken {...props} />
  }

  return (
    <Step
      active={false}
      completed={true}
      number={stepNumber}
      actions={
        <Button type="button" variant="default" onClick={handleClear}>
          Reset
        </Button>
      }
      title={`Using token ${metadata.name}`}
    >
      {tokenReceipt && (
        <div {...ui.createOrLoadTokenLayout()}>
          <div {...ui.createOrLoadTokenLayout2()}>
            <div>
              Token{' '}
              <span {...ui.createOrLoadTokenText()}>
                {' '}
                {metadata.name} ({metadata.symbol}){' '}
              </span>{' '}
              successfully created and deployed to Tempo!
            </div>
            <ExplorerLink hash={tokenReceipt.transactionHash ?? ''} />
          </div>
        </div>
      )}
    </Step>
  )
}
