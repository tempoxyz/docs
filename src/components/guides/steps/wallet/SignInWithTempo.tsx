'use client'
import { useConnect, useConnection, useConnections, useSwitchConnection } from 'wagmi'
import LucidePictureInPicture2 from '~icons/lucide/picture-in-picture-2'
import { useTempoWalletConnector } from '../../../../wagmi.config'
import { Button, Logout, Step, TempoMarkBoxed, useHydrated } from '../../Demo'
import type { DemoStepProps } from '../types'

export function SignInWithTempo(props: DemoStepProps) {
  const { stepNumber = 1 } = props
  const { address, connector: activeConnector } = useConnection()
  const connections = useConnections()
  const connect = useConnect()
  const switchConnection = useSwitchConnection()
  const hydrated = useHydrated()
  const connector = useTempoWalletConnector()
  const connected = Boolean(address && activeConnector?.id === 'xyz.tempo')

  return (
    <Step
      active={!connected}
      completed={connected}
      actions={
        connected ? (
          <Logout label="Disconnect" />
        ) : !hydrated || !connector ? (
          <Button disabled variant="default">
            Loading account
          </Button>
        ) : connect.isPending || switchConnection.isPending ? (
          <Button disabled variant="default">
            <LucidePictureInPicture2 className="mt-px" />
            Check prompt
          </Button>
        ) : (
          <Button
            variant="accent"
            className="font-normal text-[14px] -tracking-[2%]"
            onClick={() => {
              connect.reset()
              switchConnection.reset()
              const existing = connections.find((item) => item.connector.id === 'xyz.tempo')
              if (existing) switchConnection.mutate({ connector: existing.connector })
              else connect.connect({ connector })
            }}
            type="button"
          >
            <TempoMarkBoxed className="size-[14px]" />
            Connect Tempo Wallet
          </Button>
        )
      }
      error={connect.error || switchConnection.error}
      number={stepNumber}
      title="Connect Tempo Wallet."
    />
  )
}
