'use client'

import * as React from 'react'
import type { Hex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import LucideAppWindow from '~icons/lucide/app-window'
import LucideBot from '~icons/lucide/bot'
import LucideCheck from '~icons/lucide/check'
import LucideChevronRight from '~icons/lucide/chevron-right'
import LucideCircleCheck from '~icons/lucide/circle-check'
import LucideCircleX from '~icons/lucide/circle-x'
import LucideCopy from '~icons/lucide/copy'
import LucideFingerprint from '~icons/lucide/fingerprint'
import LucideKeyRound from '~icons/lucide/key-round'
import LucideLaptop from '~icons/lucide/laptop'
import LucideLifeBuoy from '~icons/lucide/life-buoy'
import LucideMinus from '~icons/lucide/minus'
import LucidePlus from '~icons/lucide/plus'
import LucideServer from '~icons/lucide/server'
import LucideSmartphone from '~icons/lucide/smartphone'
import LucideUsb from '~icons/lucide/usb'
import LucideUsers from '~icons/lucide/users'
import { Container } from '../Container'
import { accountSandbox, accountSandboxLimitFill } from './AccountSandbox.styles'
import {
  type AccessKey,
  type AccessKeyKind,
  type AccessKeyTemplateId,
  type AccountHealth,
  type ActionRequest,
  type ActionResult,
  accessKeyDetail,
  accessKeyTemplateName,
  accessKeyTemplateOptions,
  addAccessKey,
  addSigner,
  analyzeAccount,
  configuredSigners,
  createLegacyAccount,
  evaluateAction,
  formatBalance,
  formatUsd,
  guidedActions,
  isCreated,
  type LogEntry,
  loadPreset,
  type Notice,
  remainingLimit,
  removeSigner,
  requiredWeight,
  revokeAccessKey,
  runGuidedAction,
  type SandboxAccount,
  type Signer,
  type SignerKind,
  sandboxLimits,
  schemeLabels,
  setSignerWeight,
  setThreshold,
  shortAddress,
  shortHash,
  signerKinds,
  signerStatus,
} from './account-sandbox'
import type { DevnetAdapter, DevnetCallOptions } from './account-sandbox-devnet'
import { type AccountDiff, diffAccounts } from './account-sandbox-diff'
import { thisDevice, thisDevicePasskey } from './this-device'

const signerIcons: Record<SignerKind, typeof LucideFingerprint> = {
  'private-key': LucideKeyRound,
  passkey: LucideFingerprint,
  device: LucideSmartphone,
  hardware: LucideUsb,
  'wallet-provider': LucideKeyRound,
  'recovery-provider': LucideLifeBuoy,
}

const keyIcons: Record<AccessKeyKind, typeof LucideFingerprint> = {
  'private-key': LucideKeyRound,
  device: LucideFingerprint,
  phone: LucideSmartphone,
  laptop: LucideLaptop,
  browser: LucideAppWindow,
  agent: LucideBot,
  service: LucideServer,
  account: LucideUsers,
}

const paymentAmount = 50

/** Just over a key's remaining limit, rounded up to the next $100, so devnet rejects it. */
function overLimitAmount(key: AccessKey) {
  return Math.floor(remainingLimit(key) / 100) * 100 + 100
}

type Tab = 'pay' | 'signers' | 'keys'
type Payer = { type: 'signers'; ids: string[] } | { type: 'key'; id: string; members: string[] }

export type AccountSandboxProps = {
  variant?: 'full' | 'compact'
  /** Defaults to on for the full variant and off for the compact variant. */
  showLog?: boolean
}

/**
 * Create the reader's account on the Tempo Accounts devnet: it starts with no signers, and the first one the
 * reader adds creates it. Every signer, key, and payment is real there; nothing is simulated.
 */
export function AccountSandbox(props: AccountSandboxProps) {
  const { variant = 'full', showLog = variant === 'full' } = props
  const network = useNetwork()
  // It sits under the page's own title, and its address line names the network.
  return (
    <Container>
      {network.ready ? (
        <Playground network={network} showLog={showLog} variant={variant} />
      ) : (
        <div {...accountSandbox({ className: 'account-sandbox' })} data-variant={variant}>
          <p className="as-gate" role="status">
            {network.checking
              ? 'Connecting to the Tempo Accounts devnet…'
              : 'Creating an account here needs the Tempo Accounts devnet, which this page can’t reach.'}
          </p>
        </div>
      )}
    </Container>
  )
}

// ---------------------------------------------------------------------------
// Network

type DevnetModule = typeof import('./account-sandbox-devnet')
let devnetModule: Promise<DevnetModule> | undefined

/** Loaded only on `http:` pages, so the viem preview stays out of production pages. */
function loadDevnet() {
  devnetModule ??= import('./account-sandbox-devnet')
  return devnetModule
}

type Network = ReturnType<typeof useNetwork>

/**
 * Tempo Accounts devnet, once this page can reach it. Each account is created on devnet with its first
 * signer, then reused by every instance on the page that shows it.
 */
function useNetwork() {
  const [devnet, setDevnet] = React.useState<{
    adapter: DevnetAdapter
    module: DevnetModule
  } | null>(null)
  const [checking, setChecking] = React.useState(true)
  const [status, setStatus] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    loadDevnet()
      .then(async (module) => {
        if (!(await module.probeDevnet())) return
        if (active) setDevnet({ adapter: module.getDevnetAdapter(), module })
      })
      .catch(() => undefined)
      .finally(() => active && setChecking(false))
    return () => {
      active = false
    }
  }, [])

  /** Show `label` while `run` works, and passkey prompts while they're open. */
  async function track<T>(
    live: NonNullable<typeof devnet>,
    label: string,
    run: (options: DevnetCallOptions) => Promise<T>,
  ) {
    setStatus(label)
    try {
      return await run({
        onPrompt: (prompt) => setStatus(prompt ? live.module.devnetPromptLabels[prompt] : label),
      })
    } finally {
      setStatus(null)
    }
  }

  async function prepare(live: NonNullable<typeof devnet>, account: SandboxAccount) {
    if (account.devnet) return account
    return track(live, 'Creating account on devnet…', (options) =>
      live.adapter.prepare(account, options),
    )
  }

  function failure(live: NonNullable<typeof devnet>, error: unknown) {
    return error instanceof live.module.DevnetRejection ? error.message : 'Devnet unreachable.'
  }

  return {
    ready: Boolean(devnet),
    checking,
    status,
    /**
     * Apply an edit on devnet. The first signer creates the account there; later edits send their
     * updates.
     */
    async commit(previous: SandboxAccount, next: SandboxAccount) {
      if (!devnet)
        return { before: previous, after: { ...previous, notice: 'Devnet unreachable.' } }
      const live = devnet
      try {
        if (!isCreated(previous)) {
          const after = await track(live, 'Creating account on devnet…', (options) =>
            live.adapter.prepare(next, options),
          )
          return { before: previous, after }
        }
        const before = await prepare(live, previous)
        const draft = before === previous ? next : live.module.rebaseOnto(previous, next, before)
        const { account } = await track(live, 'Updating devnet…', (options) =>
          live.adapter.sync(before, draft, options),
        )
        return { before, after: account }
      } catch (error) {
        return { before: previous, after: { ...previous, notice: failure(live, error) } }
      }
    },
    /** Get test funds from the devnet faucet. Creates the account on devnet first if needed. */
    async fund(account: SandboxAccount) {
      if (!devnet) return { before: account, after: { ...account, notice: 'Devnet unreachable.' } }
      const live = devnet
      const { account: after, hash } = await track(live, 'Getting test funds…', (options) =>
        live.adapter.fund(account, options),
      )
      return { before: account, after, hash }
    },
    /** Upgrade a plain key account in place, at the same address. */
    async upgrade(account: SandboxAccount) {
      if (!devnet) return { before: account, after: { ...account, notice: 'Devnet unreachable.' } }
      const live = devnet
      const { account: after, hash } = await track(live, 'Upgrading on devnet…', (options) =>
        live.adapter.upgrade(account, options),
      )
      return { before: account, after, hash }
    },
    async submit(account: SandboxAccount, request: ActionRequest) {
      if (!devnet) {
        const result: ActionResult = {
          ok: false,
          code: 'network-error',
          message: 'Devnet unreachable.',
        }
        return { before: account, account, result }
      }
      const live = devnet
      try {
        const before = await prepare(live, account)
        const outcome = await track(live, 'Sending on devnet…', (options) =>
          live.adapter.submit(before, request, options),
        )
        return { before, ...outcome }
      } catch (error) {
        const result: ActionResult = {
          ok: false,
          code: 'network-error',
          message: failure(live, error),
        }
        return { before: account, account, result }
      }
    },
  }
}

