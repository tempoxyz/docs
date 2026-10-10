'use client'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWebAuthnConnector } from '../../wagmi.config'
import { Button, useHydrated } from './Demo'
import * as ui from './EmbedPasskeys.recipes'

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
      <div {...ui.embedPasskeysLayout()}>
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
    <div {...ui.signInButtonsLayout()}>
      <div {...ui.signInButtonsLayout2()}>
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
                      method: 'register',
                      name: 'Tempo Docs',
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
            connect.connect({ connector })
          }}
          type="button"
        >
          Sign in
        </Button>
      </div>
      {connect.error && (
        <div {...ui.signInButtonsLayout3()} role="alert">
          {'shortMessage' in connect.error ? connect.error.shortMessage : connect.error.message}
        </div>
      )}
    </div>
  )
}
