/**
 * Guide demos: one script per guide, run on Tempo devnet with the reader's own signers. Each
 * step's title matches the guide's step heading. Steps that change the account send real devnet
 * transactions and return their hashes; the others do a real local action (create a key, sign in)
 * or read Tempo.
 *
 * No React and no network code here: steps act through `GuideContext`, which `GuideDemo` builds
 * from the devnet adapter and `guide-demo-devnet.ts`, and which the verification script builds the
 * same way. Only types come from the devnet and login modules, so production bundles stay free of
 * the viem previews.
 */
import {
  type AccessKey,
  type AccessKeyKind,
  type AccessKeyTemplateId,
  type ActionRequest,
  type ActionResult,
  accessKeyTemplates,
  addAccessKey,
  addSigner,
  approvalSets,
  configuredSigners,
  formatBalance,
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
import type {
  ChainConfig,
  DevnetCallOptions,
  DevnetSessionInfo,
  PreparedKey,
} from './account-sandbox-devnet'
import type { LoginMethod, SignInResult } from './account-sandbox-oidc'
import { thisDevice } from './this-device'

// ---------------------------------------------------------------------------
// Types

export type GuideId =
  | 'identity-provider'
  | 'add-signers'
  | 'multi-factor'
  | 'rotate-keys'
  | 'change-email'
  | 'recover'
  | 'export'
  | 'backend-automation'
  | 'team-accounts'

export type LocalIcon =
  | 'device'
  | 'laptop'
  | 'login'
  | 'passkey'
  | 'relay'
  | 'publisher'
  | 'update'
  | 'server'
  | 'team'
  | 'key'

/** Something in your app or on a device, not on Tempo. */
export type LocalItem = {
  id: string
  icon: LocalIcon
  label: string
  detail: string
  status: 'ready' | 'pending' | 'done' | 'gone'
}

/** Keys and sign-ins a step made for a later step's transaction. */
export type Held = {
  /** Real sign-ins not yet used by a transaction. */
  signIns: SignInResult[]
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
  /** The reader's choice, such as the login they sign in with. */
  choice: string
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
  prepareAccessKey(key: AccessKey, options?: DevnetCallOptions): Promise<PreparedKey>
  /** Test funds from the devnet faucet. New accounts have none, and transactions need fees. */
  fund(
    account: SandboxAccount,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; hash?: string }>
}

/** Reads and local key work on devnet (`guide-demo-devnet.ts`). */
export type GuideChain = {
  /** Signing keys the relay's Key Publisher lists on devnet for this login's issuer. */
  publishedKeys(
    method: LoginMethod,
  ): Promise<{ issuer: string; publisherId: string; count: number }>
  /** The local auth app's chain and sign-in methods, or `null` when it isn't running. */
  relay(): Promise<{ chainId: number; methods: readonly LoginMethod[] } | null>
  /** The account's configuration commitment on Tempo, or `null` before its first transaction. */
  commitment(address: string): Promise<string | null>
  configCommitment(config: ChainConfig): string
  /** The address `Account.fromConfig({ address: 'infer' })` derives for this configuration. */
  inferAddress(config: {
    owners: readonly { owner: string; weight: number }[]
    threshold: number
  }): string
  /** AlphaUSD balance in USD. */
  balance(address: string): Promise<number>
  /** What an access key can still spend this period, in USD, as Tempo reports it. */
  remaining(account: string, keyId: string): Promise<number>
  generatePrivateKey(): string
  addressOf(privateKey: string): string
  /** How a login names itself: the account's email, the Privy identity, or the login's address. */
  identity(result: SignInResult): { subject: string; detail: string }
}

export type GuideContext = {
  adapter: GuideAdapter
  chain: GuideChain
  /** Prompts, sign-in requests for expired logins, and cancellation. */
  options: DevnetCallOptions
  /** Sign the reader in for real. The first call in a click uses that click's sign-in window. */
  signIn(method: LoginMethod): Promise<SignInResult>
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
  /** The login this click signs in with first, so the click can open its sign-in window. */
  signIn?: (state: DemoState) => LoginMethod | null
  run: (state: DemoState, ctx: GuideContext) => Promise<StepOutcome>
}

/** What a demo needs live: devnet always, plus a platform passkey or login methods. */
export type Need = 'passkey' | LoginMethod

export type DemoChoice = { id: string; label: string; method?: LoginMethod }

export type DemoScript = {
  title: string
  /** Choices the reader makes before starting, such as the login to sign in with. */
  choices?: readonly DemoChoice[]
  /** What the choice is about, such as "Sign in with". */
  choiceLabel?: string
  needs: (choice: string) => Need[]
  /** Builds the starting account before the guide's steps, when the guide needs one. */
  setup: DemoAction[]
  steps: DemoAction[]
}

/** Why this demo can't run with what's live, or `null` when it can. */
export function missingNeed(needs: readonly Need[], live: ReadonlySet<Need>): string | null {
  const missing = needs.filter((need) => !live.has(need))
  if (missing.length === 0) return null
  if (missing.includes('passkey'))
    return 'This demo creates a passkey. Open it in a browser with Touch ID, Face ID, or Windows Hello.'
  return 'Start the local auth app to sign in.'
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

const emptyHeld: Held = { signIns: [], signers: [], accessKeys: [], privateKeys: {}, notes: {} }

export function startState(choice = '', name?: string): DemoState {
  const account = loadPreset('from-scratch')
  return {
    account: name ? { ...account, name } : account,
    local: [],
    held: emptyHeld,
    choice,
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

/** An access key built from a template before any account holds it, for `prepareAccessKey`. */
export function draftAccessKey(
  template: AccessKeyTemplateId,
  changes: Partial<Omit<AccessKey, 'id' | 'kind' | 'status' | 'spent'>> = {},
): AccessKey {
  return {
    ...accessKeyTemplates[template],
    ...changes,
    id: `draft-${template}`,
    spent: 0,
    status: 'active',
  }
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

/** Signer names in a sentence, such as "your Privy login and your Google login". */
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

/** The configuration in one line, such as "passkey (2), Google login (1), threshold 2". */
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

const loginWords: Record<LoginMethod, string> = {
  google: 'Google',
  privy: 'Privy',
}

/** Which devnet keys a call may use: keys and sign-ins made in earlier steps. */
export function callOptions(state: DemoState, ctx: GuideContext): DevnetCallOptions {
  const { held } = state
  return {
    ...ctx.options,
    signIns: held.signIns,
    prepared: {
      signer: (signer) =>
        held.signers.find((item) => item.id === signer.id && item.kind === signer.kind)?.key,
      accessKey: (key) => held.accessKeys.find((item) => item.kind === key.kind)?.key,
    },
  }
}

/** Drop held keys and sign-ins once a transaction used them. */
export function consume(held: Held, previous: SandboxAccount, next: SandboxAccount): Held {
  const owners = new Set(configuredSigners(next).map((signer) => signer.id))
  const added = next.accessKeys
    .filter((key) => !previous.accessKeys.some((item) => item.id === key.id))
    .map((key) => key.kind)
  return {
    ...held,
    signIns: [],
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

async function onChainConfig(ctx: GuideContext, account: SandboxAccount) {
  const address = addressOf(account)
  const info = await ctx.adapter.inspect(address)
  if (!info) throw new DemoError('This page didn’t create that account on devnet.')
  const commitment = await ctx.chain.commitment(address)
  const matches =
    commitment === null ? null : commitment === ctx.chain.configCommitment(info.config)
  if (matches === false)
    throw new DemoError('The account’s commitment on Tempo doesn’t match this page’s record.')
  return { info, commitment, matches }
}

function commitmentNote(matches: boolean | null, version: bigint) {
  return matches
    ? `It matches the account’s commitment on Tempo.`
    : `Tempo has no commitment yet: the account’s first transaction commits v${version}.`
}

// ---------------------------------------------------------------------------
// Shared steps

async function signInStep(
  state: DemoState,
  ctx: GuideContext,
  method: LoginMethod,
  item: { id: string; label: string; pending: boolean },
): Promise<{ state: DemoState; result: SignInResult; who: string }> {
  const result = await ctx.signIn(method)
  const { subject } = ctx.chain.identity(result)
  const who = method === 'google' ? `your Google account (${short(result.owner.address)})` : subject
  let next = hold(state, { signIns: [result, ...state.held.signIns] })
  next = withLocal(next, {
    id: item.id,
    icon: 'login',
    label: item.label,
    detail: `${method === 'google' ? `Google · ${short(result.owner.address)}` : subject} · approves until ${until(result.owner.validUntil)}${item.pending ? ' · not a signer yet' : ''}`,
    status: item.pending ? 'pending' : 'ready',
  })
  return { state: next, result, who }
}

/** Create the account with its first signer: a login, a passkey, or a private key. */
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

/** Create a passkey now, for the update in a later step that adds it as a signer. */
async function preparePasskey(state: DemoState, ctx: GuideContext, label: string) {
  const draft = addSigner(state.account, 'passkey')
  const signer = addedSigner(state.account, draft)
  const key = await ctx.adapter.prepareSigner(
    { kind: 'passkey', name: signer.name },
    callOptions(state, ctx),
  )
  const { unlock } = thisDevice()
  let next = hold(state, {
    signers: [...state.held.signers, { id: signer.id, kind: 'passkey', key }],
  })
  next = withLocal(next, {
    id: 'passkey',
    icon: 'passkey',
    label,
    detail: `WebAuthn · ${unlock} · ${short(key.address)} · not a signer yet`,
    status: 'pending',
  })
  return { state: next, key }
}

/** Add the passkey a previous step created, at `weight`. */
function addHeldPasskey(account: SandboxAccount, held: Held, weight: number) {
  const next = checked(addSigner(account, 'passkey'))
  const signer = addedSigner(account, next)
  if (!held.signers.some((item) => item.id === signer.id))
    throw new DemoError('Create the passkey first.')
  return {
    account: weight === 1 ? next : checked(setSignerWeight(next, signer.id, weight)),
    signer,
  }
}

async function prepareBrowserKey(
  state: DemoState,
  ctx: GuideContext,
  label: string,
  icon: LocalIcon,
) {
  const key = await ctx.adapter.prepareAccessKey(
    draftAccessKey('browser', { name: 'This browser' }),
    callOptions(state, ctx),
  )
  let next = hold(state, { accessKeys: [...state.held.accessKeys, { kind: 'browser', key }] })
  next = withLocal(next, {
    id: 'device',
    icon,
    label,
    detail: `WebCrypto P-256 · ${short(key.address)} · not authorized yet`,
    status: 'pending',
  })
  return { state: next, key }
}

/** Authorize the held "This browser" key, then pay $5 with it. */
/** The held "This browser" key's first payment, which carries its authorization. */
async function authorizeAndPay(state: DemoState, ctx: GuideContext, approver: string) {
  const next = checked(addAccessKey(state.account, 'browser'))
  const key = addedKey(state.account, next)
  // Not synced first: the adapter sends the payment with the key's authorization riding along.
  const paid = await payWithKey({ ...state, account: next }, ctx, key.name, 5)
  const keyId = state.held.accessKeys.find((item) => item.kind === 'browser')?.key.address
  const done = updateLocal(
    { ...paid.state, held: consume(state.held, state.account, paid.state.account) },
    'device',
    {
      detail: `WebCrypto P-256 · ${keyId ? short(keyId) : 'this browser'} · authorized`,
      status: 'done',
    },
  )
  return {
    state: done,
    result: `${approver} signed the device key’s authorization, and the key’s first $5 payment carried it in one transaction. From now on the key pays up to 500 USD a day with no prompt. ${keyLeft(paid.state.account, key.name)} left today.`,
    hashes: hashes(['Pay $5 and authorize', paid.hash]),
  }
}

function method(state: DemoState): LoginMethod {
  return state.choice === 'privy' ? 'privy' : 'google'
}

const loginChoices: DemoChoice[] = [
  { id: 'google', label: 'Google', method: 'google' },
  { id: 'privy', label: 'Privy', method: 'privy' },
]

/** The account's first signer when the reader chooses it. */
const firstSignerChoices: DemoChoice[] = [
  { id: 'google', label: 'Google login', method: 'google' },
  { id: 'privy', label: 'Privy login', method: 'privy' },
  { id: 'private-key', label: 'Private key' },
]

function choiceMethod(choice: string): LoginMethod | null {
  return choice === 'google' || choice === 'privy' ? choice : null
}

// ---------------------------------------------------------------------------
// One script per guide, following its steps

const identityProvider: DemoScript = {
  title: 'Sign in with your identity provider',
  choices: loginChoices,
  choiceLabel: 'Sign in with',
  needs: (choice) => [choice === 'privy' ? 'privy' : 'google'],
  setup: [],
  steps: [
    {
      title: 'Check that your provider’s keys are published',
      action: (state) =>
        method(state) === 'google' ? 'Check Google’s keys' : 'Check the auth app’s keys',
      run: async (state, ctx) => {
        const login = method(state)
        const { count, publisherId } = await ctx.chain.publishedKeys(login)
        const issuer =
          login === 'google' ? 'Google' : 'The local auth app (the issuer that bridges Privy)'
        if (count === 0)
          throw new DemoError(
            `${issuer} has no signing keys listed on devnet, so its sign-ins can’t approve.`,
          )
        return {
          state: withLocal(state, {
            id: 'publisher',
            icon: 'publisher',
            label: `Key Publisher · ${login === 'google' ? 'Google' : 'Privy bridge'}`,
            detail: `${count} signing key${count === 1 ? '' : 's'} listed · ${short(publisherId)}`,
            status: 'ready',
          }),
          result: `${issuer} has ${count} signing key${count === 1 ? '' : 's'} listed in the demo’s Key Publisher on devnet.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Connect to a salt service',
      action: () => 'Connect',
      run: async (state, ctx) => {
        const relay = await ctx.chain.relay()
        if (!relay) throw new DemoError('Start the local auth app to sign in.')
        return {
          state: withLocal(state, {
            id: 'relay',
            icon: 'relay',
            label: 'Salt service · local auth app',
            detail: `localhost:5173 · chain ${relay.chainId}`,
            status: 'ready',
          }),
          result: `Connected to the local auth app on chain ${relay.chainId}. It signs in with ${joinAnd(relay.methods.map((item) => loginWords[item]))} and returns a ZK proof of each sign-in.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Create a key on the device',
      action: () => 'Create device key',
      run: async (state, ctx) => {
        const { state: next, key } = await prepareBrowserKey(state, ctx, 'Device key', 'device')
        return {
          state: next,
          result: `A P-256 key whose private key can’t leave this browser. Key ID ${short(key.address)}. It can’t pay until the account authorizes it.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Sign the customer in',
      action: (state) => `Sign in with ${loginWords[method(state)]}`,
      signIn: method,
      run: async (state, ctx) => {
        const login = method(state)
        const signedIn = await signInStep(state, ctx, login, {
          id: 'login',
          label: signerKinds[login].label,
          pending: false,
        })
        return {
          state: signedIn.state,
          result: `Signed in as ${signedIn.who}. The proof lets this login approve until ${until(signedIn.result.owner.validUntil)}.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Open the customer’s account',
      action: () => 'Open account',
      run: async (state, ctx) => {
        const created = await createAccount(state, ctx, method(state))
        const address = addressOf(created.state.account)
        const registered = (await ctx.chain.commitment(address)) !== null
        return {
          state: created.state,
          result: `Your login’s address is ${short(address)}, and the devnet faucet funded it. ${registered ? 'It’s already on Tempo: this login opened it before.' : 'It registers on Tempo with its first transaction.'}`,
          hashes: hashes(['Faucet', created.hash]),
        }
      },
    },
    {
      title: 'Authorize the device key with the first payment',
      action: () => 'Pay $5',
      run: (state, ctx) => authorizeAndPay(state, ctx, 'Your login'),
    },
  ],
}

function firstSignerLabel(choice: string) {
  return choice === 'private-key'
    ? 'private key'
    : `${loginWords[choiceMethod(choice) ?? 'google']} login`
}

const addSigners: DemoScript = {
  title: 'Add a passkey to your account',
  choices: firstSignerChoices,
  choiceLabel: 'First signer',
  needs: (choice) => {
    const login = choiceMethod(choice)
    return login ? ['passkey', login] : ['passkey']
  },
  setup: [
    {
      title: 'Create your account',
      action: (state) =>
        state.choice === 'private-key'
          ? 'Create with a private key'
          : `Sign in with ${loginWords[choiceMethod(state.choice) ?? 'google']}`,
      signIn: (state) => choiceMethod(state.choice),
      run: async (state, ctx) => {
        const login = choiceMethod(state.choice)
        let next = state
        if (login)
          next = (
            await signInStep(state, ctx, login, {
              id: 'login',
              label: signerKinds[login].label,
              pending: false,
            })
          ).state
        const privateKey = login ? undefined : ctx.chain.generatePrivateKey()
        const created = await createAccount(next, ctx, login ?? 'private-key', privateKey)
        return {
          state: created.state,
          result: `Created ${short(addressOf(created.state.account))} with your ${firstSignerLabel(state.choice)} as its only signer (weight 1, threshold 1)${privateKey ? ', a key this page generated and holds' : ''}. The devnet faucet funded it.`,
          hashes: hashes(['Faucet', created.hash]),
        }
      },
    },
  ],
  steps: [
    {
      title: 'Create the new signer',
      action: () => 'Create passkey',
      run: async (state, ctx) => {
        const { state: next, key } = await preparePasskey(state, ctx, 'New passkey')
        const { name, unlock } = thisDevice()
        return {
          state: next,
          result: `You created a passkey with ${unlock} on this ${name}. Its address is ${short(key.address)}. It isn’t a signer yet.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Read the current signers',
      action: () => 'Read signers',
      run: async (state, ctx) => {
        const { info, matches } = await onChainConfig(ctx, state.account)
        const next = withLocal(state, {
          id: 'update',
          icon: 'update',
          label: 'Update draft',
          detail: `Add the passkey at weight 1 · needs weight ${state.account.threshold}`,
          status: 'pending',
        })
        return {
          state: next,
          result: `Config v${info.config.version}: ${describeConfig(state.account)}. ${commitmentNote(matches, info.config.version)}`,
          hashes: [],
        }
      },
    },
    {
      title: 'Approve the update with the current signers',
      action: (state) => `Approve with your ${firstSignerLabel(state.choice)}`,
      run: async (state, ctx) => {
        const approvers = nextApprovers(state.account)
        const { account: next } = addHeldPasskey(state.account, state.held, 1)
        const sent = await update(state, ctx, next)
        let done = updateLocal(sent.state, 'update', {
          detail: `Approved by ${approverNames(approvers)} · sent`,
          status: 'done',
        })
        done = updateLocal(done, 'passkey', {
          status: 'done',
          detail: `WebAuthn · ${thisDevice().unlock} · signer`,
        })
        done = {
          ...done,
          held: {
            ...done.held,
            notes: {
              approvers: approverNames(approvers),
              threshold: String(state.account.threshold),
            },
          },
        }
        return {
          state: done,
          result: `${upperFirst(approverNames(approvers))} approved config v${sent.state.account.version}, which adds the passkey at weight 1. Same address and balance.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Collect the remaining approvals',
      action: () => 'Check approvals',
      run: async (state) => ({
        state,
        result: `None needed: ${state.held.notes.approvers ?? 'one signer'} reached threshold ${state.held.notes.threshold ?? '1'} on its own, so the update landed with one approval.`,
        hashes: [],
      }),
    },
    {
      title: 'Confirm the account survives losing any one signer',
      action: () => 'Check recovery',
      run: async (state, ctx) => {
        const check = recoveryCheck(state.account)
        const { matches } = await onChainConfig(ctx, state.account)
        return {
          state,
          result:
            `${check.message} ${matches ? `Tempo’s commitment matches config v${state.account.version}.` : ''}`.trim(),
          hashes: [],
        }
      },
    },
  ],
}

function upperFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Create the account with a Privy login and authorize a "This browser" device key. */
const privyWithDeviceKey: DemoAction = {
  title: 'Create your account',
  action: () => 'Sign in with Privy',
  signIn: () => 'privy',
  run: async (state, ctx) => {
    const signedIn = await signInStep(state, ctx, 'privy', {
      id: 'login',
      label: 'Privy login',
      pending: false,
    })
    const created = await createAccount(signedIn.state, ctx, 'privy')
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
      result: `Created ${short(addressOf(done.account))} with ${signedIn.who} as its signer, and your login authorized a device key in this browser.`,
      hashes: hashes(['Faucet', created.hash], ['Authorize', authorized.hash]),
    }
  },
}

const multiFactor: DemoScript = {
  title: 'Turn on multi-factor approval',
  needs: () => ['passkey', 'privy', 'google'],
  setup: [privyWithDeviceKey],
  steps: [
    {
      title: 'Sign the customer in with Google',
      action: () => 'Sign in with Google',
      signIn: () => 'google',
      run: async (state, ctx) => {
        const signedIn = await signInStep(state, ctx, 'google', {
          id: 'google',
          label: 'Google login',
          pending: true,
        })
        return {
          state: signedIn.state,
          result: `Signed in as ${signedIn.who}. It isn’t a signer yet.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Create the passkey',
      action: () => 'Create passkey',
      run: async (state, ctx) => {
        const { state: next, key } = await preparePasskey(state, ctx, 'Passkey')
        return {
          state: next,
          result: `You created a passkey with ${thisDevice().unlock}. Its address is ${short(key.address)}.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Switch to the multi-factor configuration',
      action: () => 'Send the update',
      run: async (state, ctx) => {
        const before = state.account
        const approvers = nextApprovers(before)
        const withPasskey = addHeldPasskey(before, state.held, 2).account
        const withGoogle = checked(addSigner(withPasskey, 'google'))
        addedSigner(withPasskey, withGoogle)
        const next = asOneUpdate(before, checked(setThreshold(withGoogle, 2)))
        const sent = await update(state, ctx, next)
        let done = updateLocal(sent.state, 'google', {
          status: 'done',
          detail: 'Google login · signer',
        })
        done = updateLocal(done, 'passkey', {
          status: 'done',
          detail: `WebAuthn · ${thisDevice().unlock} · signer`,
        })
        return {
          state: done,
          result: `One update, config v${done.account.version}: ${describeConfig(done.account)}. ${upperFirst(approverNames(approvers))} approved it alone, at the old threshold 1.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Keep paying with the device key',
      action: () => 'Pay $5 with the device key',
      run: async (state, ctx) => {
        const paid = await payWithKey(state, ctx, 'This browser', 5)
        return {
          state: paid.state,
          result: `The device key paid $5 with no prompt: signer changes don’t touch access keys. ${keyLeft(paid.state.account, 'This browser')} left today.`,
          hashes: hashes(['Pay $5', paid.hash]),
        }
      },
    },
    {
      title: 'Authorize new device keys with the passkey or both logins',
      action: () => 'Authorize with the passkey',
      run: async (state, ctx) => {
        const approvers = nextApprovers(state.account)
        const next = addAccessKey(state.account, 'browser')
        const key = addedKey(state.account, next)
        const sent = await update(state, ctx, next)
        return {
          state: withLocal(sent.state, {
            id: 'second-key',
            icon: 'laptop',
            label: key.name,
            detail: 'WebCrypto P-256 · authorized · 500 USD a day',
            status: 'done',
          }),
          result: `${upperFirst(approverNames(approvers))} (weight ${approvers.reduce((sum, signer) => sum + signer.weight, 0)}) authorized ${key.name}, a new key in this browser, as a new device would create.`,
          hashes: hashes(['Authorize', sent.hash]),
        }
      },
    },
  ],
}

function approverKeyDetail(ctx: GuideContext, privateKey: string) {
  return `secp256k1 · ${short(ctx.chain.addressOf(privateKey))} · held by this page`
}

const rotateKeys: DemoScript = {
  title: 'Rotate an approver key',
  needs: () => [],
  setup: [
    {
      title: 'Create the account',
      action: () => 'Create with 3 approver keys',
      run: async (state, ctx) => {
        const keys = [1, 2, 3].map(() => ctx.chain.generatePrivateKey())
        const service = ctx.chain.generatePrivateKey()
        // v0: Approver key 1 alone, the address comes from it.
        const first = await createAccount(state, ctx, 'private-key', keys[0])
        let account = patchSigner(first.state.account, first.signer.id, { name: 'Approver key 1' })
        const before = account
        // v1: all three keys, any 2 of 3.
        for (const [index, privateKey] of keys.slice(1).entries()) {
          const next = checked(addSigner(account, 'private-key', { privateKey }))
          const signer = addedSigner(account, next)
          account = patchSigner(next, signer.id, {
            name: `Approver key ${index + 2}`,
            detail: approverKeyDetail(ctx, privateKey),
          })
        }
        account = asOneUpdate(before, checked(setThreshold(account, 2)))
        const configured = await update({ ...first.state, account: before }, ctx, account)
        // An access key the team's backend uses.
        const withKey = addAccessKey(configured.state.account, 'private-key', {
          privateKey: service,
        })
        const key = addedKey(configured.state.account, withKey)
        const authorized = await update(
          configured.state,
          ctx,
          patchKey(withKey, key.id, { name: 'Service key' }),
        )
        const done = {
          ...authorized.state,
          held: { ...authorized.state.held, privateKeys: { service } },
        }
        return {
          state: done,
          result: `Created ${short(addressOf(done.account))}: any 2 of Approver keys 1, 2, and 3 (config v${done.account.version}), with a service access key. This page generated and holds every key.`,
          hashes: hashes(
            ['Faucet', first.hash],
            ['Config v1', configured.hash],
            ['Authorize', authorized.hash],
          ),
        }
      },
    },
  ],
  steps: [
    {
      title: 'Open the account by its address',
      action: () => 'Open account',
      run: async (state, ctx) => {
        const { info, matches } = await onChainConfig(ctx, state.account)
        return {
          state,
          result: `Config v${info.config.version} at ${short(addressOf(state.account))}: ${describeConfig(state.account)}. ${commitmentNote(matches, info.config.version)}`,
          hashes: [],
        }
      },
    },
    {
      title: 'Swap the key at the same weight',
      action: () => 'Generate the new key',
      run: async (state, ctx) => {
        const privateKey = ctx.chain.generatePrivateKey()
        const next = withLocal(
          {
            ...state,
            held: {
              ...state.held,
              privateKeys: { ...state.held.privateKeys, replacement: privateKey },
            },
          },
          {
            id: 'new-key',
            icon: 'key',
            label: 'Approver key 4',
            detail: `${approverKeyDetail(ctx, privateKey)} · not a signer yet`,
            status: 'pending',
          },
        )
        return {
          state: next,
          result: `Generated Approver key 4 (${short(ctx.chain.addressOf(privateKey))}). The draft swaps it in for Approver key 2 at weight 1.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Approve with the current signers',
      action: () => 'Approve with 2 keys',
      run: async (state, ctx) => {
        const privateKey = state.held.privateKeys.replacement
        const old = configuredSigners(state.account).find(
          (signer) => signer.name === 'Approver key 2',
        )
        if (!privateKey || !old) throw new DemoError('Generate the new key first.')
        const approvers = nextApprovers(state.account)
        const removed = checked(removeSigner(state.account, old.id))
        const added = checked(addSigner(removed, 'private-key', { privateKey }))
        const signer = addedSigner(removed, added)
        const next = asOneUpdate(
          state.account,
          patchSigner(added, signer.id, {
            name: 'Approver key 4',
            detail: approverKeyDetail(ctx, privateKey),
          }),
        )
        const sent = await update(state, ctx, next)
        return {
          state: updateLocal(sent.state, 'new-key', {
            detail: `${approverKeyDetail(ctx, privateKey)} · signer`,
            status: 'done',
          }),
          result: `${approverNames(approvers)} approved config v${sent.state.account.version}. Approver key 2 can’t approve anymore.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Revoke the access keys you no longer trust',
      action: () => 'Revoke the service key',
      run: async (state, ctx) => {
        const key = state.account.accessKeys.find((item) => item.name === 'Service key')
        if (!key) throw new DemoError('No service key to revoke.')
        const approvers = nextApprovers(state.account)
        const sent = await update(state, ctx, revokeAccessKey(state.account, key.id))
        return {
          state: sent.state,
          result: `${approverNames(approvers)} revoked the service key. Rotating a signer doesn’t revoke access keys on its own.`,
          hashes: hashes(['Revoke', sent.hash]),
        }
      },
    },
  ],
}

/** The account's Google login: the one an email change replaces. */
function googleLogin(account: SandboxAccount) {
  const signer = configuredSigners(account).find((item) => item.kind === 'google')
  // The devnet adapter names a login after its sign-in; until then it has only its label.
  return signer && { ...signer, subject: signer.subject ?? signer.name }
}

const changeEmail: DemoScript = {
  title: 'Change your Google login',
  needs: () => ['google'],
  setup: [
    {
      title: 'Create your account',
      action: () => 'Sign in with Google',
      signIn: () => 'google',
      run: async (state, ctx) => {
        const signedIn = await signInStep(state, ctx, 'google', {
          id: 'login',
          label: 'Google login',
          pending: false,
        })
        const created = await createAccount(signedIn.state, ctx, 'google')
        return {
          state: created.state,
          result: `Created ${short(addressOf(created.state.account))} with ${signedIn.who} as its only signer. The devnet faucet funded it.`,
          hashes: hashes(['Faucet', created.hash]),
        }
      },
    },
  ],
  steps: [
    {
      title: 'Sign the customer in with the new email',
      action: () => 'Sign in with another Google account',
      signIn: () => 'google',
      run: async (state, ctx) => {
        const info = await ctx.adapter.inspect(addressOf(state.account))
        const signedIn = await signInStep(state, ctx, 'google', {
          id: 'new-login',
          label: 'New Google login',
          pending: true,
        })
        const address = signedIn.result.owner.address.toLowerCase()
        if (info?.config.owners.some(({ owner }) => owner.toLowerCase() === address))
          throw new DemoError(
            'That’s the Google account already on the account. Sign in with a different one.',
          )
        return {
          state: signedIn.state,
          result: `Signed in as ${signedIn.who}. It isn’t a signer yet.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Replace the old login at the same weight',
      action: () => 'Draft the swap',
      run: async (state, ctx) => {
        const old = googleLogin(state.account)
        const signIn = state.held.signIns[0]
        if (!old || !signIn) throw new DemoError('Sign in with the new Google account first.')
        const next = ctx.chain.identity(signIn).subject
        return {
          state: withLocal(state, {
            id: 'update',
            icon: 'update',
            label: 'Update draft',
            detail: `Remove ${old.subject}, add ${next} at weight ${old.weight} · needs weight ${state.account.threshold}`,
            status: 'pending',
          }),
          result: `Draft: ${next} replaces ${old.subject} at weight ${old.weight}. The threshold stays ${state.account.threshold}.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Approve the swap',
      action: (state) => `Approve with ${googleLogin(state.account)?.subject ?? 'the old login'}`,
      run: async (state, ctx) => {
        const old = googleLogin(state.account)
        if (!old) throw new DemoError('The account has no Google login.')
        const added = checked(addSigner(state.account, 'google'))
        addedSigner(state.account, added)
        const next = asOneUpdate(state.account, checked(removeSigner(added, old.id)))
        const sent = await update(state, ctx, next)
        const now = googleLogin(sent.state.account)
        let done = updateLocal(sent.state, 'update', {
          detail: `Approved by ${old.subject} · sent`,
          status: 'done',
        })
        done = updateLocal(done, 'new-login', {
          detail: `${now?.subject} · signer`,
          status: 'done',
        })
        done = updateLocal(done, 'login', { detail: `${old.subject} · removed`, status: 'gone' })
        return {
          state: done,
          result: `${old.subject} approved config v${done.account.version}. ${now?.subject} is the account’s login now.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Open the account by its saved address from now on',
      action: () => 'Compare addresses',
      run: async (state, ctx) => {
        const saved = addressOf(state.account)
        const info = await ctx.adapter.inspect(saved)
        const login = info?.config.owners[0]
        if (!login) throw new DemoError('This page didn’t create that account on devnet.')
        const inferred = ctx.chain.inferAddress({
          owners: [{ owner: login.owner, weight: 1 }],
          threshold: 1,
        })
        const [savedBalance, inferredBalance] = await Promise.all([
          ctx.chain.balance(saved),
          ctx.chain.balance(inferred),
        ])
        return {
          state,
          result: `The saved address ${short(saved)} holds ${formatBalance(savedBalance)}. Deriving an address from your new login gives ${short(inferred)}, a different account holding ${formatBalance(inferredBalance)}.`,
          hashes: [],
        }
      },
    },
  ],
}

const recover: DemoScript = {
  title: 'Recover after losing your passkey',
  needs: () => ['passkey', 'privy', 'google'],
  setup: [
    privyWithDeviceKey,
    {
      title: 'Add your Google login and a passkey',
      action: () => 'Sign in with Google',
      signIn: () => 'google',
      run: async (state, ctx) => {
        const signedIn = await signInStep(state, ctx, 'google', {
          id: 'google',
          label: 'Google login',
          pending: false,
        })
        const before = signedIn.state.account
        const approvers = nextApprovers(before)
        const withPasskey = checked(addSigner(before, 'passkey'))
        const passkey = addedSigner(before, withPasskey)
        const weighted = checked(setSignerWeight(withPasskey, passkey.id, 2))
        const withGoogle = checked(addSigner(weighted, 'google'))
        addedSigner(weighted, withGoogle)
        const next = asOneUpdate(before, checked(setThreshold(withGoogle, 2)))
        const sent = await update(signedIn.state, ctx, next)
        return {
          state: withLocal(sent.state, {
            id: 'old-passkey',
            icon: 'passkey',
            label: 'Passkey',
            detail: `WebAuthn · ${thisDevice().unlock} · signer`,
            status: 'done',
          }),
          result: `Config v${sent.state.account.version}: ${describeConfig(sent.state.account)}. ${upperFirst(approverNames(approvers))} approved it. You created the passkey during the update.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Treat the passkey as lost',
      action: () => 'Treat the passkey as lost',
      run: async (state) => {
        const passkey = configuredSigners(state.account).find((signer) => signer.kind === 'passkey')
        if (!passkey) throw new DemoError('The account has no passkey.')
        const next = {
          ...state,
          account: setSignerLost(state.account, passkey.id, true),
        }
        return {
          state: updateLocal(next, 'old-passkey', {
            label: 'Lost passkey',
            detail: 'Treated as lost · still a signer on Tempo',
            status: 'gone',
          }),
          result:
            'From here on the demo treats the passkey as lost: it won’t approve. It stays a signer on Tempo until you replace it.',
          hashes: [],
        }
      },
    },
  ],
  steps: [
    {
      title: 'Create the replacement passkey on the new device',
      action: () => 'Create passkey',
      run: async (state, ctx) => {
        const { state: next, key } = await preparePasskey(state, ctx, 'Replacement passkey')
        return {
          state: next,
          result: `A new passkey in this browser, standing in for the new device. Its address is ${short(key.address)}. It isn’t a signer yet.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Sign in with the remaining signers',
      action: () => 'Sign in with Privy and Google',
      signIn: () => 'privy',
      run: async (state, ctx) => {
        const info = await ctx.adapter.inspect(addressOf(state.account))
        const isOwner = (result: SignInResult) =>
          info?.config.owners.some(
            ({ owner }) => owner.toLowerCase() === result.owner.address.toLowerCase(),
          )
        const subject = (kind: SignerKind) =>
          configuredSigners(state.account).find((signer) => signer.kind === kind)?.subject
        const privy = await signInStep(state, ctx, 'privy', {
          id: 'login',
          label: 'Privy login',
          pending: false,
        })
        if (!isOwner(privy.result))
          throw new DemoError(
            `That isn’t this account’s Privy login. Sign in as ${subject('privy')}.`,
          )
        const google = await signInStep(privy.state, ctx, 'google', {
          id: 'google',
          label: 'Google login',
          pending: false,
        })
        if (!isOwner(google.result))
          throw new DemoError(
            `That isn’t this account’s Google login. Sign in as ${subject('google')}.`,
          )
        const validUntil = Math.min(privy.result.owner.validUntil, google.result.owner.validUntil)
        return {
          state: google.state,
          result: `Your Privy and Google logins signed in. Together they have weight 2, and both approve until ${until(validUntil)}.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Replace the lost signer in one update',
      action: () => 'Replace the passkey',
      run: async (state, ctx) => {
        const lost = configuredSigners(state.account).find((signer) => signer.lost)
        if (!lost) throw new DemoError('No lost signer to replace.')
        const approvers = nextApprovers(state.account)
        const removed = checked(removeSigner(state.account, lost.id))
        const { account: added, signer } = addHeldPasskey(removed, state.held, 2)
        const named = patchSigner(added, signer.id, { name: 'New passkey' })
        const sent = await update(state, ctx, asOneUpdate(state.account, named))
        return {
          state: updateLocal(sent.state, 'passkey', {
            detail: `WebAuthn · ${thisDevice().unlock} · signer`,
            status: 'done',
          }),
          result: `${upperFirst(approverNames(approvers))} approved config v${sent.state.account.version} together: the new passkey (2) replaces the lost one, which can’t approve anything now.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Revoke the access keys the lost signer could reach',
      action: () => 'Revoke with the new passkey',
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

const exportAccount: DemoScript = {
  title: 'Move your account to your own passkey',
  needs: () => ['passkey'],
  setup: [
    {
      title: 'Create the app’s account',
      action: () => 'Create the account',
      run: async (state, ctx) => {
        const signerKey = ctx.chain.generatePrivateKey()
        const appKey = ctx.chain.generatePrivateKey()
        const created = await createAccount(state, ctx, 'private-key', signerKey)
        const named = patchSigner(created.state.account, created.signer.id, { name: 'App signer' })
        const withKey = addAccessKey(named, 'private-key', { privateKey: appKey })
        const key = addedKey(named, withKey)
        const authorized = await update(
          { ...created.state, account: named },
          ctx,
          patchKey(withKey, key.id, { name: 'App access key' }),
        )
        const done = withLocal(authorized.state, {
          id: 'app',
          icon: 'server',
          label: 'Your app',
          detail: 'Holds the account’s signer and an access key · this page',
          status: 'ready',
        })
        return {
          state: done,
          result: `This page plays your app: it generated and holds the only signer of ${short(addressOf(done.account))} and an access key.`,
          hashes: hashes(['Faucet', created.hash], ['Authorize', authorized.hash]),
        }
      },
    },
  ],
  steps: [
    {
      title: 'Get the customer’s signer address',
      action: () => 'Create passkey',
      run: async (state, ctx) => {
        const { state: next, key } = await preparePasskey(state, ctx, 'Your passkey')
        return {
          state: next,
          result: `You created a passkey with ${thisDevice().unlock}. Its address, ${short(key.address)}, is what you’d send the app. It isn’t a signer yet.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Revoke your app’s access keys',
      action: () => 'Revoke the app’s key',
      run: async (state, ctx) => {
        const key = state.account.accessKeys.find((item) => item.name === 'App access key')
        if (!key) throw new DemoError('The app holds no access key.')
        const sent = await update(state, ctx, revokeAccessKey(state.account, key.id))
        return {
          state: sent.state,
          result: 'The app signer revoked the app’s access key first, while it can still approve.',
          hashes: hashes(['Revoke', sent.hash]),
        }
      },
    },
    {
      title: 'Swap the signers in one update',
      action: () => 'Swap signers',
      run: async (state, ctx) => {
        const app = configuredSigners(state.account).find((signer) => signer.name === 'App signer')
        if (!app) throw new DemoError('No app signer to replace.')
        const { account: added } = addHeldPasskey(state.account, state.held, 1)
        const next = asOneUpdate(state.account, checked(removeSigner(added, app.id)))
        const sent = await update(state, ctx, next)
        let done = updateLocal(sent.state, 'passkey', {
          detail: `WebAuthn · ${thisDevice().unlock} · the only signer`,
          status: 'done',
        })
        done = updateLocal(done, 'app', { detail: 'Can’t approve anything now', status: 'gone' })
        return {
          state: done,
          result: `The app signer approved its own removal in config v${done.account.version}: your passkey is the only signer now. Same address and balance.`,
          hashes: hashes(['Update', sent.hash]),
        }
      },
    },
    {
      title: 'Send the customer to their wallet',
      action: () => 'Check the account',
      run: async (state, ctx) => {
        const address = addressOf(state.account)
        const { matches } = await onChainConfig(ctx, state.account)
        const balance = await ctx.chain.balance(address)
        return {
          state,
          result:
            `${short(address)} still holds ${formatBalance(balance)}. ${matches ? 'Tempo’s commitment matches the config with your passkey as the only signer.' : ''}`.trim(),
          hashes: [],
        }
      },
    },
  ],
}

/** Create the account with a passkey on this device. */
const passkeyAccount = (title: string, name?: string): DemoAction => ({
  title,
  action: () => 'Create with a passkey',
  run: async (state, ctx) => {
    const created = await createAccount(
      name ? { ...state, account: { ...state.account, name } } : state,
      ctx,
      'passkey',
    )
    return {
      state: created.state,
      result: `Created ${short(addressOf(created.state.account))} with your passkey (${thisDevice().unlock}) as its only signer. The devnet faucet funded it.`,
      hashes: hashes(['Faucet', created.hash]),
    }
  },
})

const backendAutomation: DemoScript = {
  title: 'Give a backend a scoped key',
  needs: () => ['passkey'],
  setup: [passkeyAccount('Create your account')],
  steps: [
    {
      title: 'Create the key in your backend',
      action: () => 'Generate the key',
      run: async (state, ctx) => {
        const privateKey = ctx.chain.generatePrivateKey()
        const keyId = ctx.chain.addressOf(privateKey)
        const next = withLocal(
          {
            ...state,
            held: {
              ...state.held,
              privateKeys: { ...state.held.privateKeys, backend: privateKey },
            },
          },
          {
            id: 'server',
            icon: 'server',
            label: 'Backend key',
            detail: `secp256k1 · ${short(keyId)} · not authorized yet`,
            status: 'pending',
          },
        )
        return {
          state: next,
          result: `This page generated the key your backend would keep. Its key ID is ${short(keyId)}.`,
          hashes: [],
          secret: { label: 'The key you’d keep in your backend, shown once', value: privateKey },
        }
      },
    },
    {
      title: 'Have the customer’s signers approve it once',
      action: () => 'Approve with your passkey',
      run: async (state, ctx) => {
        const privateKey = state.held.privateKeys.backend
        if (!privateKey) throw new DemoError('Generate the key first.')
        const withKey = addAccessKey(state.account, 'private-key', { privateKey })
        const key = addedKey(state.account, withKey)
        const next = patchKey(withKey, key.id, {
          name: 'Backend key',
          limit: 1_000,
          period: 'day',
          expiresInDays: 90,
          recipients: 'approved',
        })
        const sent = await update(state, ctx, next)
        return {
          state: updateLocal(sent.state, 'server', {
            detail: `secp256k1 · ${short(ctx.chain.addressOf(privateKey))} · authorized`,
            status: 'done',
          }),
          result:
            'Your passkey approved the backend key once: up to 1,000 USD a day, to one approved address, for 90 days.',
          hashes: hashes(['Authorize', sent.hash]),
        }
      },
    },
    {
      title: 'Move funds without prompts',
      action: () => 'Send $50',
      run: async (state, ctx) => {
        const paid = await payWithKey(state, ctx, 'Backend key', 50)
        return {
          state: paid.state,
          result: `The backend key sent $50 to its one approved address with no prompt. ${keyLeft(paid.state.account, 'Backend key')} left today.`,
          hashes: hashes(['Pay $50', paid.hash]),
        }
      },
    },
    {
      title: 'Show the key and let the customer revoke it',
      action: () => 'Revoke with your passkey',
      run: async (state, ctx) => {
        const key = state.account.accessKeys.find((item) => item.name === 'Backend key')
        const privateKey = state.held.privateKeys.backend
        if (!key || !privateKey) throw new DemoError('No backend key to revoke.')
        const left = await ctx.chain.remaining(
          addressOf(state.account),
          ctx.chain.addressOf(privateKey),
        )
        const sent = await update(state, ctx, revokeAccessKey(state.account, key.id))
        return {
          state: updateLocal(sent.state, 'server', {
            detail: 'secp256k1 · revoked',
            status: 'gone',
          }),
          result: `Tempo reported ${formatUsd(left)} USD left today. Your passkey revoked the key: the backend can’t pay from this account anymore.`,
          hashes: hashes(['Revoke', sent.hash]),
        }
      },
    },
  ],
}

const teamMembers = [1, 2, 3].map((index) => ({
  id: `member-${index}`,
  name: `Member ${index}`,
  weight: 1,
}))

function teamKey(account: SandboxAccount) {
  const next = addAccessKey(account, 'team')
  const key = addedKey(account, next)
  return patchKey(next, key.id, {
    name: 'Team account',
    delegate: { threshold: 2, members: teamMembers },
  })
}

const teamAccounts: DemoScript = {
  title: 'Give a team its own budget',
  needs: () => ['passkey'],
  setup: [passkeyAccount('Create your treasury', 'Your treasury')],
  steps: [
    {
      title: 'Create the team account',
      action: () => 'Create team account',
      run: async (state, ctx) => {
        const draft = draftAccessKey('team', {
          name: 'Team account',
          delegate: { threshold: 2, members: teamMembers },
        })
        const key = await ctx.adapter.prepareAccessKey(draft, callOptions(state, ctx))
        const next = withLocal(
          {
            ...state,
            held: {
              ...state.held,
              accessKeys: [...state.held.accessKeys, { kind: 'account', key }],
            },
          },
          {
            id: 'team',
            icon: 'team',
            label: 'Team account',
            detail: `Any 2 of Members 1–3 · ${short(key.address)}`,
            status: 'ready',
          },
        )
        return {
          state: next,
          result: `A team account at ${short(key.address)}: any 2 of Members 1, 2, and 3. This page generated the three member keys.`,
          hashes: [],
        }
      },
    },
    {
      title: 'Authorize it from the treasury',
      action: () => 'Approve with your passkey',
      run: async (state, ctx) => {
        const teamId = state.held.accessKeys.find((item) => item.kind === 'account')?.key.address
        if (!teamId) throw new DemoError('Create the team account first.')
        const sent = await update(state, ctx, teamKey(state.account))
        return {
          state: updateLocal(sent.state, 'team', {
            detail: `Any 2 of Members 1–3 · ${short(teamId)} · authorized`,
            status: 'done',
          }),
          result: 'Your passkey authorized the team account on the treasury: 2,000 USD a day.',
          hashes: hashes(['Authorize', sent.hash]),
        }
      },
    },
    {
      title: 'Pay as the team',
      action: () => 'Members 1 and 2 pay $50',
      run: async (state, ctx) => {
        const paid = await payWithKey(state, ctx, 'Team account', 50)
        return {
          state: paid.state,
          result:
            'Members 1 and 2 signed as the team account. The $50 came from the treasury’s balance.',
          hashes: hashes(['Pay $50', paid.hash]),
        }
      },
    },
    {
      title: 'Track the budget',
      action: () => 'Read the budget',
      run: async (state, ctx) => {
        const info = await ctx.adapter.inspect(addressOf(state.account))
        const key = state.account.accessKeys.find((item) => item.name === 'Team account')
        const keyId = key && info?.keys.find((item) => item.id === key.id)?.keyId
        if (!key || !keyId) throw new DemoError('The team account isn’t authorized.')
        const left = await ctx.chain.remaining(addressOf(state.account), keyId)
        return {
          state,
          result: `Tempo reports ${formatUsd(left)} of ${formatUsd(key.limit)} USD left today for the team.`,
          hashes: [],
        }
      },
    },
  ],
}

export const guideScripts: Record<GuideId, DemoScript> = {
  'identity-provider': identityProvider,
  'add-signers': addSigners,
  'multi-factor': multiFactor,
  'rotate-keys': rotateKeys,
  'change-email': changeEmail,
  recover,
  export: exportAccount,
  'backend-automation': backendAutomation,
  'team-accounts': teamAccounts,
}

export const guideDemoIds = Object.keys(guideScripts) as GuideId[]

/** The setup actions, then the guide's steps. */
export function scriptActions(script: DemoScript) {
  return [...script.setup, ...script.steps]
}

/** A script's starting state, with the reader's first choice. */
export function scriptStart(guide: GuideId, choice?: string) {
  const script = guideScripts[guide]
  return startState(
    choice ?? script.choices?.[0]?.id ?? '',
    guide === 'team-accounts' ? 'Your treasury' : undefined,
  )
}