/** The network after the address, or what devnet is doing right now. */
function networkBadge(network: Network, account: SandboxAccount) {
  if (network.status) return network.status
  return account.devnet ? 'devnet' : undefined
}

/** On devnet, keys described as hardware or held by a provider are keys in this browser. */
const browserKeyKinds = new Set<SignerKind>(['hardware', 'wallet-provider', 'recovery-provider'])

/**
 * What a signer is on devnet. Example keys are keys in this browser and example passkeys are real
 * passkeys on this device, whatever the example calls them.
 */
function signerDetail(signer: Signer) {
  // A generated key shows the address it controls: the signer as the account records it.
  if (signer.kind === 'private-key' && signer.privateKey)
    return `secp256k1 · ${shortAddress(privateKeyToAddress(signer.privateKey as Hex))}`
  if (browserKeyKinds.has(signer.kind))
    return `${schemeLabels[signerKinds[signer.kind].scheme]} · this browser`
  if (signer.kind === 'passkey') return thisDevicePasskey().detail
  if (signer.kind === 'device') return 'P-256 · this browser'
  return signer.detail
}

type LedgerRow = { id: number; title: string; detail?: string | undefined; hash?: string }

/** `Device key (W1)` as `Device key · weight 1`. */
function plainWeights(text: string) {
  return text
    .replace(/ \(W(\d+)\)/g, ' · weight $1')
    .replace(/ W(\d+) → W(\d+)/g, ' · weight $1 → $2')
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** A config update's changes, named for the one kind of change it makes. */
function configRow(changes: string): Pick<LedgerRow, 'title' | 'detail'> {
  const added = /(^|, )added /i.test(changes)
  const revoked = /(^|, )revoked /i.test(changes)
  const threshold = /(^|, )threshold /i.test(changes)
  const weight = / W\d+ → W\d+/.test(changes)
  const kinds = [added, revoked, threshold, weight].filter(Boolean).length
  if (kinds === 1 && added)
    return { title: 'Signer added', detail: plainWeights(changes.replace(/^Added /, '')) }
  if (kinds === 1 && revoked)
    return { title: 'Signer removed', detail: plainWeights(changes.replace(/^Revoked /, '')) }
  if (kinds === 1 && threshold)
    return { title: 'Threshold changed', detail: changes.replace(/^Threshold /, '') }
  if (kinds === 1 && weight) return { title: 'Weight changed', detail: plainWeights(changes) }
  return { title: 'Signers changed', detail: plainWeights(changes) }
}

/**
 * History as a ledger: a short event name, a detail only when it adds something, and the hash.
 * The account's own creation steps before devnet (no signers yet, on devnet) aren't events.
 */
function ledgerRow(entry: LogEntry, account: SandboxAccount): LedgerRow | null {
  const base = { id: entry.id, ...(entry.hash ? { hash: entry.hash } : {}) }
  const { title, detail } = entry
  if (entry.kind === 'preset') return detail === 'No signers yet' ? null : { ...base, title }
  if (entry.kind === 'event') {
    if (title.startsWith('On devnet')) return null
    if (title.startsWith('Got test funds'))
      return { ...base, title: 'Funded', detail: title.split(' · ')[1] }
    return { ...base, title, detail }
  }
  if (entry.kind === 'config') {
    if (title.startsWith('Created account')) {
      const genesis = account.genesis?.owners[0]
      const signer = genesis && account.signers.find((item) => item.id === genesis.id)
      return { ...base, title: 'Account created', detail: signer?.name }
    }
    if (title.startsWith('Single-key account'))
      return { ...base, title: 'Account created', detail: 'Single key' }
    if (title.startsWith('Upgraded')) return { ...base, title: 'Upgraded', detail: 'Same address' }
    const update = /^Config v\d+ · (.+)$/.exec(title)
    if (update?.[1]) return { ...base, ...configRow(update[1]) }
    return { ...base, title, detail }
  }
  if (entry.kind === 'key') {
    const authorized = /^Authorized (.+)$/.exec(title)
    if (authorized) return { ...base, title: 'Access key authorized', detail: authorized[1] }
    const revoked = /^Revoked (.+)$/.exec(title)
    if (revoked) return { ...base, title: 'Access key revoked', detail: revoked[1] }
    return { ...base, title, detail }
  }
  if (entry.kind === 'payment') {
    const [sent, key] = title.split(' · ')
    const by = detail?.replace(/^By (the )?/, '')
    return { ...base, title: sent ?? title, detail: key ?? (by && capitalize(by)) }
  }
  return { ...base, title }
}

/** A transaction hash with a copy button. This devnet has no public explorer. */
export function TxHash({ hash }: { hash: string }) {
  return (
    <span className="as-tx">
      <code title={hash}>{shortHash(hash)}</code>
      <CopyButton value={hash} label="Copy transaction hash" />
    </span>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1_200)
  }
  return (
    <button type="button" aria-label={label} onClick={copy}>
      {copied ? <LucideCheck aria-hidden="true" /> : <LucideCopy aria-hidden="true" />}
    </button>
  )
}

