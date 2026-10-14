'use client'

import * as React from 'react'
import { type Address, type Hex, parseUnits } from 'viem'
import { tempoDevnet } from 'viem/chains'
import { Account, createClient, http, WebCryptoP256 } from 'viem/tempo'
import LucideCheck from '~icons/lucide/check'
import LucideCopy from '~icons/lucide/copy'
import { Container } from '../Container'
import * as ui from './AccountDemo.recipes'
import { shortHash } from './account-sandbox'
import { devnetRpcUrl, devnetToken } from './account-sandbox-devnet'
import { Button, FAKE_RECIPIENT, Step, StringFormatter, useCopyToClipboard } from './Demo'

const token = devnetToken
const dailyLimit = parseUnits('10', 6)
const payment = parseUnits('2', 6)
const overspend = parseUnits('20', 6)
/** The Tempo Accounts devnet, reached through the docs site's RPC proxy. */
const network = {
  chain: tempoDevnet,
  feeToken: token,
  transport: http(devnetRpcUrl, { retryCount: 0 }),
}

type Action = 'create' | 'fund' | 'authorize' | 'pay' | 'overspend' | 'revoke'

/** A non-extractable WebCrypto P-256 key, acting for the test account. */
async function createAccessKey(access: Address) {
  return Account.fromWebCryptoP256(await WebCryptoP256.createKeyPair(), { access })
}
type Result = { hash?: Hex; message: string; ok: boolean }
type KeyPair = Awaited<ReturnType<typeof WebCryptoP256.createKeyPair>>

