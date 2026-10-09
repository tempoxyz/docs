'use client'
import * as React from 'react'
import {
  BaseError,
  formatUnits,
  type Hash,
  type Hex,
  parseEventLogs,
  type TransactionReceipt,
} from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { Abis, Account, Actions, Addresses, createClient } from 'viem/tempo'
import { Button, ExplorerAccountLink, ExplorerLink, Step, useHydrated } from '../../Demo'
import { alphaUsd, betaUsd } from '../../tokens'

const amount = 1_000_000n
const newClient = () =>
  createClient({
    account: Account.fromSecp256k1(generatePrivateKey()),
    chain: tempoModerato,
    feeToken: alphaUsd,
  })
type DemoClient = ReturnType<typeof newClient>
type Task = 'fund' | 'configure' | 'allowed' | 'blocked' | 'claim'

export function findBlockedReceipt(receipt: Pick<TransactionReceipt, 'logs'>, receiver: Hex) {
  const events = parseEventLogs({
    abi: Abis.receivePolicyGuard,
    eventName: 'TransferBlocked',
    logs: receipt.logs.filter(
      (log) => log.address.toLowerCase() === Addresses.receivePolicyGuard.toLowerCase(),
    ),
    strict: true,
  })
  const event = events.find(
    ({ args }) =>
      args.receiver.toLowerCase() === receiver.toLowerCase() &&
      args.token.toLowerCase() === betaUsd &&
      args.amount === amount,
  )
  if (!event) throw new Error('The receipt does not confirm 1 BetaUSD held for this account.')
  return event.args.receipt
}