/** A generated private key, shown once in a read-only field. */
function SecretField({ label, value }: { label: string; value: string }) {
  return (
    <div className="as-secret">
      <span className="as-field-label">{label}</span>
      <span className="as-tx">
        <input
          readOnly
          value={value}
          aria-label={label}
          spellCheck={false}
          onFocus={(event) => event.currentTarget.select()}
        />
        <CopyButton value={value} label="Copy private key" />
      </span>
    </div>
  )
}

let platformAuthenticator: Promise<boolean> | undefined

/** Whether this browser has a user-verifying platform authenticator, such as Touch ID. */
function hasPlatformAuthenticator() {
  platformAuthenticator ??= (async () => {
    if (!globalThis.isSecureContext || !globalThis.PublicKeyCredential) return false
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch {
      return false
    }
  })()
  return platformAuthenticator
}

function usePlatformAuthenticator() {
  const [available, setAvailable] = React.useState(false)
  React.useEffect(() => {
    let active = true
    void hasPlatformAuthenticator().then((value) => active && setAvailable(value))
    return () => {
      active = false
    }
  }, [])
  return available
}

type SignerChoice = {
  kind: SignerKind
  label: string
  reason: string | null
  description?: string
  /** A plain private-key account the reader already has, which upgrades in place later. */
  legacy?: boolean
}

/**
 * Signers the reader can add to their own account: a passkey on this device, a device key in this
 * browser, and a generated private key. The passkey comes first when this browser can make one; it
 * is the only choice that prompts, for Touch ID or similar.
 */
