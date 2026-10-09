'use client'

import * as React from 'react'
import { formatUnits, type Hex } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Actions, WebAuthnP256 } from 'viem/tempo'
import { Container } from '../Container'
import {
  adminKeyCredentialError,
  adminKeyDemoEnvironment,
  parseAdminKeyDemoSession,
  serializeAdminKeyDemoSession,
} from './admin-key-demo'
import { Button, Step, StringFormatter, useCopyToClipboard, useHydrated } from './Demo'
import * as ui from './EarnDepositDemo.recipes'
import {
  createEarnDemoClient,
  type EarnDemoCredential,
  earnDemoAmount,
  earnDemoAsset,
  earnDemoStorageKey,
  earnDemoVault,
  minimumEarnDemoShares,
  parseEarnDemoAmount,
  verifyEarnDemoDeposit,
  verifyEarnDemoVault,
} from './earn-deposit-demo'

type Position = Awaited<ReturnType<ReturnType<typeof createEarnDemoClient>['earn']['getPosition']>>
type Action = 'check' | 'create' | 'fund' | 'approve' | 'deposit' | 'withdraw'

export function EarnDepositDemo({ mode = 'deposit' }: { mode?: 'deposit' | 'withdraw' }) {
  const [copied, copy] = useCopyToClipboard()
  const amountId = React.useId()
  const [amountInput, setAmountInput] = React.useState(formatUnits(earnDemoAmount, 6))
  const assetAmount = parseEarnDemoAmount(amountInput)
  const amountLabel = assetAmount ? formatUnits(assetAmount, 6) : '—'

  const ready = useHydrated()
  const [session, setSession] = React.useState<EarnDemoCredential | null>(null)
  const [available, setAvailable] = React.useState(false)
  const [redeemAvailable, setRedeemAvailable] = React.useState(false)
  const [environment, setEnvironment] =
    React.useState<ReturnType<typeof adminKeyDemoEnvironment>>(null)
  const [position, setPosition] = React.useState<Position | null>(null)
  const [quote, setQuote] = React.useState<{
    shares: bigint
    assetAmount: bigint
    minimum: bigint
    time: number
  } | null>(null)
  const [pending, setPending] = React.useState<Action | null>('check')
  const [error, setError] = React.useState<string | null>(null)
  const [depositHash, setDepositHash] = React.useState<Hex | null>(null)
  const [withdrawHash, setWithdrawHash] = React.useState<Hex | null>(null)
  const busy = React.useRef(false)
  const mounted = React.useRef(true)
  const positionRequest = React.useRef(0)
  const client = React.useMemo(() => session && createEarnDemoClient(session), [session])

  React.useEffect(() => {
    let current = true
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
        parseAdminKeyDemoSession(localStorage.getItem(earnDemoStorageKey), location.hostname),
      )
    } catch {
      /* Storage is checked before account creation. */
    }
    verifyEarnDemoVault('inspect')
      .then((availability) => {
        if (current) {
          setAvailable(availability.deposit)
          setRedeemAvailable(availability.redeem)
        }
      })
      .catch((cause) => {
        if (current) setError(cause instanceof Error ? cause.message : 'Vault verification failed.')
      })
      .finally(() => {
        if (current) setPending(null)
      })
    return () => {
      current = false
      mounted.current = false
    }
  }, [])

  const refresh = React.useCallback(async () => {
    if (!client) return
    const request = ++positionRequest.current
    try {
      const value = await client.earn.getPosition({ vault: earnDemoVault })
      if (mounted.current && request === positionRequest.current) setPosition(value)
    } catch (cause) {
      if (mounted.current && request === positionRequest.current) throw cause
    }
  }, [client])

  React.useEffect(() => {
    let current = true
    refresh().catch(() => {
      if (current) setError('Could not read your test position. Select Check again.')
    })
    return () => {
      current = false
      positionRequest.current++
    }
  }, [refresh])

  async function run(action: Action, work: () => Promise<void>) {
    if (busy.current) return
    busy.current = true
    positionRequest.current++
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

  async function check() {
    setAvailable(false)
    setRedeemAvailable(false)
    setQuote(null)
    const availability = await verifyEarnDemoVault('inspect')
    if (mounted.current) {
      setAvailable(availability.deposit)
      setRedeemAvailable(availability.redeem)
    }
    await refresh()
  }

  async function ensureVault(operation: 'deposit' | 'redeem' = 'deposit') {
    try {
      const availability = await verifyEarnDemoVault(operation)
      if (mounted.current) {
        setAvailable(availability.deposit)
        setRedeemAvailable(availability.redeem)
      }
    } catch (cause) {
      if (mounted.current) {
        if (operation === 'deposit') setAvailable(false)
        else setRedeemAvailable(false)
        setQuote(null)
      }
      throw cause
    }
  }

  async function createAccount() {
    if (environment) return
    const rpId = location.hostname
    const credential = await WebAuthnP256.createCredential({
      label: 'Tempo Earn test account',
      rpId,
      userId: crypto.getRandomValues(new Uint8Array(32)),
    }).catch((cause: unknown) => {
      throw new Error(adminKeyCredentialError(cause))
    })
    const next = { credential: { id: credential.id, publicKey: credential.publicKey }, rpId }
    try {
      localStorage.setItem(earnDemoStorageKey, serializeAdminKeyDemoSession(next))
    } catch {
      throw new Error('Allow browser storage so this demo can restore your test account.')
    }
    if (mounted.current) setSession(next)
  }

  async function fund() {
    if (!client) return
    await client.faucet.fundSync({ account: client.account.address, timeout: 60_000 })
    await refresh()
  }

  async function approve() {
    if (!client || !available || !assetAmount) return
    setQuote(null)
    await ensureVault()
    const current = await client.earn.getPosition({ vault: earnDemoVault })
    if (current.assetAllowance < assetAmount) {
      await client.token.approveSync({
        token: earnDemoAsset,
        spender: earnDemoVault,
        amount: assetAmount,
      })
    }
    const { result } = await Actions.earn.deposit.simulate(client, {
      vault: earnDemoVault,
      assetAmount,
      shareAmountMin: 1n,
    })
    const minimum = minimumEarnDemoShares(result)
    if (mounted.current) setQuote({ shares: result, assetAmount, minimum, time: Date.now() })
    await refresh()
  }

  async function deposit() {
    if (!client || !available || !quote || !assetAmount || quote.assetAmount !== assetAmount) return
    if (Date.now() - quote.time > 60_000) {
      setQuote(null)
      throw new Error('Refresh the quote before depositing.')
    }
    await ensureVault()
    const result = await client.earn.depositSync({
      vault: earnDemoVault,
      assetAmount,
      shareAmountMin: quote.minimum,
    })
    verifyEarnDemoDeposit(result, client.account.address, quote.minimum, assetAmount)
    if (mounted.current) {
      setDepositHash(result.receipt.transactionHash)
      setWithdrawHash(null)
      setQuote(null)
    }
    await refresh()
  }

  async function withdraw() {
    if (!client || !redeemAvailable || !position || position.shareBalance <= 0n) return
    await ensureVault('redeem')
    const result = await client.earn.redeemSync({
      vault: earnDemoVault,
      shareAmount: position.shareBalance,
      slippageBps: 50,
    })
    if (result.receipt.status !== 'success') throw new Error('The withdrawal was not confirmed.')
    if (mounted.current) setWithdrawHash(result.receipt.transactionHash)
    await refresh()
  }

  const busyOrUnready = !ready || pending !== null
  const disabled = busyOrUnready || !available
  const funded = Boolean(position && assetAmount && position.assetBalance > assetAmount)
  return (
    <div data-testid={mode === 'deposit' ? 'earn-deposit-demo' : 'earn-withdraw-demo'}>
      <Container
        headerLeft={
          <span {...ui.earnDepositDemoText()}>
            {mode === 'deposit' ? 'Deposit into a test vault' : 'Withdraw from the test vault'}
          </span>
        }
        headerRight={<span {...ui.earnDepositDemoText2()}>Moderato testnet</span>}
        footer={<span>Test tokens only. This vault does not demonstrate or promise a return.</span>}
      >
        <div {...ui.earnDepositDemoLayout()} aria-busy={pending !== null}>
          <p {...ui.earnDepositDemoText2()}>
            {mode === 'deposit'
              ? 'Deposit test funds into the '
              : 'Withdraw your test position from the '}
            <a
              {...ui.earnDepositDemoLink()}
              href={`${tempoModerato.blockExplorers.default.url}/address/${earnDemoVault}`}
              target="_blank"
              rel="noreferrer"
            >
              verified pathUSD vault
            </a>
            . Each transaction asks for your confirmation.
          </p>
          {client && (
            <div {...ui.earnDepositDemoLayout2()}>
              <span>Test account: {StringFormatter.truncate(client.account.address)}</span>
              <button
                type="button"
                {...ui.earnDepositDemoLink()}
                onClick={() => copy(client.account.address)}
              >
                {copied ? 'Copied address' : 'Copy account address'}
              </button>
            </div>
          )}
          {mode === 'deposit' ? (
            <>
              <div {...ui.earnDepositDemoLayout3()}>
                <label htmlFor={amountId} {...ui.label()}>
                  Deposit amount (pathUSD)
                </label>
                <input
                  id={amountId}
                  type="text"
                  inputMode="decimal"
                  maxLength={85}
                  value={amountInput}
                  disabled={busyOrUnready}
                  aria-invalid={!assetAmount}
                  aria-describedby={`${amountId}-help`}
                  onChange={(event) => {
                    setAmountInput(event.target.value)
                    setQuote(null)
                  }}
                  {...ui.earnDepositDemoInput()}
                />
                <p id={`${amountId}-help`} {...ui.earnDepositDemoText2()}>
                  {assetAmount
                    ? 'Starts at 1 pathUSD. The faucet supplies test funds; keep some for transaction fees.'
                    : 'Enter a positive amount with up to 6 decimal places.'}
                </p>
              </div>
              <Step
                number={1}
                title="Create and fund a test account"
                active={!funded}
                completed={funded}
                actions={
                  client ? (
                    <Button type="button" disabled={disabled} onClick={() => run('fund', fund)}>
                      {pending === 'fund' ? 'Adding test funds…' : 'Get test funds'}
                    </Button>
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
                <p {...ui.earnDepositDemoDescription()}>
                  {client
                    ? `${StringFormatter.truncate(client.account.address)} · ${position ? formatUnits(position.assetBalance, 6) : '…'} pathUSD`
                    : (environment?.message ??
                      'The faucet provides pathUSD for this deposit and transaction fees.')}
                </p>
                {environment?.localhostUrl && (
                  <a href={environment.localhostUrl}>Open on localhost</a>
                )}
              </Step>
              <Step
                number={2}
                title="Approve funds and get a quote"
                active={funded}
                completed={Boolean(quote)}
                actions={
                  <Button
                    type="button"
                    disabled={disabled || !funded}
                    onClick={() => run('approve', approve)}
                  >
                    {pending === 'approve'
                      ? 'Confirming approval…'
                      : position && assetAmount && position.assetAllowance >= assetAmount
                        ? 'Refresh quote'
                        : `Approve ${amountLabel} pathUSD`}
                  </Button>
                }
              >
                <p {...ui.earnDepositDemoDescription()}>
                  Approve only {amountLabel} pathUSD for this vault, then simulate the deposit to
                  check the shares you receive.
                </p>
                {quote && (
                  <p {...ui.earnDepositDemoDescription2()} role="status">
                    Expected: {formatUnits(quote.shares, 6)} shares · Minimum:{' '}
                    {formatUnits(quote.minimum, 6)} shares (0.5% tolerance).
                  </p>
                )}
              </Step>
              <Step
                number={3}
                title="Deposit and check your position"
                active={Boolean(quote)}
                completed={Boolean(depositHash)}
                actions={
                  <Button
                    type="button"
                    variant="accent"
                    disabled={disabled || !quote}
                    onClick={() => run('deposit', deposit)}
                  >
                    {pending === 'deposit'
                      ? 'Confirming deposit…'
                      : `Deposit ${amountLabel} pathUSD`}
                  </Button>
                }
              >
                {position && (
                  <p {...ui.earnDepositDemoDescription2()} role="status">
                    {formatUnits(position.shareBalance, 6)} vault shares · Position value:{' '}
                    {formatUnits(position.value, 6)} pathUSD.
                  </p>
                )}
                {depositHash && <ReceiptLink hash={depositHash}>View deposit receipt</ReceiptLink>}
              </Step>
            </>
          ) : (
            <div {...ui.earnDepositDemoLayout4()}>
              {!client && <p>Use the same browser and test account as the deposit demo.</p>}
              {position && (
                <p role="status">
                  {formatUnits(position.shareBalance, 6)} vault shares · Position value:{' '}
                  {formatUnits(position.value, 6)} pathUSD.
                </p>
              )}
              {(!position || position.shareBalance === 0n) && !withdrawHash && (
                <p>
                  <a href="/docs/earn/integrate#try-a-deposit" {...ui.earnDepositDemoLink()}>
                    Make a test deposit
                  </a>{' '}
                  first. This demo restores that account and selects all its shares for withdrawal.
                </p>
              )}
              {environment?.localhostUrl && (
                <a href={environment.localhostUrl}>Open on localhost</a>
              )}
            </div>
          )}
          {(mode === 'withdraw' || (position && position.shareBalance > 0n)) && (
            <div {...ui.earnDepositDemoLayout5()}>
              <Button
                type="button"
                disabled={
                  busyOrUnready || !redeemAvailable || !position || position.shareBalance <= 0n
                }
                onClick={() => run('withdraw', withdraw)}
              >
                {pending === 'withdraw' ? 'Confirming withdrawal…' : 'Withdraw test position'}
              </Button>
              <p {...ui.earnDepositDemoDescription3()}>
                Redeem the displayed shares for pathUSD, with a 0.5% output tolerance against a
                fresh quote.
              </p>
            </div>
          )}
          {withdrawHash && (
            <div {...ui.earnDepositDemoLayout5()}>
              <p role="status">Withdrawal confirmed.</p>
              <ReceiptLink hash={withdrawHash}>View withdrawal receipt</ReceiptLink>
            </div>
          )}
          {error && (
            <p role="alert" {...ui.earnDepositDemoDescription4()}>
              {error}
            </p>
          )}
          <button
            type="button"
            {...ui.earnDepositDemoButton()}
            disabled={!ready || pending !== null}
            onClick={() => run('check', check)}
          >
            {pending === 'check' ? 'Checking test vault…' : 'Check again'}
          </button>
          {!(mode === 'deposit' ? available : redeemAvailable) && pending === null && (
            <p {...ui.earnDepositDemoText2()}>
              {mode === 'deposit' ? 'Deposits' : 'Withdrawals'} stay disabled until the live
              directory and deployed contract match.{' '}
              <a href="https://tempo.xyz/contact" {...ui.earnDepositDemoLink2()}>
                Contact Tempo
              </a>{' '}
              for access.
            </p>
          )}
        </div>
      </Container>
    </div>
  )
}

export function EarnWithdrawDemo() {
  return <EarnDepositDemo mode="withdraw" />
}

function ReceiptLink({ hash, children }: React.PropsWithChildren<{ hash: Hex }>) {
  return (
    <a
      {...ui.receiptLinkLink()}
      href={`${tempoModerato.blockExplorers.default.url}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
    >
      {children} ↗
    </a>
  )
}
