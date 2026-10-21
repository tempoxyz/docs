/**
 * Guide demos: one script per guide, run on the Tempo Accounts devnet with the reader's own signers. Each
 * step's title matches the guide's step heading. Steps that change the account send real devnet
 * transactions and return their hashes; the others do a real local action (create a key) or
 * read Tempo.
 *
 * No React and no network code here: steps act through `GuideContext`, which `GuideDemo` builds
 * from the devnet adapter and `guide-demo-devnet.ts`, and which the verification script builds the
 * same way. Only types come from the devnet module, so production bundles stay free of the viem
 * previews.
 */
import {
  type AccessKey,
  type AccessKeyKind,
  type ActionRequest,
  type ActionResult,
  addAccessKey,
  addSigner,
  approvalSets,
  configuredSigners,
  formatUsd,
  isCreated,
  loadPreset,
  remainingLimit,
  removeSigner,
  revokeAccessKey,
  type SandboxAccount,
  type Signer,
  type SignerKind,
  setSignerLost,
  setSignerWeight,
  setThreshold,
  shortAddress,
  signerKinds,
  usableSigners,
} from './account-sandbox'
import type { DevnetCallOptions, DevnetSessionInfo, PreparedKey } from './account-sandbox-devnet'

// ---------------------------------------------------------------------------
// Types

export type GuideId = 'recover' | 'backend-automation'

export type LocalIcon = 'device' | 'laptop' | 'passkey' | 'update' | 'server'

/** Something in your app or on a device, not on Tempo. */
export type LocalItem = {
  id: string
  icon: LocalIcon
  label: string
  detail: string
  status: 'ready' | 'pending' | 'done' | 'gone'
}

/** Keys a step made for a later step's transaction. */
export type Held = {
  /** Signer keys created before the update that adds them, by the signer ID they'll get. */
  signers: { id: string; kind: SignerKind; key: PreparedKey }[]
  /** Access keys created before the transaction that authorizes them. */
  accessKeys: { kind: AccessKeyKind; key: PreparedKey }[]
  /** Generated private keys, by name. This page holds them for the demo. */
  privateKeys: Record<string, string>
  /** What a step found, for a later step's result. */
  notes: Record<string, string>
}

export type DemoState = {
  /** The reader's account: empty until its first signer creates it. */
  account: SandboxAccount
  local: LocalItem[]
  held: Held
}

/** What the adapter does for a guide. `GuideDemo` passes the devnet adapter. */
export type GuideAdapter = {
  sync(
    previous: SandboxAccount,
    next: SandboxAccount,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; hash?: string }>
  submit(
    account: SandboxAccount,
    request: ActionRequest,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; result: ActionResult }>
  inspect(address: string): Promise<DevnetSessionInfo | undefined>
  prepareSigner(
    signer: Pick<Signer, 'kind' | 'name' | 'privateKey'>,
    options?: DevnetCallOptions,
  ): Promise<PreparedKey>
  /** Test funds from the devnet faucet. New accounts have none, and transactions need fees. */
  fund(
    account: SandboxAccount,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; hash?: string }>
}

/** Reads and local key work on devnet (`guide-demo-devnet.ts`). */
export type GuideChain = {
  /** The address `Account.fromConfig({ address: 'infer' })` derives for this configuration. */
  inferAddress(config: {
    owners: readonly { owner: string; weight: number }[]
    threshold: number
  }): string
  /** What an access key can still spend this period, in USD, as Tempo reports it. */
  remaining(account: string, keyId: string): Promise<number>
  generatePrivateKey(): string
  addressOf(privateKey: string): string
}

export type GuideContext = {
  adapter: GuideAdapter
  chain: GuideChain
  /** Prepared keys and prompts for the adapter's calls. */
  options: DevnetCallOptions
}

export type StepOutcome = {
  state: DemoState
  /** What happened, from real results. */
  result: string
  /** The transactions this step sent, in order. */
  hashes: { label: string; hash: string }[]
  /** A generated private key, shown once with this step's result. */
  secret?: { label: string; value: string }
}

export type DemoAction = {
  /** For a guide step, the guide's step heading. */
  title: string
  /** The button. */
  action: (state: DemoState) => string
  run: (state: DemoState, ctx: GuideContext) => Promise<StepOutcome>
}

