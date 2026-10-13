'use client'

import * as React from 'react'
import { type Hex, parseUnits } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Account, createClient, WebCryptoP256 } from 'viem/tempo'
import { Container } from '../Container'
import * as ui from './AccountDemo.recipes'
import { adminKeyDemoFeeToken } from './admin-key-demo'
import { Button, FAKE_RECIPIENT, Step, StringFormatter } from './Demo'

const token = adminKeyDemoFeeToken
const payment = parseUnits('1', 6)
const database = 'tempo-docs-p256-key-demo'
const store = 'keys'
const record = 'browser-key'

type KeyPair = Awaited<ReturnType<typeof WebCryptoP256.createKeyPair>>
type Action = 'create' | 'fund' | 'pay' | 'delete'
type Result = { hash?: Hex; message: string }

/**
 * A non-extractable P-256 key made with WebCrypto and kept in this browser's IndexedDB. The key is
 * the test account's signer on Moderato, so payments sign without a prompt.
 */
export function P256KeyDemo() {
  const [ready, setReady] = React.useState(false)
  const [keyPair, setKeyPair] = React.useState<KeyPair | null>(null)
  const [restored, setRestored] = React.useState(false)
  const [exportBlocked, setExportBlocked] = React.useState<boolean | null>(null)
  const [balance, setBalance] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<Partial<Record<Action, Result>>>({})
  const [pending, setPending] = React.useState<Action | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const busy = React.useRef(false)

  const client = React.useMemo(
    () =>
      keyPair &&
      createClient({
        account: Account.fromWebCryptoP256(keyPair),
        chain: tempoModerato,
        feeToken: token,
      }),
    [keyPair],
  )

  React.useEffect(() => {
    loadKey()
      .then((stored) => {
        if (stored) {
          setKeyPair(stored)
          setRestored(true)
        }
      })
      .catch(() => setError('This browser blocked IndexedDB, so the key can’t be kept.'))
      .finally(() => setReady(true))
  }, [])

  React.useEffect(() => {
    if (!keyPair) return
    void exportBlockedFor(keyPair).then(setExportBlocked)
  }, [keyPair])

  const refresh = React.useCallback(async () => {
    if (!client) return
    const next = await client.token.getBalance({ account: client.account.address, token })
    setBalance(next.formatted)
  }, [client])

  React.useEffect(() => {
    refresh().catch(() => setError('Could not read testnet status.'))
  }, [refresh])

  async function run(action: Action, work: () => Promise<Result | undefined>) {
    if (busy.current) return
    busy.current = true
    setPending(action)
    setError(null)
    try {
      const result = await work()
      if (result) setResults((current) => ({ ...current, [action]: result }))
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Try again.')
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  async function create() {
    const next = await WebCryptoP256.createKeyPair()
    await saveKey(next)
    setRestored(false)
    setKeyPair(next)
    return undefined
  }

  async function fund() {
    if (!client) return
    await client.faucet.fundSync({ account: client.account.address, timeout: 60_000 })
    return { message: 'Funded with test stablecoins.' }
  }

  async function pay() {
    if (!client) return
    const { receipt } = await client.token.transferSync({
      amount: payment,
      to: FAKE_RECIPIENT,
      token,
    })
    return { hash: receipt.transactionHash, message: 'Paid 1 AlphaUSD. No prompt.' }
  }

  async function forget() {
    await deleteKey()
    setKeyPair(null)
    setBalance(null)
    setExportBlocked(null)
    setRestored(false)
    setResults({})
    return undefined
  }

  const funded = balance !== null && Number(balance) > 0
  const disabled = !ready || pending !== null

  return (
    <Container
      headerLeft={<span {...ui.accountDemoTitle()}>Try a browser device key</span>}
      headerRight={<span {...ui.accountDemoMuted()}>Moderato testnet</span>}
      footer="Real testnet transactions. The private key is non-extractable and never leaves this browser."
    >
      <div {...ui.accountDemoSteps()} data-testid="p256-key-demo" aria-busy={pending !== null}>
        <Step
          number={1}
          title="Create a key in this browser"
          active
          completed={Boolean(keyPair)}
          actions={
            <Button
              type="button"
              variant="accent"
              disabled={disabled || Boolean(keyPair)}
              onClick={() => run('create', create)}
            >
              {pending === 'create' ? 'Creating…' : keyPair ? 'Created' : 'Create key'}
            </Button>
          }
        >
          {keyPair && client && (
            <p {...ui.accountDemoNote()}>
              {StringFormatter.truncate(client.account.address)}
              {restored ? ' · restored from this browser after a reload' : ''}
              {exportBlocked === true && ' · export blocked by the browser'}
              {exportBlocked === false && ' · warning: this browser allowed an export'}
            </p>
          )}
        </Step>

        <Step
          number={2}
          title="Get test funds"
          active={Boolean(keyPair)}
          completed={funded}
          actions={
            <Button
              type="button"
              disabled={disabled || !keyPair || funded}
              onClick={() => run('fund', fund)}
            >
              {pending === 'fund' ? 'Funding…' : funded ? 'Funded' : 'Get test funds'}
            </Button>
          }
        >
          {keyPair && balance !== null && <p {...ui.accountDemoNote()}>{balance} AlphaUSD</p>}
        </Step>

        <Step
          number={3}
          title="Pay 1 AlphaUSD with the key"
          active={funded}
          completed={Boolean(results.pay)}
          actions={
            <Button type="button" disabled={disabled || !funded} onClick={() => run('pay', pay)}>
              {pending === 'pay' ? 'Paying…' : 'Pay'}
            </Button>
          }
        >
          <ResultLine result={results.pay} />
        </Step>

        <Step
          number={4}
          title="Delete the key"
          active={Boolean(results.pay)}
          completed={false}
          actions={
            <Button
              type="button"
              disabled={disabled || !keyPair}
              onClick={() => run('delete', forget)}
            >
              {pending === 'delete' ? 'Deleting…' : 'Delete key'}
            </Button>
          }
        >
          <p {...ui.accountDemoNote()}>
            With no other signer, the account’s funds can’t be reached again. Pair the key with a
            passkey or login, or use it as an access key.
          </p>
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

function ResultLine({ result }: { result: Result | undefined }) {
  if (!result) return null
  return (
    <p {...ui.accountDemoResult()} role="status">
      {result.message}{' '}
      {result.hash && (
        <a
          href={`${tempoModerato.blockExplorers.default.url}/tx/${result.hash}`}
          target="_blank"
          rel="noreferrer"
        >
          Receipt ↗
        </a>
      )}
    </p>
  )
}

/** Whether the browser refuses to export the private key, which is what non-extractable means. */
async function exportBlockedFor(keyPair: KeyPair) {
  try {
    await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    return false
  } catch {
    return true
  }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(database, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** IndexedDB keeps the CryptoKey itself, so a non-extractable key survives a reload. */
async function transact<value>(
  mode: IDBTransactionMode,
  work: (keys: IDBObjectStore) => IDBRequest<value>,
) {
  const db = await openDatabase()
  try {
    return await new Promise<value>((resolve, reject) => {
      const request = work(db.transaction(store, mode).objectStore(store))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

function loadKey() {
  return transact<KeyPair | undefined>('readonly', (keys) => keys.get(record))
}

function saveKey(keyPair: KeyPair) {
  return transact('readwrite', (keys) => keys.put(keyPair, record))
}

function deleteKey() {
  return transact('readwrite', (keys) => keys.delete(record))
}
