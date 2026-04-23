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
            capabilities: { method: 'register', name: 'Tempo Docs' },
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
          connect.connect({ connector, capabilities: { method: 'login' } })
        }}
        type="button"
      >
        Sign in
      </Button>
    </div>
  )
}
