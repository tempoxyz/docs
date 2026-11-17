'use client'

import * as React from 'react'
import type { Hex } from 'viem'
import { Account, WebAuthnP256 } from 'viem/tempo'
import { webAuthnRpId } from '../../wagmi.config'
import { Container } from '../Container'
import { Button, useCopyToClipboard } from './Demo'
import * as ui from './PasskeyAccountDemo.recipes'
import { passkeyDemoEnvironment as passkeyEnvironment } from './passkey-demo'

/** Where the demo keeps the passkey's ID and public key, which WebAuthn returns only at creation. */
const savedCredentialKey = 'tempo-docs-passkey-account'

type SavedCredential = { id: string; publicKey: Hex; connected?: boolean }

const noSavedPasskey = 'This browser has no passkey from this demo yet. Create one first.'

function readSavedCredential(): SavedCredential | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(savedCredentialKey) ?? 'null')
    return value?.id && value?.publicKey ? value : undefined
  } catch {
    return undefined
  }
}

/** Creates a passkey, or reuses the saved one, and shows the single-key account it signs for. */
export function PasskeyAccountDemo() {
  const [ready, setReady] = React.useState(false)
  const [environment, setEnvironment] = React.useState<ReturnType<typeof passkeyEnvironment>>(null)
  const [pending, setPending] = React.useState<'create' | 'connect' | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, copyAddress] = useCopyToClipboard()
  const busy = React.useRef(false)
  const [address, setAddress] = React.useState<Hex>()
  // Reconnect the saved passkey after a reload, as a wallet connection would.
  React.useEffect(() => {
    const saved = readSavedCredential()
    if (saved?.connected)
      setAddress(Account.fromWebAuthnP256(saved, { rpId: webAuthnRpId }).address)
  }, [])

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
    if (!ready || environment || busy.current) return
    busy.current = true
    setPending(create ? 'create' : 'connect')
    setError(null)
    try {
      const credential = create
        ? await WebAuthnP256.createCredential({ label: 'Tempo Docs', rpId: webAuthnRpId })
        : await WebAuthnP256.getCredential({
            rpId: webAuthnRpId,
            // WebAuthn returns a passkey's public key only at creation, so the demo saved it then.
            async getPublicKey(raw) {
              const saved = readSavedCredential()
              if (saved?.id !== raw.id) throw new Error(noSavedPasskey)
              return saved.publicKey
            },
          })
      localStorage.setItem(
        savedCredentialKey,
        JSON.stringify({ id: credential.id, publicKey: credential.publicKey, connected: true }),
      )
      setAddress(Account.fromWebAuthnP256(credential, { rpId: webAuthnRpId }).address)
    } catch (cause) {
      setError(passkeyError(cause))
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  function disconnectPasskey() {
    const saved = readSavedCredential()
    if (saved)
      localStorage.setItem(savedCredentialKey, JSON.stringify({ ...saved, connected: false }))
    setAddress(undefined)
    setError(null)
  }

  return (
    <div data-testid="passkey-account-demo">
      <Container>
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
                  {copied ? 'Copied' : 'Copy address'}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  disabled={Boolean(pending)}
                  onClick={disconnectPasskey}
                >
                  Disconnect passkey account
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
                disabled={Boolean(pending)}
                onClick={() => void connectPasskey(true)}
              >
                {pending === 'create' ? 'Check the passkey prompt…' : 'Create a passkey account'}
              </Button>
              <Button
                type="button"
                disabled={Boolean(pending)}
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
    if (cause.message === noSavedPasskey) return noSavedPasskey
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
