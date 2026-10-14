'use client'

import type * as TempoAuth from '@tempoxyz/auth'
import * as React from 'react'
import { type Address, formatUnits, type Hex, parseUnits } from 'viem'
import { tempoModerato } from 'viem/chains'
import { createClient, Expiry, Scopes } from 'viem/tempo'
import { Container } from '../Container'
import * as ui from './AccountDemo.recipes'
import { Button, FAKE_RECIPIENT, Step, StringFormatter } from './Demo'
import { alphaUsd } from './tokens'

/** The docs' app in Tempo Auth's staging environment, which issues keys for Moderato testnet. */
const authConfig = {
  chainId: tempoModerato.id,
  clientId: 'client_01M4VQ0BE97VZ4WXNB5QVXGY9K',
  url: 'https://auth.tehq.dev',
} as const

const token = alphaUsd as Address
const limit = parseUnits('5', 6)
const payment = parseUnits('1', 6)
const selectors: Record<string, string> = {
  '0xa9059cbb': 'transfer',
  '0x95777d59': 'transferWithMemo',
}

/** Where the demo keeps the signed-in key between page loads: IndexedDB, since the key is a CryptoKey. */
const database = 'tempo-docs-sign-in-with-tempo'
const storeName = 'session'

type Session = { email: string; key: TempoAuth.Key.Key }
type Action = 'sign-in' | 'fund' | 'pay' | 'sign-out'
type Result = { hash?: Hex; message: string }

function createAuth({ Auth }: typeof TempoAuth) {
  return Auth.create({
    ...authConfig,
    redirectUri: `${location.origin}${location.pathname.replace(/\/$/, '')}`,
  })
}