/** Authorizes, uses, and revokes a limited access key with real devnet transactions. */
export function AccessKeyDemo() {
  const [ready, setReady] = React.useState(false)
  /** Why this browser can't make WebCrypto keys, or `null` when it can. */
  const [environment, setEnvironment] = React.useState<string | null>(null)
  // The test account's signer: a device key, non-extractable and held in memory only.
  const [signer, setSigner] = React.useState<KeyPair | null>(null)
  const [balance, setBalance] = React.useState<string | null>(null)
  const [remaining, setRemaining] = React.useState<bigint | null>(null)
  const [revoked, setRevoked] = React.useState(false)
  const [results, setResults] = React.useState<Partial<Record<Action, Result>>>({})
  const [pending, setPending] = React.useState<Action | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  // The access key is non-extractable and held in memory only. Reloading the page discards it.
  const keyRef = React.useRef<Awaited<ReturnType<typeof createAccessKey>> | null>(null)
  const busy = React.useRef(false)
  const client = React.useMemo(
    () =>
      signer &&
      createClient({
        account: Account.fromWebCryptoP256(signer),
        ...network,
      }),
    [signer],
  )

  React.useEffect(() => {
    setEnvironment(
      window.isSecureContext && globalThis.crypto?.subtle
        ? null
        : 'Device keys need WebCrypto. Open this demo on localhost or an HTTPS hostname.',
    )
    setReady(true)
  }, [])

  const refresh = React.useCallback(async () => {
    if (!client) return
    const next = await client.token.getBalance({ account: client.account.address, token })
    setBalance(next.formatted)
    const key = keyRef.current
    if (key) {
      const metadata = await client.accessKey.getMetadata({ accessKey: key })
      setRevoked(metadata.isRevoked)
      if (!metadata.isRevoked) {
        const limit = await client.accessKey.getRemainingLimit({ accessKey: key, token })
        setRemaining(limit.remaining)
      }
    }
  }, [client])

  React.useEffect(() => {
    refresh().catch(() => setError('Could not read devnet status.'))
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
      setError(errorMessage(cause))
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  async function createAccount() {
    setSigner(await WebCryptoP256.createKeyPair())
    return undefined
  }

  async function fund() {
    if (!client) return
    await client.faucet.fundSync({ account: client.account.address, timeout: 60_000 })
    return { message: 'Funded with test stablecoins.', ok: true }
  }

  async function authorize() {
    if (!client) return
    const key = await createAccessKey(client.account.address)
    const { receipt } = await client.accessKey.authorizeSync({
      accessKey: key,
      expiry: Math.floor(Date.now() / 1000) + 3600,
      limits: [{ token, limit: dailyLimit, period: 86_400 }],
      scopes: [{ address: token, selector: 'transfer(address,uint256)' }],
    })
    keyRef.current = key
    setRevoked(false)
    return { hash: receipt.transactionHash, message: 'Authorized.', ok: true }
  }

  function keyClient() {
    const key = keyRef.current
    if (!key) throw new Error('Authorize a key first. Reloading the page discards it.')
    return {
      account: key,
      client: createClient({ account: key, ...network }),
    }
  }

  async function pay() {
    const { account, client: payer } = keyClient()
    const { receipt } = await payer.token.transferSync({
      account,
      amount: payment,
      to: FAKE_RECIPIENT,
      token,
    })
    return { hash: receipt.transactionHash, message: 'Paid 2 AlphaUSD. No prompt.', ok: true }
  }

  async function tryOverspend() {
    try {
      const { account, client: payer } = keyClient()
      await payer.token.transferSync({ account, amount: overspend, to: FAKE_RECIPIENT, token })
      return { message: 'Unexpectedly accepted.', ok: false }
    } catch {
      return { message: 'Rejected by Tempo: over the daily limit.', ok: true }
    }
  }

  async function revoke() {
    if (!client || !keyRef.current) return
    const { receipt } = await client.accessKey.revokeSync({ accessKey: keyRef.current })
    return { hash: receipt.transactionHash, message: 'Revoked.', ok: true }
  }

  const funded = balance !== null && Number(balance) > 0
  const authorized = Boolean(keyRef.current) && !revoked
  const disabled = !ready || pending !== null

  return (
    <Container
      headerLeft={<span {...ui.accountDemoTitle()}>Try an access key</span>}
      headerRight={<span {...ui.accountDemoMuted()}>Tempo Accounts devnet</span>}
      footer="A separate test account. Both keys live in this tab’s memory and are gone on reload."
    >
      <div {...ui.accountDemoSteps()} data-testid="access-key-demo" aria-busy={pending !== null}>
        <Step
          number={1}
          title="Create and fund a test account"
          active
          completed={Boolean(client && funded)}
          actions={
            client ? (
              <Button type="button" disabled={disabled || funded} onClick={() => run('fund', fund)}>
                {pending === 'fund' ? 'Funding…' : funded ? 'Funded' : 'Get test funds'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="accent"
                disabled={disabled || Boolean(environment)}
                onClick={() => run('create', createAccount)}
              >
                {pending === 'create' ? 'Creating the device key…' : 'Create test account'}
              </Button>
            )
          }
        >
          <p {...ui.accountDemoNote()}>
            {client
              ? `${StringFormatter.truncate(client.account.address)} · ${balance ?? '…'} AlphaUSD`
              : (environment ?? 'A device key in this browser is the account’s signer.')}
          </p>
        </Step>

        <Step
          number={2}
          title="Authorize a key: 10 AlphaUSD a day, 1 hour, payments only"
          active={Boolean(client && funded)}
          completed={Boolean(results.authorize)}
          actions={
            <Button
              type="button"
              variant="accent"
              disabled={disabled || !funded || authorized}
              onClick={() => run('authorize', authorize)}
            >
              {pending === 'authorize' ? 'Approving with the device key…' : 'Authorize key'}
            </Button>
          }
        >
          <ResultLine result={results.authorize} />
        </Step>

        <Step
          number={3}
          title="Pay 2 AlphaUSD with the key"
          active={authorized}
          completed={Boolean(results.pay)}
          actions={
            <Button
              type="button"
              disabled={disabled || !authorized}
              onClick={() => run('pay', pay)}
            >
              {pending === 'pay' ? 'Paying…' : 'Pay with key'}
            </Button>
          }
        >
          <ResultLine result={results.pay} />
          {authorized && remaining !== null && (
            <p {...ui.accountDemoNoteTight()}>
              {(Number(remaining) / 1e6).toFixed(2)} AlphaUSD left today
            </p>
          )}
        </Step>

        <Step
          number={4}
          title="Try to spend 20 AlphaUSD"
          active={Boolean(results.pay) && authorized}
          completed={Boolean(results.overspend)}
          actions={
            <Button
              type="button"
              disabled={disabled || !authorized}
              onClick={() => run('overspend', tryOverspend)}
            >
              {pending === 'overspend' ? 'Sending…' : 'Overspend'}
            </Button>
          }
        >
          <ResultLine result={results.overspend} />
        </Step>

        <Step
          number={5}
          title="Revoke the key"
          active={authorized}
          completed={revoked}
          actions={
            <Button
              type="button"
              disabled={disabled || !authorized}
              onClick={() => run('revoke', revoke)}
            >
              {pending === 'revoke' ? 'Approving with the device key…' : 'Revoke key'}
            </Button>
          }
        >
          <ResultLine result={results.revoke} />
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
      {result.message}
      {result.hash && (
        <>
          {' '}
          <TxHash hash={result.hash} />
        </>
      )}
    </p>
  )
}

/** A transaction hash with a copy button. The devnet has no public explorer. */
function TxHash({ hash }: { hash: Hex }) {
  const [copied, copy] = useCopyToClipboard()
  const Icon = copied ? LucideCheck : LucideCopy
  return (
    <span {...ui.accountDemoTx()}>
      <code {...ui.accountDemoTxHash()} title={hash}>
        {shortHash(hash)}
      </code>
      <button
        type="button"
        {...ui.accountDemoTxCopy()}
        aria-label="Copy transaction hash"
        onClick={() => copy(hash)}
      >
        <Icon aria-hidden="true" className={ui.accountDemoTxIcon().className} />
      </button>
    </span>
  )
}

function errorMessage(cause: unknown) {
  if (cause instanceof Error)
    return 'shortMessage' in cause ? String(cause.shortMessage) : cause.message
  return 'The request failed. Try again.'
}