/** What a demo needs live: devnet always, plus WebCrypto for a device key that's an access key. */
export type Need = 'webcrypto'

export type DemoScript = {
  title: string
  needs: readonly Need[]
  /** Builds the starting account before the guide's steps, when the guide needs one. */
  setup: DemoAction[]
  steps: DemoAction[]
}

/** Why this demo can't run with what's live, or `null` when it can. */
export function missingNeed(needs: readonly Need[], live: ReadonlySet<Need>): string | null {
  const missing = needs.filter((need) => !live.has(need))
  if (missing.length === 0) return null
  return 'This demo creates a WebCrypto device key. Open it on localhost or an HTTPS page.'
}

/** A step that can't finish, with a message for the reader. */
export class DemoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DemoError'
  }
}

// ---------------------------------------------------------------------------
// Pure helpers

const emptyHeld: Held = { signers: [], accessKeys: [], privateKeys: {}, notes: {} }

export function startState(): DemoState {
  return {
    account: loadPreset('from-scratch'),
    local: [],
    held: emptyHeld,
  }
}

export function withLocal(state: DemoState, item: LocalItem): DemoState {
  const exists = state.local.some((other) => other.id === item.id)
  return {
    ...state,
    local: exists
      ? state.local.map((other) => (other.id === item.id ? item : other))
      : [...state.local, item],
  }
}

export function updateLocal(state: DemoState, id: string, changes: Partial<LocalItem>): DemoState {
  return {
    ...state,
    local: state.local.map((item) => (item.id === id ? { ...item, ...changes } : item)),
  }
}

function hold(state: DemoState, changes: Partial<Held>): DemoState {
  return { ...state, held: { ...state.held, ...changes } }
}

/** Several engine edits sent as the one update they are on Tempo: one version bump. */
export function asOneUpdate(before: SandboxAccount, after: SandboxAccount): SandboxAccount {
  if (after.version <= before.version + 1) return after
  const version = before.version + 1
  return {
    ...after,
    version,
    signers: after.signers.map((signer) =>
      signer.addedIn !== null && signer.addedIn > before.version
        ? { ...signer, addedIn: version }
        : signer,
    ),
  }
}

export function patchSigner(
  account: SandboxAccount,
  id: string,
  changes: Partial<Pick<Signer, 'name' | 'detail' | 'subject'>>,
): SandboxAccount {
  return {
    ...account,
    signers: account.signers.map((signer) =>
      signer.id === id ? { ...signer, ...changes } : signer,
    ),
  }
}

export function patchKey(
  account: SandboxAccount,
  id: string,
  changes: Partial<Omit<AccessKey, 'id' | 'kind' | 'status' | 'spent'>>,
): SandboxAccount {
  return {
    ...account,
    accessKeys: account.accessKeys.map((key) => (key.id === id ? { ...key, ...changes } : key)),
  }
}

/** Throw the engine's reason when an edit didn't apply. */
export function checked(account: SandboxAccount): SandboxAccount {
  if (account.notice) throw new DemoError(account.notice)
  return account
}

/** The signer an edit added: the last one, which must be new. */
export function addedSigner(before: SandboxAccount, after: SandboxAccount): Signer {
  const signer = after.signers.at(-1)
  if (!signer || before.signers.some((item) => item.id === signer.id))
    throw new DemoError(after.notice ?? 'The signer wasn’t added.')
  return signer
}

/** The access key an edit added. */
export function addedKey(before: SandboxAccount, after: SandboxAccount): AccessKey {
  const key = after.accessKeys.at(-1)
  if (!key || before.accessKeys.some((item) => item.id === key.id))
    throw new DemoError(after.notice ?? 'The access key wasn’t added.')
  return key
}

export function paymentRequest(
  account: SandboxAccount,
  keyName: string,
  amount: number,
): ActionRequest {
  const key = account.accessKeys.find((item) => item.name === keyName && item.status === 'active')
  if (!key) throw new DemoError(`${keyName} isn’t an active access key.`)
  const memberIds = key.delegate?.members.slice(0, key.delegate.threshold).map((item) => item.id)
  return {
    action: { type: 'payment', amount },
    approver: { type: 'access-key', keyId: key.id, memberIds },
    recipient: 'approved',
  }
}