/** Signs in with Tempo Auth, shows the access key's permissions, and pays with the key on Moderato. */
export function SignInWithTempoDemo() {
  const [lib, setLib] = React.useState<typeof TempoAuth | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [balance, setBalance] = React.useState<bigint | null>(null)
  const [remaining, setRemaining] = React.useState<bigint | null>(null)
  const [results, setResults] = React.useState<Partial<Record<Action, Result>>>({})
  const [pending, setPending] = React.useState<Action | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const busy = React.useRef(false)
  const root = React.useRef<HTMLDivElement>(null)

  const account = React.useMemo(
    () => (lib && session ? lib.Key.toAccount(session.key) : null),
    [lib, session],
  )
  const client = React.useMemo(
    () => account && createClient({ account, chain: tempoModerato, feeToken: token }),
    [account],
  )

  // Finish a sign-in that redirected back here, or restore the key from an earlier one.
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const denied = new URL(location.href).searchParams.get('error_description')
      // Loaded here, so the package stays out of the server render.
      const loaded = await import('@tempoxyz/auth')
      const authorization = await loaded.Actions.redirect.complete(createAuth(loaded))
      if (cancelled) return
      setLib(loaded)
      if (authorization) {
        const next = fromAuthorization(authorization)
        await saveSession(next).catch(() => undefined)
        setSession(next)
        root.current?.scrollIntoView({ block: 'center' })
        return
      }
      if (denied) {
        // A denied request returns with `error` and no code. Show it once, and tidy the URL.
        const clean = new URL(location.href)
        for (const name of ['error', 'error_description', 'error_uri', 'state'])
          clean.searchParams.delete(name)
        history.replaceState(null, '', clean.pathname + clean.search + clean.hash)
        setError(denied)
        root.current?.scrollIntoView({ block: 'center' })
      }
      const stored = await readSession().catch(() => null)
      if (!cancelled && stored && !loaded.Key.expired(stored.key)) setSession(stored)
    })().catch((cause) => {
      if (!cancelled) setError(errorMessage(cause))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = React.useCallback(async () => {
    if (!client || !account) return
    const next = await client.token.getBalance({ account: account.address, token })
    setBalance(next.amount)
    const limit = await client.accessKey
      .getRemainingLimit({ account: account.address, accessKey: account.accessKeyAddress, token })
      .catch(() => null)
    setRemaining(limit?.remaining ?? null)
  }, [account, client])

  React.useEffect(() => {
    refresh().catch(() => setError('Could not read testnet balances.'))
  }, [refresh])

  async function run(action: Action, work: () => Promise<Result | undefined>) {
    if (busy.current) return
    busy.current = true
    setPending(action)
    setError(null)
    try {
      const result = await work()
      if (result) setResults((current) => ({ ...current, [action]: result }))
      if (action === 'fund' || action === 'pay') await refresh()
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  async function signIn() {
    if (!lib) return
    // The browser leaves for Tempo Auth, which shows these limits for the user to approve.
    await lib.Actions.redirect.start(createAuth(lib), {
      permissions: {
        expiry: Expiry.days(1),
        limits: [{ limit, token }],
        scopes: [Scopes.tip20(token).transfer()],
      },
    })
    return undefined
  }

  async function fund() {
    if (!client || !account) return
    await client.faucet.fundSync({ account: account.address, timeout: 60_000 })
    return { message: 'Funded with test stablecoins.' }
  }

  async function pay() {
    if (!client || !account) return
    // The first transaction carries the key authorization, which registers the key on Tempo.
    const { receipt } = await client.token.transferSync({
      amount: payment,
      to: FAKE_RECIPIENT,
      token,
    })
    return { hash: receipt.transactionHash, message: 'Paid 1 AlphaUSD with the access key.' }
  }

  async function signOut() {
    // Ends the Tempo Auth session too. The key stays valid on Tempo until it expires.
    if (lib) await lib.Actions.signOut(createAuth(lib)).catch(() => undefined)
    await clearSession().catch(() => undefined)
    setSession(null)
    setBalance(null)
    setRemaining(null)
    setResults({})
    return undefined
  }

  const funded = balance !== null && balance > 0n
  const disabled = !lib || pending !== null
  const permissions = session && describePermissions(session.key)

  return (
    <Container
      headerLeft={<span {...ui.accountDemoTitle()}>Sign in with Tempo</span>}
      headerRight={<span {...ui.accountDemoMuted()}>Moderato testnet</span>}
      footer="Real testnet transactions. The wallet provider holds the owner key; this page holds only the access key, a non-extractable browser key."
    >
      <div
        ref={root}
        {...ui.accountDemoSteps()}
        data-testid="sign-in-with-tempo-demo"
        aria-busy={pending !== null}
      >
        <Step
          number={1}
          title="Sign in with Tempo"
          active
          completed={Boolean(session)}
          actions={
            session ? (
              <Button type="button" disabled={disabled} onClick={() => run('sign-out', signOut)}>
                {pending === 'sign-out' ? 'Signing out…' : 'Sign out'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="accent"
                disabled={disabled}
                onClick={() => run('sign-in', signIn)}
              >
                {pending === 'sign-in' ? 'Opening Tempo…' : 'Sign in with Tempo'}
              </Button>
            )
          }
        >
          {session && account && permissions ? (
            <>
              <p {...ui.accountDemoAddress()}>
                {session.email} · Tempo Account {account.address}
              </p>
              <p {...ui.accountDemoNoteTight()}>
                Access key {StringFormatter.truncate(account.accessKeyAddress)}: {permissions}
              </p>
            </>
          ) : (
            <p {...ui.accountDemoNote()}>
              Sign in on Tempo’s page and approve a key for this page: up to 5 AlphaUSD in
              transfers, for 1 day.
            </p>
          )}
        </Step>

        <Step
          number={2}
          title="Get test funds"
          active={Boolean(session)}
          completed={funded}
          actions={
            <Button
              type="button"
              disabled={disabled || !session || funded}
              onClick={() => run('fund', fund)}
            >
              {pending === 'fund' ? 'Funding…' : funded ? 'Funded' : 'Get test funds'}
            </Button>
          }
        >
          {session && (
            <p {...ui.accountDemoNote()}>
              {balance === null ? '…' : formatUnits(balance, 6)} AlphaUSD
            </p>
          )}
        </Step>

        <Step
          number={3}
          title="Pay 1 AlphaUSD with the access key"
          active={Boolean(session) && funded}
          completed={Boolean(results.pay)}
          actions={
            <Button
              type="button"
              variant="accent"
              disabled={disabled || !session || !funded}
              onClick={() => run('pay', pay)}
            >
              {pending === 'pay' ? 'Paying…' : 'Pay with key'}
            </Button>
          }
        >
          {results.pay && (
            <p {...ui.accountDemoResult()} role="status">
              {results.pay.message}{' '}
              {results.pay.hash && (
                <a
                  href={`${tempoModerato.blockExplorers.default.url}/tx/${results.pay.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {StringFormatter.truncate(results.pay.hash)} ↗
                </a>
              )}
            </p>
          )}
          {session && remaining !== null && results.pay && (
            <p {...ui.accountDemoNoteTight()}>
              {formatUnits(remaining, 6)} AlphaUSD left on the key
            </p>
          )}
        </Step>

        {error && (
          <p role="alert" {...ui.accountDemoError()}>
            {error}
          </p>
        )}
      </div>
    </Container>
  )
}

function fromAuthorization(authorization: TempoAuth.Authorization.Authorization): Session {
  return { email: authorization.user.email, key: authorization.key }
}

/** What the owner signed for the key: its limits, calls, and expiry. */
function describePermissions(key: TempoAuth.Key.Key) {
  const { allowedCalls, expiry, limits } = key.keyAuthorization
  const spend = (limits ?? [])
    .map((item) => `${formatUnits(BigInt(item.limit), 6)} ${tokenName(item.token)}`)
    .join(', ')
  const calls = (allowedCalls ?? [])
    .flatMap((call) =>
      (call.selectorRules ?? []).map((rule) => selectors[rule.selector] ?? rule.selector),
    )
    .join(', ')
  const until = expiry
    ? new Date(Number(BigInt(expiry)) * 1000).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'no expiry'
  return `up to ${spend || 'no limit'}${calls ? ` via ${calls}` : ''}, until ${until}`
}

function tokenName(address: string) {
  return address.toLowerCase() === token.toLowerCase()
    ? 'AlphaUSD'
    : StringFormatter.truncate(address)
}

function errorMessage(cause: unknown) {
  if (cause instanceof Error)
    return 'shortMessage' in cause ? String(cause.shortMessage) : cause.message
  return 'The request failed. Try again.'
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(database, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transact<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest) {
  const db = await openDatabase()
  return new Promise<T>((resolve, reject) => {
    const request = work(db.transaction(storeName, mode).objectStore(storeName))
    request.onsuccess = () => resolve(request.result as T)
    request.onerror = () => reject(request.error)
  }).finally(() => db.close())
}

function readSession() {
  return transact<Session | undefined>('readonly', (store) => store.get('current'))
}

function saveSession(session: Session) {
  return transact('readwrite', (store) => store.put(session, 'current'))
}

function clearSession() {
  return transact('readwrite', (store) => store.delete('current'))
}
