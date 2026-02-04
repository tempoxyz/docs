'use client'
import { Hooks } from 'wagmi/tempo'
import { cx } from '../../../../../cva.config'
import { useDemoContext } from '../../../DemoContext'
import { Button, ExplorerLink, Step } from '../../Demo'
import type { DemoStepProps } from '../types'
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
        <div className="ml-6 flex flex-col gap-3 py-4">
          <div
            className={cx(
              'flex flex-col items-center rounded-[10px] bg-gray2 p-4 text-center font-normal text-[13px] text-gray9 leading-snug -tracking-[2%]',
            )}
          >
            <div>
              Token{' '}
              <span className="font-medium text-primary">
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