export function ReceivePolicyDemo() {
  const hydrated = useHydrated()
  const clientRef = React.useRef<DemoClient | null>(null)
  const pending = React.useRef(false)
  const transactions = React.useRef<Record<string, Hash>>({})
  const policyId = React.useRef<bigint | undefined>(undefined)
  const [address, setAddress] = React.useState<Hex>()
  const [busy, setBusy] = React.useState<Task>()
  const [error, setError] = React.useState<{ task: Task; message: string }>()
  const [funded, setFunded] = React.useState(false)
  const [configured, setConfigured] = React.useState(false)
  const [allowed, setAllowed] = React.useState(false)
  const [blockedReceipt, setBlockedReceipt] = React.useState<Hex>()
  const [claimed, setClaimed] = React.useState(false)
  const [hashes, setHashes] = React.useState<Record<string, Hash>>({})
  const [balanceError, setBalanceError] = React.useState(false)
  const [balances, setBalances] = React.useState<{ alpha: bigint; beta: bigint }>()

  function getClient() {
    if (!clientRef.current) throw new Error('Create a test account first.')
    return clientRef.current
  }

  async function confirm(key: string, submit: () => Promise<Hash>) {
    const client = getClient()
    let hash = transactions.current[key]
    if (!hash) {
      hash = await submit()
      transactions.current[key] = hash
      setHashes({ ...transactions.current })
    }
    // A timeout retries confirmation of the same transaction, not the payment.
    const receipt = await client.waitForTransactionReceipt({ hash })
    if (receipt.status !== 'success') {
      delete transactions.current[key]
      throw new Error('Transaction reverted. You can retry this step.')
    }
    return receipt
  }

  async function refreshBalances() {
    const client = getClient()
    const [alpha, beta] = await Promise.all([
      client.token.getBalance({ token: alphaUsd, account: client.account.address }),
      client.token.getBalance({ token: betaUsd, account: client.account.address }),
    ])
    setBalances({ alpha: alpha.amount, beta: beta.amount })
  }

  async function run(task: Task, action: () => Promise<void>) {
    if (pending.current) return
    pending.current = true
    setBusy(task)
    setError(undefined)
    try {
      await action()
      try {
        await refreshBalances()
        setBalanceError(false)
      } catch {
        setBalanceError(true)
      }
    } catch (cause) {
      setError({
        task,
        message:
          cause instanceof BaseError
            ? cause.shortMessage
            : cause instanceof Error
              ? cause.message
              : 'The request failed. Try again.',
      })
    } finally {
      pending.current = false
      setBusy(undefined)
    }
  }

  const fund = () =>
    run('fund', async () => {
      const client = clientRef.current ?? newClient()
      clientRef.current = client
      setAddress(client.account.address)
      await client.faucet.fundSync({ account: client.account.address })
      setFunded(true)
    })
  const configure = () =>
    run('configure', async () => {
      const client = getClient()
      if (policyId.current === undefined) {
        const receipt = await confirm('filter', () =>
          client.policy.create({ type: 'whitelist', addresses: [alphaUsd] }),
        )
        policyId.current = Actions.policy.create.extractEvent(receipt.logs).args.policyId
      }
      await confirm('configure', () =>
        client.receivePolicy.set({
          senderPolicyId: 'allow-all',
          tokenPolicyId: policyId.current,
          claimer: 'self',
        }),
      )
      setConfigured(true)
    })
  const send = (blocked: boolean) =>
    run(blocked ? 'blocked' : 'allowed', async () => {
      const client = getClient()
      const token = blocked ? betaUsd : alphaUsd
      const receipt = await confirm(blocked ? 'blocked' : 'allowed', () =>
        client.token.transfer({
          token,
          to: client.account.address,
          amount,
        }),
      )
      if (blocked) {
        const witness = findBlockedReceipt(receipt, client.account.address)
        setBlockedReceipt(witness)
      } else {
        const transfers = parseEventLogs({
          abi: Abis.tip20,
          eventName: 'Transfer',
          strict: true,
          logs: receipt.logs.filter((log) => log.address.toLowerCase() === alphaUsd),
        })
        if (
          !transfers.some(
            ({ args }) =>
              args.to.toLowerCase() === client.account.address.toLowerCase() &&
              args.amount === amount,
          )
        )
          throw new Error('The receipt does not confirm delivery to the test account.')
        setAllowed(true)
      }
    })
  const claim = () =>
    run('claim', async () => {
      if (!blockedReceipt) throw new Error('Send a blocked payment first.')
      const client = getClient()
      await confirm('claim', () =>
        client.receivePolicy.claim({ to: client.account.address, receipt: blockedReceipt }),
      )
      const remaining = await client.receivePolicy.getBlockedBalance({ receipt: blockedReceipt })
      if (remaining !== 0n)
        throw new Error(
          'The blocked receipt still has a balance. Check the transaction before retrying.',
        )
      setClaimed(true)
    })
  const stepError = (task: Task) => (error?.task === task ? new Error(error.message) : undefined)
  const actionLabel = (task: Task, label: string) =>
    busy === task
      ? 'Confirming…'
      : hashes[task] && error?.task === task
        ? 'Check transaction'
        : label

  return (
    <div className="space-y-5" data-testid="receive-policy-demo">
      <p className="text-[13px] text-gray9">
        Moderato testnet · temporary account · 1 token per payment. Both payments go to this
        account; AlphaUSD stays available, while BetaUSD moves into the guard until recovered.
        Reloading discards this test account's signing key.
      </p>
      <Step
        number={1}
        title="Create and fund a test account"
        active={!funded}
        completed={funded}
        error={stepError('fund')}
        actions={
          <Button
            type="button"
            variant="accent"
            disabled={!hydrated || !!busy || funded}
            onClick={fund}
          >
            {busy === 'fund' ? 'Funding…' : 'Create test account'}
          </Button>
        }
      >
        {address && (
          <ExplorerAccountLink
            address={address}
            label={`${address.slice(0, 8)}…${address.slice(-6)}`}
          />
        )}
      </Step>
      <Step
        number={2}
        title="Accept only AlphaUSD"
        active={funded && !configured}
        completed={configured}
        error={stepError('configure')}
        actions={
          <Button
            type="button"
            variant="accent"
            disabled={!!busy || !funded || configured}
            onClick={configure}
          >
            {actionLabel('configure', 'Set policy')}
          </Button>
        }
      >
        <p className="mt-2 text-[13px] text-gray9">
          Any sender may pay. The receiving account controls recovery.
        </p>
        {hashes.configure && <ExplorerLink hash={hashes.configure} />}
      </Step>
      <Step
        number={3}
        title="Compare an accepted and a held payment"
        active={configured && !(allowed && blockedReceipt)}
        completed={allowed && !!blockedReceipt}
      >
        <div className="mt-3 flex flex-wrap gap-4">
          <div>
            <Button
              type="button"
              variant="default"
              disabled={!!busy || !configured || allowed}
              onClick={() => send(false)}
            >
              {actionLabel('allowed', 'Send 1 AlphaUSD')}
            </Button>
            {allowed && (
              <p role="status" className="mt-2 text-[13px]">
                AlphaUSD delivered to the test account.
              </p>
            )}
            {hashes.allowed && <ExplorerLink hash={hashes.allowed} />}
          </div>
          <div>
            <Button
              type="button"
              variant="default"
              disabled={!!busy || !configured || !!blockedReceipt}
              onClick={() => send(true)}
            >
              {actionLabel('blocked', 'Send 1 BetaUSD')}
            </Button>
            {blockedReceipt && (
              <p role="status" className="mt-2 text-[13px]">
                Transaction succeeded. 1 BetaUSD held by ReceivePolicyGuard
                {claimed ? ' — now recovered' : ''}.
              </p>
            )}
            {hashes.blocked && <ExplorerLink hash={hashes.blocked} />}
          </div>
        </div>
        {(error?.task === 'allowed' || error?.task === 'blocked') && (
          <p role="alert" className="mt-2 text-[13px] text-destructive">
            {error.message}
          </p>
        )}
      </Step>
      <Step
        number={4}
        title="Recover the held BetaUSD"
        active={!!blockedReceipt && !claimed}
        completed={claimed}
        error={stepError('claim')}
        actions={
          <Button
            type="button"
            variant="accent"
            disabled={!!busy || !blockedReceipt || claimed}
            onClick={claim}
          >
            {actionLabel('claim', 'Recover 1 BetaUSD')}
          </Button>
        }
      >
        {claimed && (
          <p role="status" className="mt-2 text-[13px]">
            1 BetaUSD returned to the test account. The blocked receipt is consumed.
          </p>
        )}
        {hashes.claim && <ExplorerLink hash={hashes.claim} />}
        {blockedReceipt && (
          <details className="mt-2 text-[13px]">
            <summary>Blocked receipt</summary>
            <code className="block break-all">{blockedReceipt}</code>
          </details>
        )}
      </Step>
      {balanceError && (
        <p role="status" className="text-[13px] text-gray9">
          Balance refresh unavailable. Use the transaction links to check the result.
        </p>
      )}
      {balances && (
        <p className="text-[13px] text-gray9" aria-live="polite">
          Available: {formatUnits(balances.alpha, 6)} AlphaUSD · {formatUnits(balances.beta, 6)}{' '}
          BetaUSD
        </p>
      )}
    </div>
  )
}
