'use client'

import * as React from 'react'
import { useConnect, useConnections, useDisconnect } from 'wagmi'
import { useWebAuthnConnector } from '../../wagmi.config'
import { Container } from '../Container'
import { adminKeyDemoEnvironment as passkeyEnvironment } from './admin-key-demo'
import { Button, useCopyToClipboard } from './Demo'
import * as ui from './PasskeyAccountDemo.recipes'

export function PasskeyAccountDemo() {
  const connector = useWebAuthnConnector()
  const connections = useConnections()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const [ready, setReady] = React.useState(false)
  const [environment, setEnvironment] = React.useState<ReturnType<typeof passkeyEnvironment>>(null)
  const [pending, setPending] = React.useState<'create' | 'connect' | 'disconnect' | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, copyAddress] = useCopyToClipboard()
  const busy = React.useRef(false)
  const connection = connections.find((item) => item.connector.id === 'webAuthn')
  const address = connection?.accounts[0]

  React.useEffect(() => {
    setEnvironment(
      passkeyEnvironment(
        location.href,
        window.isSecureContext,
        Boolean(window.PublicKeyCredential && navigator.credentials?.create),
      ),
    )
    setReady(true)
  }, [])

  async function connectPasskey(create: boolean) {
    if (!connector || !ready || environment || busy.current) return
    busy.current = true
    setPending(create ? 'create' : 'connect')
    setError(null)
    try {
      await connect.connectAsync({
        connector,
        ...(create ? { capabilities: { method: 'register', name: 'Tempo Docs' } as never } : {}),
      })
    } catch (cause) {
      setError(passkeyError(cause))
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  async function disconnectPasskey() {
    if (!connection || busy.current) return
    busy.current = true
    setPending('disconnect')
    setError(null)
    try {
      await disconnect.disconnectAsync({ connector: connection.connector })
    } catch {
      setError('Could not disconnect this account. Try again.')
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  return (
    <div data-testid="passkey-account-demo">
      <Container
        headerLeft={<span {...ui.passkeyAccountDemoText()}>Passkey account</span>}
        footer="Creating a passkey does not fund the account. Add funds when you are ready to try a payment."
      >
        <div {...ui.passkeyAccountDemoLayout()}>
          {!ready ? (
            <Button type="button" disabled>
              Loading account
            </Button>
          ) : address ? (
            <div {...ui.passkeyAccountDemoLayout2()}>
              <p {...ui.passkeyAccountDemoDescription()} role="status">
                Passkey account connected
              </p>
              <code {...ui.code()} data-testid="passkey-account-address">
                {address}
              </code>
              <div {...ui.passkeyAccountDemoLayout3()}>
                <Button
                  type="button"
                  disabled={Boolean(pending)}
                  onClick={async () => {
                    if (!(await copyAddress(address))) setError('Could not copy the address.')
                  }}
                >
                  {copied ? 'Copied address' : 'Copy address'}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  disabled={Boolean(pending)}
                  onClick={() => void disconnectPasskey()}
                >
                  {pending === 'disconnect' ? 'Disconnecting…' : 'Disconnect passkey account'}
                </Button>
              </div>
              <p {...ui.passkeyAccountDemoDescription2()}>
                Disconnecting leaves the passkey on your device so you can use the account again.
              </p>
            </div>
          ) : environment ? (
            <div {...ui.passkeyAccountDemoLayout2()}>
              <p {...ui.passkeyAccountDemoDescription()}>{environment.message}</p>
              {environment.localhostUrl && (
                <a {...ui.passkeyAccountDemoLink()} href={environment.localhostUrl}>
                  Open on localhost
                </a>
              )}
            </div>
          ) : (
            <div {...ui.passkeyAccountDemoLayout3()}>
              <Button
                type="button"
                variant="accent"
                disabled={!connector || Boolean(pending)}
                onClick={() => void connectPasskey(true)}
              >
                {pending === 'create' ? 'Check the passkey prompt…' : 'Create a passkey account'}
              </Button>
              <Button
                type="button"
                disabled={!connector || Boolean(pending)}
                onClick={() => void connectPasskey(false)}
              >
                {pending === 'connect' ? 'Check the passkey prompt…' : 'Use an existing passkey'}
              </Button>
            </div>
          )}
          {error && (
            <p {...ui.passkeyAccountDemoDescription3()} role="alert">
              {error}
            </p>
          )}
        </div>
      </Container>
    </div>
  )
}

function passkeyError(cause: unknown) {
  const seen = new Set<unknown>()
  while (cause instanceof Error && !seen.has(cause)) {
    seen.add(cause)
    if (cause.name === 'NotAllowedError' || cause.name === 'UserRejectedRequestError')
      return 'The passkey request was cancelled or timed out. Try again when you are ready.'
    if (cause.name === 'SecurityError')
      return 'The browser rejected this site’s passkey request. Use localhost or an HTTPS hostname.'
    if (cause.name === 'NotSupportedError')
      return 'Your browser or device cannot use this passkey. Try a passkey-capable browser or device.'
    cause = cause.cause
  }
  return 'Could not connect the passkey. Try again in a passkey-capable browser.'
}