/** The current signers that approve the next update, as the adapter picks them. */
export function nextApprovers(account: SandboxAccount): Signer[] {
  const owners = account.committed.owners
    .map(({ id, weight }) => {
      const signer = account.signers.find((item) => item.id === id)
      return signer ? { ...signer, weight, revoked: false } : null
    })
    .filter((signer): signer is Signer => Boolean(signer))
  return approvalSets(usableSigners(owners), account.committed.threshold, { limit: 1 })[0] ?? []
}

export function joinAnd(items: readonly string[]) {
  if (items.length <= 1) return items.join('')
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

/** Signer names in a sentence, such as "your device key and Backup key". */
export function approverNames(signers: readonly Signer[]) {
  return joinAnd(signers.map(signerPhrase))
}

/** Whether a signer has a name the demo gave it, such as "Approver key 1", not its kind's label. */
function namedSigner(signer: Signer) {
  return !signer.name.startsWith(signerKinds[signer.kind].label)
}

function signerPhrase(signer: Signer) {
  return namedSigner(signer) ? signer.name : `your ${lowerFirst(signer.name)}`
}

/** The configuration in one line, such as "device key (2), Backup key (1), threshold 2". */
export function describeConfig(account: SandboxAccount) {
  const owners = configuredSigners(account).map(
    (signer) => `${namedSigner(signer) ? signer.name : lowerFirst(signer.name)} (${signer.weight})`,
  )
  return `${owners.join(', ')}, threshold ${account.threshold}`
}

/** Whether the account still reaches its threshold after losing any one signer. */
export function recoveryCheck(account: SandboxAccount) {
  const owners = usableSigners(configuredSigners(account))
  const locking = owners.filter((signer) => {
    const rest = owners.filter((other) => other.id !== signer.id)
    return approvalSets(rest, account.threshold).length === 0
  })
  if (locking.length === 0)
    return {
      ok: true,
      message: `Losing any one of the ${owners.length} signers leaves enough weight to reach threshold ${account.threshold}.`,
    }
  return {
    ok: false,
    message: `Losing ${joinAnd(locking.map(signerPhrase))} locks the account.`,
  }
}

export function short(address: string) {
  return shortAddress(address)
}

export function until(validUntil: number) {
  return new Date(validUntil * 1_000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function keyLeft(account: SandboxAccount, name: string) {
  const key = account.accessKeys.find((item) => item.name === name)
  return key ? `${formatUsd(remainingLimit(key))} USD` : '0 USD'
}

function hashes(...entries: [string, string | undefined][]) {
  return entries.flatMap(([label, hash]) => (hash ? [{ label, hash }] : []))
}

/** Which devnet keys a call may use: keys made in earlier steps. */
export function callOptions(state: DemoState, ctx: GuideContext): DevnetCallOptions {
  const { held } = state
  return {
    ...ctx.options,
    prepared: {
      signer: (signer) =>
        held.signers.find((item) => item.id === signer.id && item.kind === signer.kind)?.key,
      accessKey: (key) => held.accessKeys.find((item) => item.kind === key.kind)?.key,
    },
  }
}

/** Drop held keys once a transaction used them. */
export function consume(held: Held, previous: SandboxAccount, next: SandboxAccount): Held {
  const owners = new Set(configuredSigners(next).map((signer) => signer.id))
  const added = next.accessKeys
    .filter((key) => !previous.accessKeys.some((item) => item.id === key.id))
    .map((key) => key.kind)
  return {
    ...held,
    signers: held.signers.filter((item) => !owners.has(item.id)),
    accessKeys: held.accessKeys.filter((item) => !added.includes(item.kind)),
  }
}

/** Send an edit to devnet: the adapter applies the new configuration and access keys. */
export async function update(
  state: DemoState,
  ctx: GuideContext,
  next: SandboxAccount,
): Promise<{ state: DemoState; hash: string | undefined }> {
  checked(next)
  const { account, hash } = await ctx.adapter.sync(state.account, next, callOptions(state, ctx))
  if (account.notice) throw new DemoError(account.notice)
  return {
    state: { ...state, account, held: consume(state.held, state.account, account) },
    hash,
  }
}

/** Pay with an access key on devnet. */
export async function payWithKey(
  state: DemoState,
  ctx: GuideContext,
  keyName: string,
  amount: number,
): Promise<{ state: DemoState; hash: string | undefined }> {
  const request = paymentRequest(state.account, keyName, amount)
  const { account, result } = await ctx.adapter.submit(
    state.account,
    request,
    callOptions(state, ctx),
  )
  if (!result.ok) throw new DemoError(result.message)
  return {
    state: { ...state, account, held: consume(state.held, state.account, account) },
    hash: result.hash,
  }
}

function addressOf(account: SandboxAccount) {
  if (!isCreated(account)) throw new DemoError('Create the account first.')
  return account.address
}

// ---------------------------------------------------------------------------
// Shared steps

/** Create the account with its first signer: a device key or a private key. */
async function createAccount(
  state: DemoState,
  ctx: GuideContext,
  kind: SignerKind,
  privateKey?: string,
) {
  const next = addSigner(state.account, kind, privateKey ? { privateKey } : {})
  const signer = addedSigner(state.account, next)
  let draft = next
  if (kind === 'private-key' && privateKey)
    draft = patchSigner(next, signer.id, {
      detail: `secp256k1 · ${short(ctx.chain.addressOf(privateKey))} · held by this page`,
    })
  const created = await update(state, ctx, draft)
  // The address comes from the first signer. Nothing is sent until the account has test funds.
  const funded = await ctx.adapter.fund(created.state.account, callOptions(created.state, ctx))
  if (funded.account.notice) throw new DemoError(funded.account.notice)
  return { state: { ...created.state, account: funded.account }, hash: funded.hash, signer }
}

/** A device key signer's detail line: a P-256 key this browser holds. */
const deviceKeyDetail = (status: string) => `P-256 · key in this browser · ${status}`

/** Create a device key now, for the update in a later step that adds it as a signer. */
async function prepareDeviceKey(state: DemoState, ctx: GuideContext, label: string) {
  const draft = addSigner(state.account, 'device')
  const signer = addedSigner(state.account, draft)
  const key = await ctx.adapter.prepareSigner(
    { kind: 'device', name: signer.name },
    callOptions(state, ctx),
  )
  let next = hold(state, {
    signers: [...state.held.signers, { id: signer.id, kind: 'device', key }],
  })
  next = withLocal(next, {
    id: 'device-signer',
    icon: 'laptop',
    label,
    detail: deviceKeyDetail(`${short(key.address)} · not a signer yet`),
    status: 'pending',
  })
  return { state: next, key }
}

/** Add the device key a previous step created, at `weight`. */
function addHeldDeviceKey(account: SandboxAccount, held: Held, weight: number) {
  const next = checked(addSigner(account, 'device'))
  const signer = addedSigner(account, next)
  if (!held.signers.some((item) => item.id === signer.id))
    throw new DemoError('Create the device key first.')
  return {
    account: weight === 1 ? next : checked(setSignerWeight(next, signer.id, weight)),
    signer,
  }
}

// ---------------------------------------------------------------------------
// One script per guide, following its steps

function approverKeyDetail(ctx: GuideContext, privateKey: string) {
  return `secp256k1 · ${short(ctx.chain.addressOf(privateKey))} · held by this page`
}

function upperFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Create the account with a generated private key as its only signer, named `name`. */
async function keyAccount(state: DemoState, ctx: GuideContext, name: string) {
  const privateKey = ctx.chain.generatePrivateKey()
  const created = await createAccount(state, ctx, 'private-key', privateKey)
  const account = patchSigner(created.state.account, created.signer.id, { name })
  return { state: { ...created.state, account }, hash: created.hash }
}

/** Add a generated private key as a signer named `name`, at `weight`. */
function addKeySigner(
  account: SandboxAccount,
  ctx: GuideContext,
  privateKey: string,
  name: string,
  weight = 1,
) {
  const next = checked(addSigner(account, 'private-key', { privateKey }))
  const signer = addedSigner(account, next)
  const named = patchSigner(next, signer.id, { name, detail: approverKeyDetail(ctx, privateKey) })
  return weight === 1 ? named : checked(setSignerWeight(named, signer.id, weight))
}

/** Create the account with a private key and authorize a "This browser" device key. */
const keyWithDeviceKey: DemoAction = {
  title: 'Create your account',
  action: () => 'Create with a private key',
  run: async (state, ctx) => {
    const created = await keyAccount(state, ctx, 'First key')
    const next = addAccessKey(created.state.account, 'browser')
    addedKey(created.state.account, next)
    const authorized = await update(created.state, ctx, next)
    const done = withLocal(authorized.state, {
      id: 'device',
      icon: 'device',
      label: 'Device key · this browser',
      detail: 'WebCrypto P-256 · authorized · 500 USD a day',
      status: 'done',
    })
    return {
      state: done,
      result: `Created ${short(addressOf(done.account))} with First key, a private key this page holds, as its only signer. First key then authorized a device key in this browser.`,
      hashes: hashes(['Faucet', created.hash], ['Authorize', authorized.hash]),
    }
  },
}

const recover: DemoScript = {
  title: 'Recover after losing your device key',
  needs: ['webcrypto'],
  setup: [
    keyWithDeviceKey,
    {
      title: 'Add a backup key and a device key',
      action: () => 'Add both',
      run: async (state, ctx) => {
        const before = state.account
        const approvers = nextApprovers(before)
        const withDeviceKey = checked(addSigner(before, 'device'))
        const deviceKey = addedSigner(before, withDeviceKey)
        const weighted = checked(setSignerWeight(withDeviceKey, deviceKey.id, 2))
        const withBackup = addKeySigner(weighted, ctx, ctx.chain.generatePrivateKey(), 'Backup key')
        const next = asOneUpdate(before, checked(setThreshold(withBackup, 2)))
        const sent = await update(state, ctx, next)
        return {
          state: withLocal(sent.state, {
            id: 'old-device-signer',
            icon: 'laptop',
            label: 'Device key',
            detail: deviceKeyDetail('signer'),
            status: 'done',
          }),
          result: `Config v${sent.state.account.version}: ${describeConfig(sent.state.account)}. ${upperFirst(approverNames(approvers))} approved it. This page created the device key during the update.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Treat the device key as lost',
      action: () => 'Treat the device key as lost',
      run: async (state) => {
        const deviceKey = configuredSigners(state.account).find(
          (signer) => signer.kind === 'device',
        )
        if (!deviceKey) throw new DemoError('The account has no device key.')
        const next = {
          ...state,
          account: setSignerLost(state.account, deviceKey.id, true),
        }
        return {
          state: updateLocal(next, 'old-device-signer', {
            label: 'Lost device key',
            detail: 'Treated as lost · still a signer on Tempo',
            status: 'gone',
          }),
          result:
            'From here on the demo treats the device key as lost: it won’t approve. It stays a signer on Tempo until you replace it.',
          hashes: [],
        }
      },
    },
  ],
  steps: [
    {
      title: 'Create the Replacement Signer',
      action: () => 'Create device key',
      run: async (state, ctx) => {
        const { state: next, key } = await prepareDeviceKey(state, ctx, 'Replacement device key')
        return {
          state: next,
          result: `A new device key in this browser, standing in for the new device. Its address is ${short(key.address)}. It isn’t a signer yet.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Approve With the Remaining Signers',
      action: () => 'Replace the device key',
      run: async (state, ctx) => {
        const info = await ctx.adapter.inspect(addressOf(state.account))
        if (!info) throw new DemoError('This page didn’t create that account on devnet.')
        const lost = configuredSigners(state.account).find((signer) => signer.lost)
        if (!lost) throw new DemoError('No lost signer to replace.')
        const approvers = nextApprovers(state.account)
        const weight = approvers.reduce((sum, signer) => sum + signer.weight, 0)
        if (weight < state.account.threshold)
          throw new DemoError('The remaining signers don’t reach the threshold.')
        const removed = checked(removeSigner(state.account, lost.id))
        const { account: added, signer } = addHeldDeviceKey(removed, state.held, 2)
        const named = patchSigner(added, signer.id, { name: 'New device key' })
        const sent = await update(state, ctx, asOneUpdate(state.account, named))
        return {
          state: updateLocal(sent.state, 'device-signer', {
            detail: deviceKeyDetail('signer'),
            status: 'done',
          }),
          result: `${upperFirst(approverNames(approvers))} (weight ${weight}, threshold ${state.account.threshold}) approved config v${sent.state.account.version} together: the new device key (2) replaces the lost one, which can’t approve anything now.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Revoke the Lost Device’s Keys',
      action: () => 'Revoke with the new device key',
      run: async (state, ctx) => {
        const key = state.account.accessKeys.find(
          (item) => item.name === 'This browser' && item.status === 'active',
        )
        if (!key) throw new DemoError('No device key to revoke.')
        const approvers = nextApprovers(state.account)
        const sent = await update(state, ctx, revokeAccessKey(state.account, key.id))
        return {
          state: updateLocal(sent.state, 'device', {
            detail: 'WebCrypto P-256 · revoked',
            status: 'gone',
          }),
          result: `${upperFirst(approverNames(approvers))} revoked the device key you treated as reachable from the lost device. It can’t pay anymore.`,
          hashes: hashes(['Revoke', sent.hash]),
        }
      },
    },
  ],
}

/** Create the account with a device key in this browser. */
const deviceKeyAccount = (title: string): DemoAction => ({
  title,
  action: () => 'Create with a device key',
  run: async (state, ctx) => {
    const created = await createAccount(state, ctx, 'device')
    return {
      state: created.state,
      result: `Created ${short(addressOf(created.state.account))} with a device key on this browser as its only signer. The devnet faucet funded it.`,
      hashes: hashes(['Faucet', created.hash]),
    }
  },
})

const backendAutomation: DemoScript = {
  title: 'Pay out from a backend',
  needs: [],
  setup: [deviceKeyAccount('Create your account')],
  steps: [
    {
      title: 'Authorize a Scoped, Limited Key',
      action: () => 'Approve with the device key',
      run: async (state, ctx) => {
        const privateKey = ctx.chain.generatePrivateKey()
        const keyId = ctx.chain.addressOf(privateKey)
        const prepared = {
          ...state,
          held: {
            ...state.held,
            privateKeys: { ...state.held.privateKeys, backend: privateKey },
          },
        }
        const withKey = addAccessKey(state.account, 'private-key', { privateKey })
        const key = addedKey(state.account, withKey)
        const next = patchKey(withKey, key.id, {
          name: 'Backend key',
          limit: 1_000,
          period: 'day',
          expiresInDays: 90,
          recipients: 'approved',
        })
        const sent = await update(prepared, ctx, next)
        return {
          state: withLocal(sent.state, {
            id: 'server',
            icon: 'server',
            label: 'Backend key',
            detail: `secp256k1 · ${short(keyId)} · authorized`,
            status: 'done',
          }),
          result: `The device key authorized backend key ${short(keyId)}: up to 1,000 USD a day, to one approved payee, for 90 days.`,
          hashes: hashes(['Authorize', sent.hash]),
          secret: { label: 'The key you’d keep in your KMS, shown once', value: privateKey },
        }
      },
    },
    {
      title: 'Keep the Key in Your KMS',
      action: () => 'Check the key on Tempo',
      run: async (state, ctx) => {
        const privateKey = state.held.privateKeys.backend
        if (!privateKey) throw new DemoError('Authorize the key first.')
        const keyId = ctx.chain.addressOf(privateKey)
        const left = await ctx.chain.remaining(addressOf(state.account), keyId)
        return {
          state: updateLocal(state, 'server', {
            detail: `secp256k1 · ${short(keyId)} · in your KMS`,
          }),
          result: `Tempo stores only the key ID ${short(keyId)} and its bounds, with ${formatUsd(left)} USD left today. The private key stays with you.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Send Payouts',
      action: () => 'Send a $50 payout',
      run: async (state, ctx) => {
        const paid = await payWithKey(state, ctx, 'Backend key', 50)
        return {
          state: paid.state,
          result: `The backend key paid $50 to its approved payee with no prompt. ${keyLeft(paid.state.account, 'Backend key')} left today.`,
          hashes: hashes(['Pay $50', paid.hash]),
        }
      },
    },
  ],
}

export const guideScripts: Record<GuideId, DemoScript> = {
  recover,
  'backend-automation': backendAutomation,
}

export const guideDemoIds = Object.keys(guideScripts) as GuideId[]

/** The setup actions, then the guide's steps. */
export function scriptActions(script: DemoScript) {
  return [...script.setup, ...script.steps]
}

/** A script's starting state. */
export function scriptStart(_guide: GuideId) {
  return startState()
}
