'use client'
import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'
import * as ui from './AccountsSignIn.recipes'
import { Button, TempoMarkBoxed } from './Demo'

export function AccountsSignIn() {
  const account = useConnection()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const connector = useTempoWalletConnector()

  if (!connector) return null

  if (account.address)
    return (
      <div {...ui.accountsSignInLayout()}>
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
    <div {...ui.accountsSignInLayout2()}>
      <Button variant="accent" onClick={() => connect.connect({ connector })} type="button">
        <TempoMarkBoxed className={ui.tempoMarkBoxed().className} />
        Sign in with Tempo
      </Button>
    </div>
  )
}

function useTempoWalletConnector() {
  const connectors = useConnectors()
  return connectors.find((c: { id: string }) => c.id === 'xyz.tempo')
}
