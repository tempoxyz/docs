'use client'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWebAuthnConnector } from '../../wagmi.config'
import { Button, useHydrated } from './Demo'

export function EmbedPasskeys() {
  const account = useAccount()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const hydrated = useHydrated()
  const connector = useWebAuthnConnector()
  const busy = connect.isPending || disconnect.isPending

  if (!hydrated || !connector)
    return (
      <div>
        <Button disabled>Loading account</Button>
      </div>
    )

  if (busy)
    return (
      <div>
        <Button disabled>Check prompt</Button>
      </div>
    )

  if (account.address)
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => disconnect.disconnect({ connector: account.connector })}
          variant="destructive"
        >
          Sign out
        </Button>
      </div>
    )

  return <SignInButtons />
}

export function SignInButtons() {
  const connect = useConnect()
  const disconnect = useDisconnect()
  const hydrated = useHydrated()
  const connector = useWebAuthnConnector()
  const busy = connect.isPending || disconnect.isPending
  const isE2E = import.meta.env.VITE_E2E === 'true'

  if (!hydrated || !connector)
    return (
      <div>
        <Button disabled>Loading account</Button>
      </div>
    )

  if (busy)
    return (
      <div>
        <Button disabled>Check prompt</Button>
      </div>
    )

  return (
    <div className="flex gap-1">
      <Button
        variant="accent"
        onClick={async () => {
          await disconnect.disconnectAsync().catch(() => {})
          connect.connect({
            connector,
            ...(isE2E
              ? ({ capabilities: { method: 'register', name: 'Tempo Docs' } } as const)
              : {
                  capabilities: {
                    label: 'Tempo Docs',
                    type: 'sign-up',
                  } as never,
                }),
          })
        }}
        type="button"
      >
        Sign up
      </Button>
      <Button
        variant="default"
        onClick={async () => {
          await disconnect.disconnectAsync().catch(() => {})
          connect.connect(
            isE2E
              ? { connector }
              : {
                  connector,
                  capabilities: {
                    label: 'Tempo Docs',
                    type: 'sign-in',
                  } as never,
                },
          )
        }}
        type="button"
      >
        Sign in
      </Button>
    </div>
  )
}
