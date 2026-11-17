'use client'

import { useConnect, useConnection, useConnections, useSwitchConnection } from 'wagmi'
import LucidePictureInPicture2 from '~icons/lucide/picture-in-picture-2'
import { useTempoIdConnector } from '../../../../wagmi.config'
import { Button, Logout, Step, TempoMarkBoxed, useHydrated } from '../../Demo'
import * as form from '../../form.recipes'
import type { DemoStepProps } from '../types'
import * as ui from './SignInWithTempo.recipes'

export function SignInWithTempo(props: DemoStepProps) {
  const { stepNumber = 1 } = props
  const { address, connector: activeConnector } = useConnection()
  const connections = useConnections()
  const connect = useConnect()
  const switchConnection = useSwitchConnection()
  const hydrated = useHydrated()
  const connector = useTempoIdConnector()
  const connected = Boolean(address && activeConnector?.id === 'tempoId')

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
            <LucidePictureInPicture2 className={ui.lucidePictureInPicture2().className} />
            Check prompt
          </Button>
        ) : (
          <Button
            variant="accent"
            className={form.actionButton().className}
            onClick={() => {
              connect.reset()
              switchConnection.reset()
              const existing = connections.find((item) => item.connector.id === 'tempoId')
              if (existing) switchConnection.mutate({ connector: existing.connector })
              else connect.connect({ connector })
            }}
            type="button"
          >
            <TempoMarkBoxed className={ui.tempoMarkBoxed().className} />
            Sign in with Tempo
          </Button>
        )
      }
      error={connect.error || switchConnection.error}
      number={stepNumber}
      title="Sign in with Tempo."
    />
  )
}
