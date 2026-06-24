'use client'
import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'
import { Button, TempoMarkBoxed } from './Demo'

export function AccountsSignIn() {
  const account = useConnection()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const connector = useTempoWalletConnector()

  if (!connector) return null

  if (account.address)
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => disconnect.disconnect()} variant="destructive">
          Sign out
        </Button>
      </div>
    )

  if (connect.isPending)
    return (
      <div>
        <Button disabled>Check prompt</Button>
      </div>
    )

  return (
    <div className="flex gap-1">
      <Button variant="accent" onClick={() => connect.connect({ connector })} type="button">
        <TempoMarkBoxed className="size-[14px]" />
        Sign in with Tempo
      </Button>
    </div>
  )
}

function useTempoWalletConnector() {
  const connectors = useConnectors()
  return connectors.find((c: { id: string }) => c.id === 'xyz.tempo')
}
