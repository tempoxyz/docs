'use client'

import * as React from 'react'
import type { Hex } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Account, P256, WebAuthnP256 } from 'viem/tempo'
import { Container } from '../Container'
import * as ui from './AdminKeyDemo.recipes'
import {
  type AdminKeyDemoSession,
  type AdminKeyDemoStatus,
  adminKeyCredentialError,
  adminKeyDemoEnvironment,
  adminKeyDemoFeeToken,
  adminKeyDemoStorageKey,
  createAdminKeyDemoClient,
  parseAdminKeyDemoSession,
  readAdminKeyDemoStatus,
  serializeAdminKeyDemoSession,
} from './admin-key-demo'
import { Button, Step, StringFormatter } from './Demo'

type Action = 'create' | 'fund' | 'authorize' | 'revoke' | 'refresh'

export function AdminKeyDemo() {
  const [ready, setReady] = React.useState(false)
  const [environment, setEnvironment] =
    React.useState<ReturnType<typeof adminKeyDemoEnvironment>>(null)
  const [session, setSession] = React.useState<AdminKeyDemoSession | null>(null)
  const [balance, setBalance] = React.useState<{ amount: bigint; formatted: string } | null>(null)
  const [status, setStatus] = React.useState<AdminKeyDemoStatus | null>(null)
  const [pending, setPending] = React.useState<Action | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const busy = React.useRef(false)
  const mounted = React.useRef(true)
  const client = React.useMemo(() => session && createAdminKeyDemoClient(session), [session])

  React.useEffect(() => {
    mounted.current = true
    setEnvironment(
      adminKeyDemoEnvironment(
        location.href,
        window.isSecureContext,
        Boolean(window.PublicKeyCredential && navigator.credentials?.create),
      ),
    )
    try {
      setSession(
        parseAdminKeyDemoSession(localStorage.getItem(adminKeyDemoStorageKey), location.hostname),
      )
    } catch {
      // Browsers may disable storage. Creation reports this before any transaction.
    }
    setReady(true)
    return () => {
      mounted.current = false
    }
  }, [])

  // Restoring the public account record only reads the network; it never signs or funds.
  React.useEffect(() => {
    if (!session || !client) return
    let current = true
    Promise.all([
      client.token.getBalance({ account: client.account.address, token: adminKeyDemoFeeToken }),
      session.key ? readAdminKeyDemoStatus(client, session.key.address) : null,
    ])
      .then(([nextBalance, nextStatus]) => {
        if (!current) return
        setBalance(nextBalance)
        setStatus(nextStatus)
      })
      .catch(() => {
        if (current) setError('Could not read testnet status. Select Refresh to retry.')
      })
    return () => {
      current = false
    }
  }, [session, client])

  function save(next: AdminKeyDemoSession) {
    try {
      localStorage.setItem(adminKeyDemoStorageKey, serializeAdminKeyDemoSession(next))
    } catch {
      throw new Error('Allow browser storage so the demo can save the key ID for revocation.')
    }
    if (mounted.current) setSession(next)
  }

  async function run(action: Action, work: () => Promise<void>) {
    if (busy.current) return
    busy.current = true
    setPending(action)
    setError(null)
    try {
      await work()
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error
            ? 'shortMessage' in cause
              ? String(cause.shortMessage)
              : cause.message
            : 'The request failed. Try again.',
        )
    } finally {
      busy.current = false
      if (mounted.current) setPending(null)
    }
  }

  async function refresh() {
    if (!client || !session) return
    const [nextBalance, nextStatus] = await Promise.all([
      client.token.getBalance({ account: client.account.address, token: adminKeyDemoFeeToken }),
      session.key ? readAdminKeyDemoStatus(client, session.key.address) : null,
    ])
    if (!mounted.current) return
    setBalance(nextBalance)
    setStatus(nextStatus)
  }

  async function createAccount() {
    if (environment) return
    const rpId = location.hostname
    const credential = await WebAuthnP256.createCredential({
      label: 'Tempo admin-key demo',
      rpId,
      userId: crypto.getRandomValues(new Uint8Array(32)),
    }).catch((cause: unknown) => {
      throw new Error(adminKeyCredentialError(cause))
    })
    save({ credential: { id: credential.id, publicKey: credential.publicKey }, rpId })
  }

  async function fund() {
    if (!client) return
    await client.faucet.fundSync({ account: client.account.address, timeout: 60_000 })
    await refresh()
  }

  async function authorize() {
    if (!client || !session) return
    const key = session.key ?? {
      address: Account.fromP256(P256.randomPrivateKey(), { access: client.account })
        .accessKeyAddress,
    }
    const next = { ...session, key }
    // Keep the public key ID even if the transaction result is interrupted.
    save(next)
    const { receipt } = await client.accessKey.authorizeSync({
      accessKey: { address: key.address, type: 'p256' },
      admin: true,
    })
    save({ ...next, key: { ...key, authorizationHash: receipt.transactionHash } })
    const nextStatus = await readAdminKeyDemoStatus(client, key.address)
    if (mounted.current) setStatus(nextStatus)
  }

  async function revoke() {
    if (!client || !session?.key) return
    const { receipt } = await client.accessKey.revokeSync({ accessKey: session.key.address })
    save({
      ...session,
      key: { ...session.key, revocationHash: receipt.transactionHash },
    })
    const nextStatus = await readAdminKeyDemoStatus(client, session.key.address)
    if (mounted.current) setStatus(nextStatus)
  }

  const funded = balance !== null && balance.amount > 0n
  const disabled = !ready || pending !== null

  return (
    <Container
      headerLeft={<span {...ui.adminKeyDemoText()}>Try admin keys</span>}
      headerRight={<span {...ui.adminKeyDemoText2()}>Moderato testnet</span>}
      footer="Uses a separate test account. The generated admin key is discarded; its public ID stays in this browser so you can revoke it."
    >
      <div {...ui.adminKeyDemoLayout()} data-testid="admin-key-demo" aria-busy={pending !== null}>
        <Step
          number={1}
          title="Create and fund a test account"
          active
          completed={Boolean(client && funded)}
          actions={
            client ? (
              <Button type="button" disabled={disabled} onClick={() => run('fund', fund)}>
                {pending === 'fund' ? 'Getting test funds…' : 'Get test funds'}
              </Button>
            ) : environment?.localhostUrl ? (
              <a href={environment.localhostUrl} {...ui.adminKeyDemoLink()}>
                Open on localhost
              </a>
            ) : (
              <Button
                type="button"
                variant="accent"
                disabled={disabled || Boolean(environment)}
                onClick={() => run('create', createAccount)}
              >
                {pending === 'create' ? 'Create your passkey…' : 'Create test account'}
              </Button>
            )
          }
        >
          <div {...ui.adminKeyDemoLayout2()}>
            {client ? (
              <div {...ui.adminKeyDemoLayout3()}>
                <a
                  href={`${tempoModerato.blockExplorers.default.url}/address/${client.account.address}`}
                  target="_blank"
                  rel="noreferrer"
                  title={client.account.address}
                >
                  {StringFormatter.truncate(client.account.address)} ↗
                </a>
                <span>
                  {balance === null ? 'Reading balance…' : `${balance.formatted} AlphaUSD`}
                </span>
              </div>
            ) : (
              (environment?.message ??
              'Create a passkey for this demo, then request test funds for transaction fees.')
            )}
          </div>
        </Step>

        <Step
          number={2}
          title="Authorize an admin key"
          active={Boolean(client && funded)}
          completed={status === 'active' || status === 'revoked'}
          actions={
            <Button
              type="button"
              variant="accent"
              disabled={
                disabled || !client || !funded || status === 'active' || status === 'revoked'
              }
              onClick={() => run('authorize', authorize)}
            >
              {pending === 'authorize' ? 'Confirm with your passkey…' : 'Authorize admin key'}
            </Button>
          }
        >
          <p {...ui.adminKeyDemoLayout2()}>
            Your passkey signs the key authorization and the transaction. Admin keys can manage all
            other keys on the account.
          </p>
          {session?.key && (
            <div {...ui.adminKeyDemoLayout4()}>
              <div {...ui.adminKeyDemoLayout5()}>{session.key.address}</div>
              <div {...ui.adminKeyDemoLayout6()} role="status">
                <code>isAdmin: {status === null ? 'checking…' : String(status === 'active')}</code>
                {status === 'revoked' && <span>Revoked</span>}
                {session.key.authorizationHash && (
                  <ReceiptLink hash={session.key.authorizationHash}>
                    Authorization receipt
                  </ReceiptLink>
                )}
              </div>
            </div>
          )}
        </Step>

        <Step
          number={3}
          title="Revoke the key"
          active={status === 'active'}
          completed={status === 'revoked'}
          actions={
            <Button
              type="button"
              disabled={disabled || status !== 'active'}
              onClick={() => run('revoke', revoke)}
            >
              {pending === 'revoke' ? 'Confirm revocation…' : 'Revoke admin key'}
            </Button>
          }
        >
          {session?.key?.revocationHash && (
            <div {...ui.adminKeyDemoLayout7()}>
              <ReceiptLink hash={session.key.revocationHash}>Revocation receipt</ReceiptLink>
            </div>
          )}
        </Step>

        {error && (
          <p role="alert" {...ui.adminKeyDemoDescription()}>
            {error}
          </p>
        )}
        {client && (
          <button
            type="button"
            disabled={disabled}
            {...ui.adminKeyDemoButton()}
            onClick={() => run('refresh', refresh)}
          >
            {pending === 'refresh' ? 'Refreshing…' : 'Refresh status'}
          </button>
        )}
      </div>
    </Container>
  )
}

function ReceiptLink({ hash, children }: React.PropsWithChildren<{ hash: Hex }>) {
  return (
    <a
      href={`${tempoModerato.blockExplorers.default.url}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
    >
      {children} ↗
    </a>
  )
}
