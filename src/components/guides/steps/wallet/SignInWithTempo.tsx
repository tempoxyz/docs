'use client'
import { useConnect, useConnection, useDisconnect } from 'wagmi'
import LucidePictureInPicture2 from '~icons/lucide/picture-in-picture-2'
import { useTempoWalletConnector } from '../../../../wagmi.config'
import { Button, Logout, Step, TempoMarkBoxed, useHydrated } from '../../Demo'
import type { DemoStepProps } from '../types'

export function SignInWithTempo(props: DemoStepProps) {
  const { stepNumber = 1 } = props
  const { address } = useConnection()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const hydrated = useHydrated()
  const connector = useTempoWalletConnector()

  return (
    <Step
      active={!address}
      completed={Boolean(address)}
      actions={
        address ? (
          <Logout />
        ) : !hydrated || !connector ? (
          <Button disabled variant="default">
            Loading account
          </Button>
        ) : connect.isPending ? (
          <Button disabled variant="default">
            <LucidePictureInPicture2 className="mt-px" />
            Check prompt
          </Button>
        ) : (
          <Button
            variant="accent"
            className="font-normal text-[14px] -tracking-[2%]"
            onClick={async () => {
              await disconnect.disconnectAsync().catch(() => {})
              connect.connect({ connector })
            }}
            type="button"
          >
            <TempoMarkBoxed className="size-[14px]" />
            Sign in with Tempo
          </Button>
        )
      }
      error={connect.error}
      number={stepNumber}
      title="Sign in with Tempo Wallet."
    />
  )
}