function signerChoices(platform: boolean, options: { first?: boolean } = {}): SignerChoice[] {
  const { unlock } = thisDevice()
  const choices: SignerChoice[] = [
    {
      kind: 'passkey',
      label: `Passkey (${unlock})`,
      reason: platform ? null : 'No Touch ID or platform authenticator in this browser',
    },
    { kind: 'device', label: 'Device key', reason: null },
    { kind: 'private-key', label: 'Private key', reason: null },
  ]
  if (options.first)
    choices.push({
      kind: 'private-key',
      label: 'Start from a single-key account',
      description: 'An EOA you already have. Upgrade it later, at the same address.',
      reason: null,
      legacy: true,
    })
  return choices
}

/**
 * Real signer options, for the first signer and for a backup. The first available choice is the
 * recommended one; starting from a single-key account is a different path, so it reads as a link.
 */
function SignerChooser(props: {
  label: string
  choices: SignerChoice[]
  onChoose: (choice: SignerChoice) => void
}) {
  const signers = props.choices.filter((choice) => !choice.legacy)
  const legacy = props.choices.find((choice) => choice.legacy)
  const primary = signers.find((choice) => !choice.reason)
  return (
    <Field label={props.label}>
      <div className="as-choices">
        {signers.map((choice) => (
          <button
            key={choice.kind}
            type="button"
            className={choice === primary ? 'as-button as-button-primary' : 'as-button'}
            disabled={Boolean(choice.reason)}
            title={choice.reason ?? choice.description}
            onClick={() => props.onChoose(choice)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {legacy && (
        <button
          type="button"
          className="as-link as-legacy"
          title={legacy.description}
          onClick={() => props.onChoose(legacy)}
        >
          {legacy.label}
        </button>
      )}
    </Field>
  )
}

/** The reader's account: its state, then what they can do to it. It starts with no signers. */
function Playground(props: { network: Network; showLog: boolean; variant: 'full' | 'compact' }) {
  const { network, showLog, variant } = props
  const [account, setAccount] = React.useState(() => loadPreset('from-scratch'))
  // After the first signer, "Add a backup signer" is the next step.
  const [tab, setTab] = React.useState<Tab>('signers')
  const [before, setBefore] = React.useState<SandboxAccount | null>(null)
  const health = React.useMemo(() => analyzeAccount(account), [account])
  const diff = before ? diffAccounts(before, account) : undefined
  const ledger = account.log.flatMap((entry) => ledgerRow(entry, account) ?? [])
  const created = isCreated(account)
  const platform = usePlatformAuthenticator()
  const choices = signerChoices(platform)
  /** A generated private-key signer, shown once. */
  const [secret, setSecret] = React.useState<{ id: string; value: string } | null>(null)
  const shownSecret =
    secret && configuredSigners(account).some((signer) => signer.id === secret.id)
      ? secret.value
      : null
  /** Transactions need fees, so a created account needs test funds before it can act. */
  const funded = Boolean(account.devnet) && account.balance > 0
  /** An account created from scratch with one signer offers a backup from its warning. */
  const backup =
    funded &&
    !account.legacy &&
    account.presetId === 'from-scratch' &&
    configuredSigners(account).length === 1
  /** A plain key account pays only; signers and keys wait for its upgrade. */
  const shownTab: Tab = account.legacy ? 'pay' : tab
  const [choosingBackup, setChoosingBackup] = React.useState(false)

  function change(next: SandboxAccount) {
    setSecret(null)
    setChoosingBackup(false)
    void network.commit(account, next).then(({ before, after }) => {
      setBefore(before)
      setAccount(after)
    })
  }

  function addSignerOf(kind: SignerKind) {
    if (kind === 'private-key') {
      void addPrivateKeySigner()
      return
    }
    change(addSigner(account, kind))
  }

  /** A single-key account (an EOA), generated in this click: the key's own address, shown once. */
  async function addLegacyAccount() {
    const { generatePrivateKey, privateKeyToAddress } = await import('viem/accounts')
    const privateKey = generatePrivateKey()
    const next = createLegacyAccount(account, {
      privateKey,
      address: privateKeyToAddress(privateKey),
    })
    const [key] = next.signers
    change(next)
    if (key?.privateKey === privateKey) setSecret({ id: key.id, value: privateKey })
    setTab('pay')
  }

  async function upgrade() {
    const { before, after } = await network.upgrade(account)
    setBefore(before)
    setAccount(after)
    // Next: a backup signer, now that the account takes signers.
    if (!after.legacy) setTab('signers')
  }

  /** A private-key signer is generated in this click and shown once. */
  async function addPrivateKeySigner() {
    const { generatePrivateKey } = await import('viem/accounts')
    const privateKey = generatePrivateKey()
    const next = addSigner(account, 'private-key', { privateKey })
    const added = next.signers.at(-1)
    change(next)
    if (added?.privateKey === privateKey) setSecret({ id: added.id, value: privateKey })
  }

  async function fund() {
    const { before, after } = await network.fund(account)
    setBefore(before)
    setAccount(after)
  }

  async function submit(request: ActionRequest) {
    const outcome = await network.submit(account, request)
    setBefore(outcome.before)
    setAccount(outcome.account)
    return outcome.result
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pay', label: 'Send a payment' },
    { id: 'signers', label: 'Change signers' },
    { id: 'keys', label: 'Access keys' },
  ]

  return (
    <div
      {...accountSandbox({ className: 'account-sandbox' })}
      data-variant={variant}
      aria-busy={Boolean(network.status)}
    >
      <fieldset className="as-lock" disabled={Boolean(network.status)}>
        <legend className="as-hidden">Your account</legend>

        <AccountState
          account={account}
          health={health}
          diff={diff}
          badge={networkBadge(network, account)}
          terse
          onAddBackup={
            backup
              ? () => {
                  setTab('signers')
                  setChoosingBackup(true)
                }
              : undefined
          }
        />

        <section className="as-panel" aria-label="Try it">
          {shownSecret && <SecretField label="Test key · shown once" value={shownSecret} />}
          {created && !funded && (
            <div className="as-fund">
              <button type="button" className="as-button as-button-primary" onClick={fund}>
                Get test funds
              </button>
            </div>
          )}
          {!created ? (
            <SignerChooser
              label="First signer"
              choices={signerChoices(platform, { first: true })}
              onChoose={(choice) =>
                choice.legacy ? void addLegacyAccount() : addSignerOf(choice.kind)
              }
            />
          ) : (
            <fieldset className="as-lock" disabled={!funded}>
              <legend className="as-hidden">Actions</legend>
              {account.legacy ? (
                <div className="as-upgrade">
                  <button type="button" className="as-button as-button-primary" onClick={upgrade}>
                    Upgrade to a configurable account
                  </button>
                  <span className="as-note">Same address</span>
                </div>
              ) : (
                <>
                  <div className="as-tabs">
                    <fieldset>
                      <legend className="as-hidden">Action</legend>
                      {tabs.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={shownTab === item.id}
                          onClick={() => setTab(item.id)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </fieldset>
                  </div>
                  {shownTab === 'pay' && (
                    <PayPanel key={account.presetId} account={account} onSubmit={submit} />
                  )}
                  {shownTab === 'signers' && (
                    <SignersPanel
                      account={account}
                      choices={choices}
                      choosingBackup={backup && choosingBackup}
                      onCancelBackup={() => setChoosingBackup(false)}
                      onAdd={addSignerOf}
                      onChange={change}
                    />
                  )}
                  {shownTab === 'keys' && <KeysPanel account={account} onChange={change} />}
                </>
              )}
            </fieldset>
          )}
        </section>

        {showLog && ledger.length > 0 && (
          <details className="as-history">
            <summary>
              <LucideChevronRight aria-hidden="true" className="as-history-chevron" />
              <span>History</span>
              <span className="as-history-count">{ledger.length}</span>
            </summary>
            <ol className="as-ledger">
              {ledger.map((row) => (
                <li key={row.id}>
                  <span className="as-ledger-text">
                    <span className="as-ledger-title">{row.title}</span>
                    {row.detail && <span className="as-ledger-detail">{row.detail}</span>}
                  </span>
                  {row.hash && <TxHash hash={row.hash} />}
                </li>
              ))}
            </ol>
          </details>
        )}
      </fieldset>
    </div>
  )
}

/** Read-only: what the account looks like now, with changes emphasized. */
export function AccountState(props: {
  account: SandboxAccount
  health: AccountHealth
  diff?: AccountDiff | undefined
  /** Shown after the address, such as `devnet`. */
  badge?: string | undefined
  /** Notices as short labels, such as `No backup signer`. Errors stay whole. */
  terse?: boolean | undefined
  /** Offered after the no-backup notice. */
  onAddBackup?: (() => void) | undefined
}) {
  const { account, health, diff, badge, terse, onAddBackup } = props
  const signers = account.signers.filter(
    (signer) => !signer.revoked || diff?.signers[signer.id]?.change === 'removed',
  )
  const keys = account.accessKeys.filter((key) => key.status !== 'revoked' || diff?.keys[key.id])
  const created = isCreated(account)
  return (
    <section className="as-state" aria-label="Account state">
      <header className="as-state-head">
        <div className="as-state-name">
          <span>{account.name}</span>
          {(account.address || badge || account.legacy) && (
            <span className="as-address">
              {account.address && <code>{shortAddress(account.address)}</code>}
              {badge && (
                <span className="as-badge" data-network={account.devnet ? 'devnet' : undefined}>
                  {badge}
                </span>
              )}
              {account.legacy && <span className="as-badge">single key</span>}
            </span>
          )}
        </div>
        <span className="as-balance" data-changed={Boolean(diff?.balance)}>
          {formatBalance(account.balance)}
        </span>
      </header>

      <div className="as-state-columns">
        <div>
          <span className="as-label">
            Signers
            {created && !account.legacy && (
              <span data-changed={Boolean(diff?.threshold)}> · threshold {account.threshold}</span>
            )}
          </span>
          {signers.length > 0 ? (
            <ul className="as-state-list">
              {signers.map((signer) => (
                <StateSigner
                  key={signer.id}
                  account={account}
                  signer={signer}
                  change={diff?.signers[signer.id]}
                />
              ))}
            </ul>
          ) : (
            <p className="as-slot">No signers</p>
          )}
        </div>
        <div>
          <span className="as-label">Access keys</span>
          {keys.length > 0 ? (
            <ul className="as-state-list">
              {keys.map((key) => (
                <StateKey key={key.id} accessKey={key} change={diff?.keys[key.id]} />
              ))}
            </ul>
          ) : (
            <p className="as-slot">No access keys</p>
          )}
        </div>
      </div>

      {/* Before the first signer, the empty slots say what to do; blocked actions still show. */}
      <Notices
        notices={created ? health.notices : []}
        blocked={account.notice}
        terse={terse}
        onAddBackup={onAddBackup}
      />
    </section>
  )
}

function StateSigner(props: {
  account: SandboxAccount
  signer: Signer
  change: AccountDiff['signers'][string] | undefined
}) {
  const { account, signer, change } = props
  const status = signerStatus(account, signer)
  const Icon = signerIcons[signer.kind]
  // A new signer gets a stronger border, not a badge.
  const tag = change?.change === 'removed' ? 'Removed' : status === 'lost' ? 'Lost' : null
  return (
    <li className="as-item" data-status={status} data-change={change?.change}>
      <span className="as-icon" data-kind={signer.kind} aria-hidden="true">
        <Icon />
      </span>
      <span className="as-item-text">
        <span className="as-item-name">
          {signer.name}
          {tag && <span className="as-tag">{tag}</span>}
        </span>
        <span className="as-item-detail">{signerDetail(signer)}</span>
      </span>
      <span className="as-weight" data-changed={change?.change === 'weight'}>
        {change?.change === 'weight'
          ? `weight ${change.from} → ${signer.weight}`
          : `weight ${signer.weight}`}
      </span>
    </li>
  )
}

function StateKey(props: {
  accessKey: AccessKey
  change: AccountDiff['keys'][string] | undefined
}) {
  const { accessKey: key, change } = props
  const status = key.status
  const Icon = keyIcons[key.kind]
  const left = remainingLimit(key)
  const tag = status === 'revoked' ? 'Revoked' : status === 'expired' ? 'Expired' : null
  return (
    <li className="as-item" data-status={status} data-change={change?.change}>
      <span className="as-icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="as-item-text">
        <span className="as-item-name">
          {key.name}
          {tag && <span className="as-tag">{tag}</span>}
        </span>
        <span className="as-item-detail">{keyDetail(key)}</span>
        <span className="as-limit" data-changed={change?.change === 'spent'}>
          <span className="as-limit-bar" aria-hidden="true">
            <span
              {...accountSandboxLimitFill({ width: `${Math.round((left / key.limit) * 100)}%` })}
            />
          </span>
          <span>
            ${formatUsd(left)} left this {key.period}
          </span>
        </span>
      </span>
    </li>
  )
}

/** Pick an amount and who approves; the result updates as you choose. */
function PayPanel(props: {
  account: SandboxAccount
  onSubmit: (request: ActionRequest) => Promise<ActionResult>
}) {
  const { account, onSubmit } = props
  const [chosenAmount, setAmount] = React.useState<number>(paymentAmount)
  const [payer, setPayer] = React.useState<Payer>({ type: 'signers', ids: [] })
  const [sent, setSent] = React.useState<{ result: ActionResult; amount: number } | null>(null)
  const [busy, setBusy] = React.useState(false)
  const owners = configuredSigners(account).filter((signer) => !signer.lost)
  const keys = account.accessKeys.filter((key) => key.status !== 'revoked')
  const payingKey = payer.type === 'key' ? keys.find((key) => key.id === payer.id) : undefined
  // Signers pay $50. A key also offers an amount over its remaining limit, which devnet rejects.
  const amounts = payingKey ? [paymentAmount, overLimitAmount(payingKey)] : [paymentAmount]
  const amount = amounts.includes(chosenAmount) ? chosenAmount : paymentAmount
  const action = { type: 'payment' as const, amount }
  const required = requiredWeight(account)
  const request: ActionRequest | null =
    payer.type === 'signers'
      ? payer.ids.length > 0
        ? { action, approver: { type: 'signers', signerIds: payer.ids } }
        : null
      : {
          action,
          approver: { type: 'access-key', keyId: payer.id, memberIds: payer.members },
          recipient: 'approved',
        }
  const result = request ? evaluateAction(account, request) : null
  const weight = owners
    .filter((signer) => payer.type === 'signers' && payer.ids.includes(signer.id))
    .reduce((sum, signer) => sum + signer.weight, 0)

  function choose(next: Payer) {
    setPayer(next)
    setSent(null)
  }

  async function send() {
    if (!request) return
    setBusy(true)
    try {
      const result = await onSubmit(request)
      setSent({ result, amount })
      if (result.ok && payer.type === 'signers') setPayer({ type: 'signers', ids: [] })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="as-panel-body">
      <Field label="Amount">
        {amounts.length > 1 ? (
          <Segmented
            options={amounts.map((value) => ({ value, label: `$${formatUsd(value)}` }))}
            value={amount}
            onChange={(value) => {
              setAmount(value)
              setSent(null)
            }}
          />
        ) : (
          <span className="as-amount">${formatUsd(amount)}</span>
        )}
      </Field>

      <Field label="Approved by">
        <div className="as-choices">
          {owners.map((signer) => {
            const on = payer.type === 'signers' && payer.ids.includes(signer.id)
            return (
              <button
                key={signer.id}
                type="button"
                className="as-choice"
                aria-pressed={on}
                onClick={() =>
                  choose({
                    type: 'signers',
                    ids:
                      payer.type === 'signers'
                        ? on
                          ? payer.ids.filter((id) => id !== signer.id)
                          : [...payer.ids, signer.id]
                        : [signer.id],
                  })
                }
              >
                {signer.name}
                <span className="as-weight">weight {signer.weight}</span>
              </button>
            )
          })}
          {keys.length > 0 && <span className="as-or">or a key</span>}
          {keys.map((key) => (
            <button
              key={key.id}
              type="button"
              className="as-choice"
              aria-pressed={payer.type === 'key' && payer.id === key.id}
              onClick={() => choose({ type: 'key', id: key.id, members: [] })}
            >
              <LucideKeyRound aria-hidden="true" />
              {key.name}
            </button>
          ))}
        </div>
      </Field>

      {payingKey?.delegate && payer.type === 'key' && (
        <Field
          label={`Team approves (${payingKey.delegate.threshold} of ${payingKey.delegate.members.length})`}
        >
          <div className="as-choices">
            {payingKey.delegate.members.map((member) => {
              const on = payer.members.includes(member.id)
              return (
                <button
                  key={member.id}
                  type="button"
                  className="as-choice"
                  aria-pressed={on}
                  onClick={() =>
                    choose({
                      ...payer,
                      members: on
                        ? payer.members.filter((id) => id !== member.id)
                        : [...payer.members, member.id],
                    })
                  }
                >
                  {member.name}
                </button>
              )
            })}
          </div>
        </Field>
      )}

      {sent?.result.ok ? (
        <div className="as-success" role="status">
          <LucideCircleCheck aria-hidden="true" />
          <div className="as-success-text">
            <strong>Sent ${formatUsd(sent.amount)}</strong>
            <span>{sent.result.message}</span>
          </div>
          <button type="button" className="as-button" onClick={() => setSent(null)}>
            Send another
          </button>
        </div>
      ) : (
        <div className="as-outcome" aria-live="polite">
          {payer.type === 'signers' && (
            <Meter value={weight} target={required} ok={Boolean(result?.ok)} />
          )}
          <Outcome result={sent?.result ?? result} />
          <button
            type="button"
            className="as-button as-button-primary"
            disabled={!result?.ok || busy}
            onClick={send}
          >
            {busy ? 'Sending…' : `Send $${formatUsd(amount)}`}
          </button>
        </div>
      )}
    </div>
  )
}

function SignersPanel(props: {
  account: SandboxAccount
  /** Signers devnet can back, with why any of them can't be added now. */
  choices: SignerChoice[]
  /** Opened from the no-backup warning. */
  choosingBackup: boolean
  onCancelBackup: () => void
  onAdd: (kind: SignerKind) => void
  onChange: (account: SandboxAccount) => void
}) {
  const { account, choices, choosingBackup, onCancelBackup, onAdd, onChange } = props
  const owners = configuredSigners(account)
  // An example's own step, each a real update. Adding a backup is the same as Add signer, and
  // losing a passkey sends nothing, so neither is offered here.
  const steps = guidedActions(account).filter(
    (item) => item.id !== 'add-backup' && item.id !== 'lose-passkey',
  )
  return (
    <div className="as-panel-body">
      {choosingBackup && (
        <div className="as-backup">
          <SignerChooser
            label="Backup signer"
            choices={choices}
            onChoose={(choice) => onAdd(choice.kind)}
          />
          <button type="button" className="as-link" onClick={onCancelBackup}>
            Cancel
          </button>
        </div>
      )}
      {steps.length > 0 && (
        <Field label="Example">
          <div className="as-choices">
            {steps.map((item) => (
              <button
                key={item.id}
                type="button"
                className="as-button"
                onClick={() => onChange(runGuidedAction(account, item.id))}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Threshold">
        <Stepper
          label="threshold"
          value={account.threshold}
          min={1}
          max={sandboxLimits.maxThreshold}
          onChange={(value) => onChange(setThreshold(account, value))}
        />
      </Field>

      <ul className="as-edit-list">
        {owners.map((signer) => (
          <li key={signer.id}>
            <span className="as-edit-name">{signer.name}</span>
            <Stepper
              label={`${signer.name} weight`}
              prefix="weight "
              value={signer.weight}
              min={1}
              max={sandboxLimits.maxWeight}
              onChange={(value) => onChange(setSignerWeight(account, signer.id, value))}
            />
            <button
              type="button"
              className="as-link"
              onClick={() => onChange(removeSigner(account, signer.id))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <AddSelect
        label="Add signer"
        disabled={owners.length >= sandboxLimits.maxSandboxOwners}
        groups={[
          {
            label: 'Signers',
            options: choices.map((choice) => ({
              value: choice.kind,
              label: choice.reason ? `${choice.label} (unavailable)` : choice.label,
              disabled: Boolean(choice.reason),
            })),
          },
        ]}
        onSelect={(kind) => onAdd(kind as SignerKind)}
      />
    </div>
  )
}

/** On devnet, keys the reader adds say how they sign. */
function keyDetail(key: AccessKey) {
  if (key.kind === 'private-key') return 'secp256k1 · test key'
  if (key.kind === 'browser') return 'WebCrypto · this browser'
  if (key.kind === 'device') {
    const { name, unlock } = thisDevice()
    return `${unlock} · this ${name}`
  }
  return accessKeyDetail(key)
}

function KeysPanel(props: {
  account: SandboxAccount
  onChange: (account: SandboxAccount) => void
}) {
  const { account, onChange } = props
  const keys = account.accessKeys.filter((key) => key.status !== 'revoked')
  const [revealed, setRevealed] = React.useState<{ id: string; privateKey: string } | null>(null)
  // Shown once: only while the key it belongs to is on the account and this panel is open.
  const secret = revealed && keys.some((key) => key.id === revealed.id) ? revealed.privateKey : null

  async function add(template: AccessKeyTemplateId) {
    if (template !== 'private-key') {
      setRevealed(null)
      onChange(addAccessKey(account, template))
      return
    }
    const { generatePrivateKey } = await import('viem/accounts')
    const privateKey = generatePrivateKey()
    const next = addAccessKey(account, template, { privateKey })
    const added = next.accessKeys.at(-1)
    setRevealed(added?.privateKey === privateKey ? { id: added.id, privateKey } : null)
    onChange(next)
  }

  return (
    <div className="as-panel-body">
      {keys.length > 0 && (
        <ul className="as-edit-list">
          {keys.map((key) => (
            <li key={key.id}>
              <span className="as-edit-name">{key.name}</span>
              <button
                type="button"
                className="as-link"
                onClick={() => onChange(revokeAccessKey(account, key.id))}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
      {secret && <SecretField label="Test key · shown once" value={secret} />}
      <AddSelect
        label="Add access key"
        groups={[
          {
            label: 'Keys',
            // Keys that sign without a prompt: not the passkey template (`device`).
            options: accessKeyTemplateOptions
              .filter((id) => id !== 'device')
              .map((id) => ({ value: id, label: accessKeyTemplateName(account, id) })),
          },
        ]}
        onSelect={(id) => void add(id as AccessKeyTemplateId)}
      />
    </div>
  )
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="as-field">
      <span className="as-field-label">{label}</span>
      <div className="as-field-control">{children}</div>
    </div>
  )
}

function Segmented<T extends string | number>(props: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <span className="as-segmented">
      {props.options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={props.value === option.value}
          onClick={() => props.onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </span>
  )
}

/** Whether the chosen approvers can send, and why not. The hash lives in History. */
function Outcome({ result }: { result: ActionResult | null }) {
  if (!result) return <span className="as-result" />
  return (
    <span className="as-result" data-ok={result.ok}>
      {!result.ok && <LucideCircleX aria-hidden="true" />}
      {result.message}
    </span>
  )
}

function Meter({ value, target, ok }: { value: number; target: number; ok: boolean }) {
  const segments = Math.min(target, 12)
  const filled = Math.min(segments, Math.round((Math.min(value, target) / target) * segments))
  return (
    <span className="as-meter" data-ok={ok}>
      <span className="as-meter-bar" aria-hidden="true">
        {Array.from({ length: segments }, (_, index) => (
          <span key={`segment-${index + 1}`} data-on={index < filled} />
        ))}
      </span>
      <span className="as-meter-label">
        {value} of {target}
      </span>
    </span>
  )
}

function Stepper(props: {
  label: string
  value: number
  min: number
  max: number
  prefix?: string
  onChange: (value: number) => void
}) {
  const { label, value, min, max, prefix = '', onChange } = props
  return (
    <span className="as-stepper">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <LucideMinus aria-hidden="true" />
      </button>
      <span className="as-stepper-value">
        {prefix}
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <LucidePlus aria-hidden="true" />
      </button>
    </span>
  )
}

function AddSelect(props: {
  label: string
  disabled?: boolean
  groups: { label: string; options: { value: string; label: string; disabled?: boolean }[] }[]
  onSelect: (value: string) => void
}) {
  return (
    <label className="as-add">
      <LucidePlus aria-hidden="true" />
      <span>{props.label}</span>
      <select
        value=""
        disabled={props.disabled}
        aria-label={props.label}
        onChange={(event) => {
          if (event.target.value) props.onSelect(event.target.value)
        }}
      >
        <option value="" disabled>
          {props.label}
        </option>
        {props.groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

/** `No backup signer: losing it locks the account.` as `No backup signer`. */
function noticeLabel(message: string) {
  return message.split(':')[0]?.replace(/\.$/, '') ?? message
}

/** Account notices as muted lines. Only errors, such as a blocked edit, take color. */
function Notices({
  notices,
  blocked,
  terse,
  onAddBackup,
}: {
  notices: Notice[]
  blocked: string | null
  terse?: boolean | undefined
  onAddBackup?: (() => void) | undefined
}) {
  const items = blocked
    ? [{ id: 'blocked', tone: 'error' as const, message: blocked }, ...notices]
    : notices
  if (items.length === 0) return null
  return (
    <ul className="as-notices">
      {items.map((notice) => (
        <li key={notice.id} data-tone={notice.tone}>
          {notice.tone === 'error' && <LucideCircleX aria-hidden="true" />}
          <span>
            {terse && notice.tone !== 'error' ? noticeLabel(notice.message) : notice.message}
          </span>
          {notice.id === 'no-backup' && onAddBackup && (
            <button type="button" className="as-link" onClick={onAddBackup}>
              Add a backup signer
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
