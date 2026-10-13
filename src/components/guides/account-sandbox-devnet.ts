/**
 * Devnet adapter for the account sandbox. It sends the sandbox's actions as real transactions on
 * the internal multisig-1113 devnet, which runs configurable accounts (TIP-1107 to TIP-1114) and
 * configurable access keys (TIP-1111).
 *
 * - Only real signing runs on devnet. Passkeys are real WebAuthn passkeys, so creating and signing
 *   with one prompts for Touch ID or Face ID. Other keys are generated in this browser and held in
 *   memory for this page session.
 * - Access keys the reader adds are real: a generated private key (shown once), "This browser" (a
 *   non-extractable WebCrypto key that signs silently), and "This [device]" (a platform passkey
 *   that asks on each payment). Example keys that presets load stay in-memory keys.
 * - Each account gets one funded devnet account per page session, keyed by preset and local
 *   address, so every sandbox showing the same preset shares it. Calls diff the sandbox's applied
 *   configuration against the on-chain state, so any sandbox can act on the shared account. Custom
 *   accounts (not presets) work the same way.
 * - Nothing is simulated: every signer is a private key, a device key, or a passkey that signs
 *   for real.
 *
 * The devnet is plain HTTP on the tailnet, so only `http:` pages (local dev and preview) can reach
 * it. Import this module dynamically so it stays out of production bundles.
 */
import {
  concat,
  encodeFunctionData,
  type Hex,
  isAddressEqual,
  keccak256,
  parseAbi,
  toHex,
} from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import * as Tempo from 'viem/tempo'
import {
  type AccessKey,
  type AccessKeyKind,
  type AccountSandboxAdapter,
  type ActionRequest,
  type ActionResult,
  applyAction,
  approvalSets,
  evaluateAction,
  type FailureCode,
  formatBalance,
  formatUsd,
  isCreated,
  type LogEntry,
  notCreatedNotice,
  notUpgradedNotice,
  type PresetId,
  remainingLimit,
  type SandboxAccount,
  type Signer,
  type SignerKind,
  shortAddress,
  signerKinds,
  upgradeLegacyAccount,
} from './account-sandbox'

// ---------------------------------------------------------------------------
// viem

type Address = `0x${string}`
/** A configurable account configuration. */
export type ChainConfig = Tempo.AccountConfig.Config
type ConfigOwner = Tempo.AccountConfig.Owner
type OwnerAccount = Tempo.Account.RootAccount
type AccessKeyAccount = Tempo.Account.AccessKeyAccount

const {
  Account,
  AccountConfig,
  P256,
  Period,
  PublicKey,
  Scopes,
  Secp256k1,
  WebAuthnP256,
  WebCryptoP256,
} = Tempo
const { getCommitment } = AccountConfig

export const devnetRpcUrl = 'http://multisig-1113-nodes-rpc-service.tail388b2e.ts.net:8545'
export const devnetChainId = 31_318
const devnetChainIdHex = '0x7a56'
/** AlphaUSD pays for every payment and every fee. */
export const devnetToken: Address = '0x20c0000000000000000000000000000000000001'
const tokenDecimals = 6
const unitsPerUsd = 10 ** tokenDecimals
/** Gas estimation rejects configurable delegates, so team-account keys send a fixed limit. */
const delegateGas = 1_500_000n

function createDevnetClient(rpcUrl: string) {
  return Tempo.createClient({
    chain: Tempo.Chain.devnet,
    feeToken: devnetToken,
    transport: Tempo.http(rpcUrl, { retryCount: 0 }),
  })
}

// ---------------------------------------------------------------------------
// Probe

/** True when this page can reach the devnet: an `http:` page and chain ID 31318. */
export async function checkDevnet(
  options: {
    url?: string
    timeoutMs?: number
    fetch?: typeof globalThis.fetch
    protocol?: string
  } = {},
): Promise<boolean> {
  const {
    url = devnetRpcUrl,
    timeoutMs = 8_000,
    fetch: fetchFn = globalThis.fetch,
    protocol = globalThis.location?.protocol,
  } = options
  // HTTPS pages can't call a plain-HTTP RPC (mixed content), so don't try.
  if (protocol === 'https:' || !fetchFn) return false
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      signal: controller.signal,
    })
    if (!response.ok) return false
    const body = (await response.json()) as { result?: unknown }
    return body.result === devnetChainIdHex
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

let probed: Promise<boolean> | undefined

/** `checkDevnet`, once per page. */
export function probeDevnet() {
  probed ??= checkDevnet()
  return probed
}

// ---------------------------------------------------------------------------
// Pure helpers

export function usdToUnits(amount: number) {
  return BigInt(Math.round(amount * unitsPerUsd))
}

export function unitsToUsd(units: bigint) {
  return Number(units) / unitsPerUsd
}

export type DevnetKeyType = 'secp256k1' | 'p256' | 'webAuthn'

/** The key each signer kind uses on devnet. */
export function devnetKeyType(kind: SignerKind): DevnetKeyType {
  const { scheme } = signerKinds[kind]
  if (scheme === 'webauthn') return 'webAuthn'
  if (scheme === 'p256') return 'p256'
  return 'secp256k1'
}

export type DevnetPrompt = 'create-passkey' | 'approve-passkey'

export const devnetPromptLabels: Record<DevnetPrompt, string> = {
  'create-passkey': 'Create the passkey in your browser…',
  'approve-passkey': 'Approve with your passkey…',
}

/** A key made before the step that adds it: a signer's address, or an access key's ID. */
export type PreparedKey = { address: Address }

export type DevnetCallOptions = {
  /**
   * Keys made earlier with `prepareSigner` or `prepareAccessKey`. A signer or access key that
   * maps to one uses it instead of making a new key.
   */
  prepared?: {
    signer?(signer: Signer): PreparedKey | undefined
    accessKey?(key: AccessKey): PreparedKey | undefined
  }
  /** Fires before each WebAuthn prompt, then with `null` once it settles. */
  onPrompt?: (prompt: DevnetPrompt | null) => void
}

/** A signer's key slot. Kind is part of it, so two sandboxes can't reuse a key across kinds. */
export function ownerKeyId(signer: Pick<Signer, 'id' | 'kind'>) {
  return `${signer.id}:${signer.kind}`
}

/** Everything that decides an access key's on-chain grant. */
export function accessKeySpec(key: AccessKey) {
  return JSON.stringify([
    key.kind,
    key.limit,
    key.period,
    key.expiresInDays,
    key.recipients,
    key.delegate ?? null,
  ])
}

const periodSeconds: Record<AccessKey['period'], number> = {
  day: Period.days(1),
  week: Period.weeks(1),
}

/** Map a sandbox access key to `authorizeKey` restrictions. */
export function authorizationParameters(
  key: AccessKey,
  recipient: Address,
  now = Math.floor(Date.now() / 1_000),
) {
  return {
    ...(key.expiresInDays ? { expiry: now + key.expiresInDays * Period.days(1) } : {}),
    limits: [
      { token: devnetToken, limit: usdToUnits(key.limit), period: periodSeconds[key.period] },
    ],
    scopes: [
      Scopes.tip20(devnetToken).transfer(
        key.recipients === 'approved' ? { recipients: [recipient] } : undefined,
      ),
    ],
  }
}

type ConfigShape = {
  owners: readonly { owner: string; weight: number }[]
  threshold: number
}

/** Same owners, weights, and threshold, ignoring order and address case. */
export function sameConfig(a: ConfigShape, b: ConfigShape) {
  const key = (config: ConfigShape) =>
    [
      config.threshold,
      ...config.owners.map(({ owner, weight }) => `${owner.toLowerCase()}:${weight}`).sort(),
    ].join(',')
  return key(a) === key(b)
}

/**
 * Pick current signers that reach `threshold`, as the sandbox does. Skips lost signers when it
 * can; every devnet key is held here, so a lost signer still signs when nothing else reaches it.
 */
export function chooseQuorum(candidates: readonly Signer[], threshold: number) {
  const usable = candidates.filter((signer) => !signer.lost && !signer.revoked)
  return (
    approvalSets(usable, threshold, { limit: 1 })[0] ??
    approvalSets(candidates, threshold, { limit: 1 })[0] ??
    null
  )
}

export const needsFunds = 'Get test funds first: transactions need fees.'

/** The native multisig precompile, which also upgrades plain key accounts in place. */
const nativeMultisig: Address = '0xAACC000000000000000000000000000000000000'
const upgradeAbi = parseAbi([
  'function upgradeAccount(uint8 threshold, (address owner, uint8 weight)[] owners) returns (bytes32)',
])

/** The configuration salt Tempo assigns an account upgraded in place. */
export function upgradeSalt(address: Address) {
  return keccak256(concat([toHex('tempo:multisig:upgrade'), address]))
}

/**
 * The configuration `upgradeAccount(threshold, owners)` records at a plain key account's own
 * address: owners sorted by address, the upgrade salt, and version 1.
 */
export function upgradeConfig(
  address: Address,
  owners: readonly ConfigOwner[],
  threshold: number,
): ChainConfig {
  return {
    owners: [...owners].sort((a, b) => a.owner.toLowerCase().localeCompare(b.owner.toLowerCase())),
    salt: upgradeSalt(address),
    threshold,
    version: 1n,
  }
}

/** Whether going from `previous` to `next` changes what devnet holds: signers or access keys. */
export function sendsTransaction(previous: SandboxAccount, next: SandboxAccount) {
  const state = (account: SandboxAccount) =>
    JSON.stringify([
      account.committed.threshold,
      account.committed.owners,
      account.accessKeys.map((key) => [key.id, key.status, accessKeySpec(key)]),
    ])
  return state(previous) !== state(next)
}

export type DevnetFailure = { code: FailureCode; message: string }

/** WebAuthn errors arrive as a DOMException somewhere in the `cause` chain. */
function webAuthnFailure(error: unknown): DevnetFailure | null {
  const seen = new Set<unknown>()
  let cause = error
  while (cause instanceof Error && !seen.has(cause)) {
    seen.add(cause)
    if (cause.name === 'NotAllowedError' || cause.name === 'AbortError')
      return { code: 'no-approver', message: 'Passkey cancelled.' }
    if (['NotSupportedError', 'SecurityError', 'InvalidStateError'].includes(cause.name))
      return { code: 'network-error', message: 'This browser can’t create a passkey.' }
    cause = cause.cause
  }
  return null
}

function errorText(error: unknown) {
  if (!error || typeof error !== 'object') return String(error)
  const { details, shortMessage, message } = error as {
    details?: string
    shortMessage?: string
    message?: string
  }
  return [details, shortMessage, message].filter(Boolean).join('\n')
}

/** Map a devnet or viem error to the engine's failure codes. */
export function mapDevnetError(error: unknown): DevnetFailure {
  if (error instanceof DevnetRejection) return { code: error.code, message: error.message }
  const passkey = webAuthnFailure(error)
  if (passkey) return passkey
  const text = errorText(error)
  const rules: [RegExp, FailureCode, string][] = [
    [/SpendingLimitExceeded/, 'key-limit', 'Over its limit on devnet.'],
    [/CallNotAllowed/, 'recipient-not-allowed', 'Not an approved recipient on devnet.'],
    [/KeyAlreadyRevoked/, 'key-revoked', 'Revoked on devnet.'],
    [/KeyExpired/, 'key-expired', 'Expired on devnet.'],
    [/KeyNotFound/, 'key-revoked', 'Not authorized on devnet.'],
    [
      /Local owners do not meet the threshold/,
      'insufficient-weight',
      'Below the devnet threshold.',
    ],
    [/commitment mismatch/i, 'invalid-config', 'Config is out of sync with devnet.'],
    [
      /insufficient (balance|funds)|InsufficientBalance/i,
      'insufficient-balance',
      'Not enough on devnet.',
    ],
    [
      /fetch failed|Failed to fetch|HTTP request failed|timed? ?out|NetworkError/i,
      'network-error',
      'Devnet unreachable.',
    ],
  ]
  for (const [pattern, code, message] of rules) if (pattern.test(text)) return { code, message }
  const reason = (text.split('\n')[0] ?? '')
    .replace(/^(Revm error: |execution reverted: ?)/i, '')
    .slice(0, 80)
  return { code: 'network-error', message: reason ? `Devnet: ${reason}` : 'Devnet error.' }
}

/** A devnet action the adapter refused or that failed, with the sandbox's failure code. */
export class DevnetRejection extends Error {
  constructor(
    readonly code: FailureCode,
    message: string,
  ) {
    super(message)
    this.name = 'DevnetRejection'
  }
}

/**
 * Replay an edit made on `previous` onto `prepared`, the same account after `prepare`. Keeps the
 * edit's state and puts its new log entries above the prepared log.
 */
export function rebaseOnto(
  previous: SandboxAccount,
  next: SandboxAccount,
  prepared: SandboxAccount,
): SandboxAccount {
  const sinceId = previous.log[0]?.id ?? 0
  const added = next.log.filter((entry) => entry.id > sinceId)
  const start = prepared.log[0]?.id ?? 0
  return {
    ...next,
    address: prepared.address,
    balance: prepared.balance,
    devnet: prepared.devnet,
    log: [
      ...added.map((entry, index) => ({ ...entry, id: start + added.length - index })),
      ...prepared.log,
    ].slice(0, 50),
  }
}

/**
 * Sandboxes showing the same preset share a devnet account. Custom accounts get their own, and so
 * does each account created from scratch: two can start with the same kind of first signer.
 */
export function sessionKey(account: Pick<SandboxAccount, 'presetId' | 'address' | 'genesis'>) {
  if (account.genesis?.nonce) return `${account.presetId}:${account.genesis.nonce}`
  return `${account.presetId}:${(account.address ?? '').toLowerCase()}`
}

/**
 * Whether an address already holds a configuration other than `config`, its v0. Then a new
 * account there would sign with a stale configuration, so it needs another salt.
 */
export function isForeignCommitment(commitment: Hex, config: ChainConfig) {
  return (
    BigInt(commitment) !== 0n && commitment.toLowerCase() !== getCommitment(config).toLowerCase()
  )
}

/** Attach `hash` to the newest log entry after `sinceId` that matches and has no hash. */
export function attachHash(
  account: SandboxAccount,
  match: (entry: LogEntry) => boolean,
  hash: string,
  sinceId: number,
): SandboxAccount {
  const index = account.log.findIndex((entry) => entry.id > sinceId && !entry.hash && match(entry))
  if (index < 0) return account
  return {
    ...account,
    log: account.log.map((entry, position) => (position === index ? { ...entry, hash } : entry)),
  }
}

function appendLog(account: SandboxAccount, entry: Omit<LogEntry, 'id'>): SandboxAccount {
  const id = (account.log[0]?.id ?? 0) + 1
  return { ...account, log: [{ id, ...entry }, ...account.log].slice(0, 50) }
}

/** The applied owners, with their applied weights. */
function committedSigners(account: SandboxAccount) {
  return account.committed.owners
    .map(({ id, weight }) => {
      const signer = account.signers.find((item) => item.id === id)
      return signer ? { ...signer, weight, revoked: false } : null
    })
    .filter((signer): signer is Signer => Boolean(signer))
}

// ---------------------------------------------------------------------------
// Sessions

/** A signer's devnet key, held in this page. */
type OwnerKey = {
  id: string
  kind: SignerKind
  name: string
  address: Address
  account: OwnerAccount
}

type AccessKeyEntry = {
  spec: string
  revoked: boolean
  /** A primitive key held in memory. */
  key?: AccessKeyAccount
  /** A team account (TIP-1111): its own configurable account, signed by its members. */
  team?: {
    address: Address
    threshold: number
    members: { id: string; weight: number; account: OwnerAccount }[]
  }
}

type Session = {
  presetId: PresetId
  address: Address
  config: ChainConfig
  owners: Map<string, OwnerKey>
  keys: Map<string, AccessKeyEntry>
  /** The approved recipient for every demo payment. */
  recipient: Address
  balance: number
  /** The latest configuration or access-key transaction. */
  lastUpdate?: string
  /**
   * A plain private-key account: no configuration on chain yet, so it pays as a single key and
   * `config` is what upgrading it in place will record.
   */
  legacy: boolean
  lock: Promise<unknown>
  /** The running call's prompt listener. Calls run one at a time per session. */
  prompts: Prompts
}

/** The running call's options. Calls run one at a time per session. */
type Prompts = {
  current?: DevnetCallOptions['onPrompt']
  prepared?: DevnetCallOptions['prepared']
}

function setPrompts(prompts: Prompts, options: DevnetCallOptions) {
  prompts.current = options.onPrompt
  prompts.prepared = options.prepared
}

function clearPrompts(prompts: Prompts) {
  prompts.current = undefined
  prompts.prepared = undefined
}

/** A signer's key: its address and the key held here. */
type OwnerMaterial = Pick<OwnerKey, 'address' | 'account'> & {
  /** Where a passkey sends its prompts: the call that's using it now. */
  prompter?: { prompts: Prompts }
}

/** An access key before it's bound to an account: its ID, and how to bind it. */
type AccessKeyMaterial =
  | { address: Address; team: NonNullable<AccessKeyEntry['team']> }
  | { address: Address; bind: (parent: Address, prompts: Prompts) => AccessKeyAccount }

/** The accounts that sign for `keys`. */
const localAccounts = (keys: readonly OwnerKey[]) => keys.map((key) => key.account)

/** The Account Keychain precompile, and each access key type's `SignatureType`. */
const accountKeychain: Address = '0xaAAAaaAA00000000000000000000000000000000'
const signatureTypes = { secp256k1: 0, p256: 1, webAuthn: 2, configurable: 3 } as const

type Scope = { address: Address; selector?: Hex | string; recipients?: readonly Address[] }

/**
 * Authorize an access key by calling the keychain precompile from the account, so the
 * account's signers approve it once, in the transaction itself.
 */
export function authorizeKeyCall(options: {
  keyId: Address
  keyType: keyof typeof signatureTypes
  expiry?: number
  limits?: readonly { token: Address; limit: bigint; period?: number }[]
  scopes?: readonly Scope[]
}) {
  const { keyId, keyType, expiry, limits = [], scopes } = options
  const targets = new Map<
    string,
    { target: Address; selectorRules: { selector: Hex; recipients: Address[] }[] }
  >()
  for (const scope of scopes ?? []) {
    const key = scope.address.toLowerCase()
    const entry = targets.get(key) ?? { target: scope.address, selectorRules: [] }
    if (scope.selector)
      entry.selectorRules.push({
        selector: scope.selector as Hex,
        recipients: [...(scope.recipients ?? [])],
      })
    targets.set(key, entry)
  }
  const data = encodeFunctionData({
    abi: Tempo.Abis.accountKeychain,
    functionName: 'authorizeKey',
    args: [
      keyId,
      signatureTypes[keyType],
      {
        expiry: BigInt(expiry ?? 0),
        enforceLimits: limits.length > 0,
        limits: limits.map(({ token, limit, period = 0 }) => ({
          token,
          amount: limit,
          period: BigInt(period),
        })),
        allowAnyCalls: !scopes?.length,
        allowedCalls: [...targets.values()],
      },
    ],
  })
  return { to: accountKeychain, data }
}

export function revokeKeyCall(keyId: Address) {
  return {
    to: accountKeychain,
    data: encodeFunctionData({
      abi: Tempo.Abis.accountKeychain,
      functionName: 'revokeKey',
      args: [keyId],
    }),
  }
}

/** A session's public state: no keys. */
export type DevnetSessionInfo = {
  address: Address
  config: ChainConfig
  recipient: Address
  keys: { id: string; keyId: Address; revoked: boolean; team: boolean }[]
}

export type DevnetAdapter = Omit<AccountSandboxAdapter, 'submit'> & {
  network: 'Devnet'
  probe(): Promise<boolean>
  /** A devnet account this page created, by preset ID or devnet address. */
  inspect(presetIdOrAddress: string): Promise<DevnetSessionInfo | undefined>
  /**
   * Create, or reuse, the account's funded devnet account. Passkey signers get real passkeys.
   * Throws a `DevnetRejection` when the account is blocked, a passkey is cancelled, or devnet is
   * unreachable.
   */
  prepare(account: SandboxAccount, options?: DevnetCallOptions): Promise<SandboxAccount>
  /** Apply the committed configuration and access keys of `next` on devnet. Never throws. */
  sync(
    previous: SandboxAccount,
    next: SandboxAccount,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; hash?: string }>
  /** Check `request` as the sandbox does, then send it. Never throws. */
  submit(
    account: SandboxAccount,
    request: ActionRequest,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; result: ActionResult }>
  /**
   * Make a signer's key now, before the step that adds it: a passkey prompts to be created here.
   * Pass the result back through `options.prepared.signer`. Throws a `DevnetRejection`.
   */
  prepareSigner(
    signer: Pick<Signer, 'kind' | 'name' | 'privateKey'>,
    options?: DevnetCallOptions,
  ): Promise<PreparedKey>
  /**
   * Make an access key now, before any account exists: a WebCrypto pair, a device passkey, a
   * private key, or a team account (`key.delegate`) with generated members. It binds to an account
   * when it's authorized. Pass the result back through `options.prepared.accessKey`.
   */
  prepareAccessKey(key: AccessKey, options?: DevnetCallOptions): Promise<PreparedKey>
  /**
   * Get test funds from the devnet faucet (`tempo_fundAddress`): 1,000,000 test AlphaUSD. Accounts
   * start with none, and transactions need fees. Creates the devnet account first if needed.
   * Never throws.
   */
  fund(
    account: SandboxAccount,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; hash?: string }>
  /**
   * Upgrade a plain key account in place (`upgradeAccount` on the native multisig), signed by its
   * key: a configurable account at the same address, with that key as its only signer. Never throws.
   */
  upgrade(
    account: SandboxAccount,
    options?: DevnetCallOptions,
  ): Promise<{ account: SandboxAccount; hash?: string }>
}

export function createDevnetAdapter(
  options: {
    rpcUrl?: string
    /**
     * `browser` (the default) creates real WebAuthn passkeys. `headless` signs WebAuthn-format
     * approvals from in-memory P-256 keys, for tests and scripts only.
     */
    passkeys?: 'browser' | 'headless'
  } = {},
): DevnetAdapter {
  const { passkeys = 'browser' } = options
  const client = createDevnetClient(options.rpcUrl ?? devnetRpcUrl)
  /** By `sessionKey` before preparing, and by devnet address after. */
  const sessions = new Map<string, Promise<Session>>()
  const rpId = globalThis.location?.hostname ?? 'localhost'
  /** Keys made with `prepareSigner` and `prepareAccessKey`, by lowercase address. */
  const preparedOwners = new Map<string, OwnerMaterial>()
  const preparedAccessKeys = new Map<string, AccessKeyMaterial>()

  function randomAddress() {
    return Account.fromSecp256k1(generatePrivateKey()).address
  }

  /** Show a prompt for the length of one WebAuthn call. */
  async function prompted<T>(prompts: Prompts, prompt: DevnetPrompt, run: () => Promise<T>) {
    prompts.current?.(prompt)
    try {
      return await run()
    } finally {
      prompts.current?.(null)
    }
  }

  /** A real WebAuthn passkey, or a headless one for tests. */
  async function makePasskey(label: string, prompts: Prompts) {
    return prompted(prompts, 'create-passkey', async () => {
      if (passkeys === 'headless')
        return Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
          origin: `http://${rpId}`,
          rpId,
        })
      if (!globalThis.navigator?.credentials || !globalThis.PublicKeyCredential)
        throw new DevnetRejection('network-error', 'This browser can’t create a passkey.')
      const credential = await WebAuthnP256.createCredential({
        label,
        rpId,
        userId: crypto.getRandomValues(new Uint8Array(32)),
      })
      return Account.fromWebAuthnP256(credential, { rpId })
    })
  }

  /** A passkey signer. Each signature prompts for Touch ID or Face ID, in the call using it. */
  async function createPasskey(signer: Pick<Signer, 'name'>, prompts: Prompts) {
    const passkey = await makePasskey(`Tempo devnet · ${signer.name}`, prompts)
    const prompter = { prompts }
    const account = {
      ...passkey,
      sign: (parameters: { hash: Hex }) =>
        prompted(prompter.prompts, 'approve-passkey', () => passkey.sign(parameters)),
    }
    return { account, prompter }
  }

  /** A signer's key: the one prepared for it, or a new one. */
  async function createOwner(signer: Signer, prompts: Prompts): Promise<OwnerMaterial> {
    const prepared = prompts.prepared?.signer?.(signer)
    if (!prepared) return makeOwner(signer, prompts)
    const material = preparedOwners.get(prepared.address.toLowerCase())
    if (!material)
      throw new DevnetRejection('unknown-signer', 'That signer’s key wasn’t prepared on this page.')
    // A prepared passkey prompts in the call that uses it now.
    if (material.prompter) material.prompter.prompts = prompts
    return material
  }

  async function makeOwner(
    signer: Pick<Signer, 'kind' | 'name' | 'privateKey'>,
    prompts: Prompts,
  ): Promise<OwnerMaterial> {
    const type = devnetKeyType(signer.kind)
    const held = (account: OwnerAccount) => ({ address: account.address as Address, account })
    // A secp256k1 signer with a generated key signs with it: the key the reader was shown, or one
    // a guide demo generated and holds.
    if (type === 'secp256k1' && signer.privateKey)
      return held(Account.fromSecp256k1(signer.privateKey as Hex))
    if (type === 'secp256k1') return held(Account.fromSecp256k1(generatePrivateKey()))
    if (type === 'p256') return held(Account.fromP256(P256.randomPrivateKey()))
    const { account, prompter } = await createPasskey(signer, prompts)
    return { ...held(account), prompter }
  }

  function ownerFor(session: Session, signer: Pick<Signer, 'id' | 'kind'>) {
    const owner = session.owners.get(ownerKeyId(signer))
    if (!owner) throw new DevnetRejection('unknown-signer', 'That signer isn’t on devnet.')
    return owner
  }

  /** The signer's devnet key, created on first use. New passkeys prompt here. */
  async function ensureOwner(session: Session, signer: Signer) {
    const id = ownerKeyId(signer)
    const existing = session.owners.get(id)
    if (existing) return existing
    const { address, account } = await createOwner(signer, session.prompts)
    const owner: OwnerKey = { id: signer.id, kind: signer.kind, name: signer.name, address, account }
    session.owners.set(id, owner)
    return owner
  }

  /** The account as it stands on chain, holding `locals` for signing. */
  function signingAccount(session: Session, locals: readonly OwnerAccount[]) {
    const { config } = session
    const owners = config.owners.map(({ owner, weight }) => ({
      owner: locals.find((local) => isAddressEqual(local.address, owner)) ?? owner,
      weight,
    }))
    if (config.version === 0n)
      return Account.fromConfig({
        address: 'infer',
        owners,
        salt: config.salt,
        threshold: config.threshold,
      })
    return Account.fromConfig({
      address: session.address,
      owners,
      salt: config.salt,
      threshold: config.threshold,
      version: config.version,
    })
  }

  /** Current on-chain owners that approve an update, as the sandbox would pick them. */
  function updateApprovers(session: Session, account: SandboxAccount) {
    const keys = [...session.owners.values()]
    const candidates: Signer[] = []
    for (const { owner, weight } of session.config.owners) {
      const key = keys.find((item) => isAddressEqual(item.address, owner))
      if (!key) continue
      const signer = account.signers.find(
        (item) => item.id === key.id && item.kind === key.kind,
      ) ?? {
        id: key.id,
        kind: key.kind,
        name: signerKinds[key.kind].label,
        detail: '',
        holder: signerKinds[key.kind].holder,
        lost: false,
        revoked: false,
        addedIn: 0,
        weight,
      }
      candidates.push({ ...signer, weight, revoked: false })
    }
    // Same order as the sandbox, so devnet signs with the approvers its history names.
    const position = (signer: Signer) => {
      const index = account.signers.findIndex((item) => item.id === signer.id)
      return index < 0 ? Number.POSITIVE_INFINITY : index
    }
    candidates.sort((a, b) => position(a) - position(b))
    const quorum = chooseQuorum(candidates, session.config.threshold)
    if (!quorum)
      throw new DevnetRejection('insufficient-weight', 'No devnet keys reach the threshold.')
    return quorum.map((signer) => ownerFor(session, signer))
  }

  /**
   * An access key before it's bound to an account. Keys the reader adds are real: the generated
   * private key they were shown, a non-extractable WebCrypto key, or a platform passkey. Example
   * keys that presets load are in-memory keys: secp256k1 for server keys, P-256 for device keys.
   * A team account (TIP-1111) gets generated members.
   */
  async function makeAccessKey(key: AccessKey, prompts: Prompts): Promise<AccessKeyMaterial> {
    if (key.delegate) {
      const members = key.delegate.members.map((member) => ({
        id: member.id,
        weight: member.weight,
        account: Account.fromSecp256k1(generatePrivateKey()),
      }))
      const team = Account.fromConfig({
        address: 'infer',
        owners: members.map(({ account, weight }) => ({ owner: account.address, weight })),
        threshold: key.delegate.threshold,
      })
      return {
        address: team.address as Address,
        team: { address: team.address as Address, threshold: key.delegate.threshold, members },
      }
    }
    if (key.kind === 'browser') {
      if (!globalThis.crypto?.subtle)
        throw new DevnetRejection('network-error', 'This browser can’t create a WebCrypto key.')
      const keyPair = await WebCryptoP256.createKeyPair()
      return {
        address: Account.fromWebCryptoP256(keyPair).address as Address,
        bind: (parent) => Account.fromWebCryptoP256(keyPair, { access: parent }),
      }
    }
    if (key.kind === 'device') {
      // `fromWebAuthnP256` makes a root account, so its signature is wrapped in an access key for
      // the account. Each payment asks for Touch ID or Face ID.
      const root = await makePasskey(`Tempo devnet · ${key.name} access key`, prompts)
      return {
        address: root.address as Address,
        bind: (parent, use) =>
          Account.from({
            access: parent,
            keyType: 'webAuthn',
            publicKey: PublicKey.fromHex(root.publicKey as Hex),
            sign: ({ hash }) => prompted(use, 'approve-passkey', () => root.sign({ hash })),
          }),
      }
    }
    const serverKinds: AccessKeyKind[] = ['agent', 'service', 'private-key']
    if (serverKinds.includes(key.kind)) {
      const privateKey = (key.privateKey as Hex | undefined) ?? generatePrivateKey()
      return {
        address: Account.fromSecp256k1(privateKey).address as Address,
        bind: (parent) => Account.fromSecp256k1(privateKey, { access: parent }),
      }
    }
    const privateKey = P256.randomPrivateKey()
    return {
      address: Account.fromP256(privateKey).address as Address,
      bind: (parent) => Account.fromP256(privateKey, { access: parent }),
    }
  }

  /** An access key for the session's account: the one prepared for it, or a new one. */
  async function createAccessKey(session: Session, key: AccessKey): Promise<AccessKeyEntry> {
    const spec = accessKeySpec(key)
    const prepared = session.prompts.prepared?.accessKey?.(key)
    const material = prepared
      ? preparedAccessKeys.get(prepared.address.toLowerCase())
      : await makeAccessKey(key, session.prompts)
    if (!material)
      throw new DevnetRejection('no-approver', 'That access key wasn’t prepared on this page.')
    if ('team' in material) return { spec, revoked: false, team: material.team }
    // Bound now, to the account authorizing it.
    return { spec, revoked: false, key: material.bind(session.address, session.prompts) }
  }

  function keyIdOf(entry: AccessKeyEntry) {
    if (entry.team) return entry.team.address
    return (entry.key as AccessKeyAccount).accessKeyAddress
  }

  /** A team account signs as the access key (TIP-1111), with the members in `memberIds`. */
  function teamSigner(session: Session, entry: AccessKeyEntry, memberIds: readonly string[]) {
    const team = entry.team as NonNullable<AccessKeyEntry['team']>
    const delegate = Account.fromConfig({
      address: 'infer',
      owners: team.members.map(({ id, account, weight }) => ({
        owner: memberIds.includes(id) ? account : account.address,
        weight,
      })),
      threshold: team.threshold,
    })
    const base = Account.from({
      access: session.address,
      // `Account.from` derives a key ID from a public key. A team account's key ID is its address.
      publicKey: Secp256k1.getPublicKey({ privateKey: generatePrivateKey() }),
      sign: ({ hash }) => delegate.sign({ hash }),
    })
    // `configurable` keeps viem from estimating gas as if a primitive key signed.
    return {
      ...base,
      accessKeyAddress: team.address,
      keyType: 'configurable',
    } as unknown as AccessKeyAccount
  }

  async function readBalance(session: Session) {
    const { amount } = await client.token.getBalance({
      account: session.address,
      token: devnetToken,
      decimals: tokenDecimals,
    })
    session.balance = unitsToUsd(amount)
  }

  /** Read each live key's spending from chain. Fees count when the fee token is limited. */
  async function readSpent(session: Session, account: SandboxAccount) {
    const keys = await Promise.all(
      account.accessKeys.map(async (key) => {
        const entry = session.keys.get(key.id)
        if (key.status !== 'active' || !entry || entry.revoked || entry.spec !== accessKeySpec(key))
          return key
        const { remaining } = await client.accessKey.getRemainingLimit({
          account: session.address,
          accessKey: keyIdOf(entry),
          token: devnetToken,
        })
        const spent = Math.max(0, Math.round((key.limit - unitsToUsd(remaining)) * 100) / 100)
        return spent === key.spent ? key : { ...key, spent }
      }),
    )
    return { ...account, accessKeys: keys }
  }

  function decorate(session: Session, account: SandboxAccount, hash?: string): SandboxAccount {
    const created = `Address ${shortAddress(session.address)}`
    return {
      ...account,
      address: session.address,
      balance: session.balance,
      devnet: { lastHash: hash ?? account.devnet?.lastHash },
      // The creation entry was written with the local stand-in address; show the real one.
      log: account.log.map((entry) =>
        entry.title.startsWith('Created account') && entry.detail?.startsWith('Address ')
          ? { ...entry, detail: created }
          : entry,
      ),
    }
  }

  function withLock<T>(
    session: Session,
    options: DevnetCallOptions,
    run: () => Promise<T>,
  ): Promise<T> {
    const locked = async () => {
      setPrompts(session.prompts, options)
      try {
        return await run()
      } finally {
        clearPrompts(session.prompts)
      }
    }
    const result = session.lock.then(locked, locked)
    session.lock = result.catch(() => undefined)
    return result
  }

  /** Bring the on-chain configuration to `account.committed`. Returns the update's hash. */
  async function syncConfig(session: Session, account: SandboxAccount) {
    const owners: ConfigOwner[] = []
    // One at a time: each new passkey is its own browser prompt.
    for (const signer of committedSigners(account))
      owners.push({ owner: (await ensureOwner(session, signer)).address, weight: signer.weight })
    const next = { owners, threshold: account.committed.threshold }
    if (sameConfig(next, session.config)) return undefined
    const approvers = updateApprovers(session, account)
    const { config, receipt } = await client.accounts.updateConfigSync({
      account: signingAccount(session, localAccounts(approvers)),
      nextConfig: next,
    })
    session.config = config
    session.lastUpdate = receipt.transactionHash
    return receipt.transactionHash
  }

  /** Send one keychain call from the account, approved once by `approvers`. */
  async function sendKeychainCall(
    session: Session,
    approvers: readonly OwnerKey[],
    call: { to: Address; data: Hex },
  ) {
    return client.sendTransactionSync({
      account: signingAccount(session, localAccounts(approvers)),
      calls: [call],
      throwOnReceiptRevert: true,
    })
  }

  /** Authorize new access keys and revoke removed ones. `deferred` waits for its first payment. */
  async function syncKeys(session: Session, account: SandboxAccount, deferred?: string) {
    const sent: { key: AccessKey; title: string; hash: string }[] = []
    for (const key of account.accessKeys) {
      const entry = session.keys.get(key.id)
      const current = entry && entry.spec === accessKeySpec(key)
      if (key.status === 'active') {
        if ((current && !entry.revoked) || key.id === deferred) continue
        const created = await createAccessKey(session, key)
        const parameters = authorizationParameters(key, session.recipient)
        // One call to the keychain from the account: its quorum signs once (one passkey prompt).
        const receipt = await sendKeychainCall(
          session,
          updateApprovers(session, account),
          authorizeKeyCall({
            keyId: keyIdOf(created),
            keyType: created.team ? 'configurable' : (created.key as AccessKeyAccount).keyType,
            ...parameters,
            scopes: parameters.scopes as never,
          }),
        )
        session.keys.set(key.id, created)
        session.lastUpdate = receipt.transactionHash
        sent.push({ key, title: `Authorized ${key.name}`, hash: receipt.transactionHash })
      } else if (key.status === 'revoked' && current && !entry.revoked) {
        const receipt = await sendKeychainCall(
          session,
          updateApprovers(session, account),
          revokeKeyCall(keyIdOf(entry)),
        )
        entry.revoked = true
        session.lastUpdate = receipt.transactionHash
        sent.push({ key, title: `Revoked ${key.name}`, hash: receipt.transactionHash })
      }
    }
    return sent
  }

  async function createSession(
    account: SandboxAccount,
    options: DevnetCallOptions,
  ): Promise<Session> {
    const prompts: Prompts = {}
    setPrompts(prompts, options)
    // Create every key before funding, so a cancelled passkey leaves nothing behind.
    const owners = new Map<string, OwnerKey>()
    for (const signer of committedSigners(account)) {
      const { address, account: held } = await createOwner(signer, prompts)
      owners.set(ownerKeyId(signer), {
        id: signer.id,
        kind: signer.kind,
        name: signer.name,
        address,
        account: held,
      })
    }
    if (account.legacy) {
      // The key's own address is the account's. Upgrading records this configuration there.
      const [key] = owners.values()
      const session: Session = {
        presetId: account.presetId,
        address: key.address,
        config: upgradeConfig(key.address, [{ owner: key.address, weight: 1 }], 1),
        owners,
        keys: new Map(),
        recipient: randomAddress(),
        balance: 0,
        legacy: true,
        lock: Promise.resolve(),
        prompts,
      }
      await readBalance(session)
      clearPrompts(prompts)
      return session
    }
    const genesis = {
      address: 'infer' as const,
      owners: committedSigners(account).map((signer) => ({
        owner: (owners.get(ownerKeyId(signer)) as OwnerKey).address,
        weight: signer.weight,
      })),
      threshold: account.committed.threshold,
    }
    let initial = Account.fromConfig(genesis)
    // The same owners derive the same address, such as one passkey at threshold 1. If an
    // earlier run moved that account past this v0 config, start a new account with a random salt.
    const commitment = await client.accounts.getConfigCommitment({ account: initial.address })
    if (isForeignCommitment(commitment, initial.config as ChainConfig))
      initial = Account.fromConfig({
        ...genesis,
        salt: toHex(crypto.getRandomValues(new Uint8Array(32))),
      })
    const session: Session = {
      presetId: account.presetId,
      address: initial.address,
      config: initial.config as ChainConfig,
      owners,
      keys: new Map(),
      recipient: randomAddress(),
      balance: 0,
      legacy: false,
      lock: Promise.resolve(),
      prompts,
    }
    // Nothing is sent yet: the account has no funds until the reader gets test funds (`fund`).
    // A reused address may already hold some, so read the real balance.
    await readBalance(session)
    clearPrompts(prompts)
    return session
  }

  function ensureSession(account: SandboxAccount, options: DevnetCallOptions) {
    const existing =
      sessions.get((account.address ?? '').toLowerCase()) ?? sessions.get(sessionKey(account))
    if (existing) return existing
    const key = sessionKey(account)
    const session = createSession(account, options)
    sessions.set(key, session)
    session.then(
      ({ address }) => sessions.set(address.toLowerCase(), session),
      () => sessions.delete(key),
    )
    return session
  }

  /** Send a payment. Signer payments sign with exactly `signerIds`, the approvers the sandbox chose. */
  async function sendPayment(
    session: Session,
    account: SandboxAccount,
    request: ActionRequest,
    signerIds: readonly string[] = [],
  ) {
    if (request.action.type !== 'payment') throw new Error('Not a payment.')
    const amount = usdToUnits(request.action.amount)
    const to = request.recipient === 'new' ? randomAddress() : session.recipient
    const { approver } = request
    if (approver.type === 'signers') {
      const keys = signerIds.map((id) => {
        const signer = account.signers.find((item) => item.id === id) as Signer
        return ownerFor(session, signer)
      })
      // A plain key account pays as a single key: no configurable signature.
      const [plainKey] = localAccounts(keys)
      const { receipt } = await client.token.transferSync({
        account:
          session.legacy && plainKey ? plainKey : signingAccount(session, localAccounts(keys)),
        amount,
        to,
        token: devnetToken,
      })
      return receipt.transactionHash
    }
    const entry = session.keys.get(approver.keyId)
    if (!entry || entry.revoked)
      throw new DevnetRejection('key-revoked', 'Not authorized on devnet.')
    if (entry.team) {
      // A fixed gas limit skips estimation, so check the limit first rather than revert on chain.
      const { remaining } = await client.accessKey.getRemainingLimit({
        account: session.address,
        accessKey: entry.team.address,
        token: devnetToken,
      })
      if (amount > remaining) throw new DevnetRejection('key-limit', 'Over its limit on devnet.')
      const { receipt } = await client.token.transferSync({
        account: teamSigner(session, entry, approver.memberIds ?? []),
        amount,
        to,
        token: devnetToken,
        gas: delegateGas,
      })
      return receipt.transactionHash
    }
    const { receipt } = await client.token.transferSync({
      account: entry.key as AccessKeyAccount,
      amount,
      to,
      token: devnetToken,
    })
    return receipt.transactionHash
  }

  /**
   * The access key `request` pays with, when its first payment can also authorize it in one
   * transaction: a key on the account that devnet hasn't authorized yet, with a quorum to sign its
   * authorization. Team accounts authorize on their own.
   */
  function firstKeyPayment(session: Session, account: SandboxAccount, request: ActionRequest) {
    const { action, approver } = request
    if (action.type !== 'payment' || approver.type !== 'access-key') return undefined
    const key = account.accessKeys.find((item) => item.id === approver.keyId)
    if (key?.status !== 'active' || key.delegate) return undefined
    const entry = session.keys.get(key.id)
    if (entry && entry.spec === accessKeySpec(key) && !entry.revoked) return undefined
    try {
      updateApprovers(session, account)
      return key
    } catch {
      return undefined
    }
  }

  /** Pay with `key` in the transaction that authorizes it. The key signs; its grant rides along. */
  async function sendFirstKeyPayment(
    session: Session,
    account: SandboxAccount,
    request: ActionRequest,
    key: AccessKey,
  ) {
    if (request.action.type !== 'payment') throw new Error('Not a payment.')
    const created = await createAccessKey(session, key)
    const accessKey = created.key as AccessKeyAccount
    const approvers = updateApprovers(session, account)
    const parameters = authorizationParameters(key, session.recipient)
    const amount = usdToUnits(request.action.amount)
    const to = request.recipient === 'new' ? randomAddress() : session.recipient
    const keyAuthorization = await client.accessKey.signAuthorization({
      account: signingAccount(session, localAccounts(approvers)),
      accessKey,
      ...parameters,
    })
    const { receipt } = await client.token.transferSync({
      account: accessKey,
      amount,
      to,
      token: devnetToken,
      keyAuthorization,
    })
    const hash = receipt.transactionHash
    session.keys.set(key.id, created)
    session.lastUpdate = hash
    return hash
  }

  /** Let devnet's recipient scope reject a payment the sandbox already refused. */
  async function confirmRecipientRejection(
    session: Session,
    account: SandboxAccount,
    request: ActionRequest,
  ): Promise<DevnetFailure | null> {
    if (request.approver.type !== 'access-key') return null
    const entry = session.keys.get(request.approver.keyId)
    if (!entry?.key || entry.revoked) return null
    try {
      await sendPayment(session, account, { ...request, recipient: 'new' })
      return null
    } catch (error) {
      const failure = mapDevnetError(error)
      return failure.code === 'recipient-not-allowed' ? failure : null
    }
  }

  /** Run `make` with a call's options, and report failures as a `DevnetRejection`. */
  async function preparing<T>(options: DevnetCallOptions, make: (prompts: Prompts) => Promise<T>) {
    const prompts: Prompts = {}
    setPrompts(prompts, options)
    try {
      return await make(prompts)
    } catch (error) {
      const { code, message } = mapDevnetError(error)
      throw new DevnetRejection(code, message)
    }
  }

  const adapter: DevnetAdapter = {
    network: 'Devnet',
    probe: probeDevnet,

    async upgrade(account, options = {}) {
      if (!account.legacy) return { account }
      let session: Session
      try {
        session = await ensureSession(account, options)
      } catch (error) {
        return { account: { ...account, notice: mapDevnetError(error).message } }
      }
      if (session.balance <= 0)
        return { account: { ...decorate(session, account), notice: needsFunds } }
      return withLock(session, options, async () => {
        try {
          // The original key signs: it's the account until the upgrade, then its first owner.
          const [original] = localAccounts([...session.owners.values()])
          if (!original) throw new DevnetRejection('unknown-signer', 'That key isn’t on devnet.')
          const owners = [{ owner: original.address as Address, weight: 1 }]
          const receipt = await client.writeContractSync({
            account: original,
            address: nativeMultisig,
            abi: upgradeAbi,
            functionName: 'upgradeAccount',
            args: [1, owners],
          })
          const config = upgradeConfig(session.address, owners, 1)
          const commitment = await client.accounts.getConfigCommitment({ account: session.address })
          if (commitment.toLowerCase() !== getCommitment(config).toLowerCase())
            throw new DevnetRejection('invalid-config', 'Devnet recorded another configuration.')
          session.config = config
          session.legacy = false
          session.lastUpdate = receipt.transactionHash
          await readBalance(session)
          const sinceId = account.log[0]?.id ?? 0
          const upgraded = attachHash(
            upgradeLegacyAccount(account),
            (entry) => entry.kind === 'config',
            receipt.transactionHash,
            sinceId,
          )
          return {
            account: decorate(session, upgraded, receipt.transactionHash),
            hash: receipt.transactionHash,
          }
        } catch (error) {
          return {
            account: { ...decorate(session, account), notice: mapDevnetError(error).message },
          }
        }
      })
    },

    async fund(account, options = {}) {
      if (!isCreated(account)) return { account: { ...account, notice: notCreatedNotice } }
      let prepared: SandboxAccount
      let session: Session
      try {
        prepared = account.devnet ? account : await adapter.prepare(account, options)
        session = await ensureSession(prepared, options)
      } catch (error) {
        return { account: { ...account, notice: mapDevnetError(error).message } }
      }
      return withLock(session, options, async () => {
        try {
          const receipts = await client.faucet.fundSync({ account: session.address })
          const hash = (
            receipts.find((receipt) =>
              receipt.logs.some((log) => isAddressEqual(log.address, devnetToken)),
            ) ?? receipts[0]
          )?.transactionHash
          await readBalance(session)
          const next = appendLog(prepared, {
            kind: 'event',
            title: `Got test funds · ${formatBalance(session.balance)}`,
            detail: 'Devnet faucet · 1,000,000 test AlphaUSD',
            hash,
          })
          return { account: decorate(session, next), hash }
        } catch (error) {
          return {
            account: { ...decorate(session, prepared), notice: mapDevnetError(error).message },
          }
        }
      })
    },

    async prepareSigner(signer, options = {}) {
      const material = await preparing(options, (prompts) => makeOwner(signer, prompts))
      preparedOwners.set(material.address.toLowerCase(), material)
      return { address: material.address }
    },

    async prepareAccessKey(key, options = {}) {
      const material = await preparing(options, (prompts) => makeAccessKey(key, prompts))
      preparedAccessKeys.set(material.address.toLowerCase(), material)
      return { address: material.address }
    },

    async inspect(presetIdOrAddress) {
      const key = presetIdOrAddress.toLowerCase()
      const match = [...sessions].find(
        ([id]) => id === key || id.startsWith(`${presetIdOrAddress}:`),
      )
      const session = await match?.[1].catch(() => undefined)
      if (!session) return undefined
      return {
        address: session.address,
        config: session.config,
        recipient: session.recipient,
        keys: [...session.keys].map(([id, entry]) => ({
          id,
          keyId: keyIdOf(entry),
          revoked: entry.revoked,
          team: Boolean(entry.team),
        })),
      }
    },

    async prepare(account, options = {}) {
      if (!isCreated(account)) throw new DevnetRejection('not-created', notCreatedNotice)
      let session: Session
      try {
        session = await ensureSession(account, options)
      } catch (error) {
        const { code, message } = mapDevnetError(error)
        throw new DevnetRejection(code, message)
      }
      return withLock(session, options, async () => {
        // Bringing devnet up to date sends transactions, which need test funds first. A plain key
        // account has nothing on chain to bring up to date until it upgrades.
        if (session.balance > 0 && !session.legacy) {
          const configHash = await syncConfig(session, account)
          const keys = await syncKeys(session, account)
          if (configHash || keys.length) await readBalance(session)
        }
        const next = account.devnet
          ? account
          : appendLog(account, {
              kind: 'event',
              title: `On devnet · ${shortAddress(session.address)}`,
              detail: session.balance > 0 ? undefined : 'No funds yet',
            })
        return decorate(session, await readSpent(session, next), session.lastUpdate)
      })
    },

    async sync(previous, next, options = {}) {
      // The first signer creates the account: create its owner and derive the address. Nothing is
      // sent until the reader gets test funds.
      if (!isCreated(previous)) {
        if (!isCreated(next)) return { account: next }
        try {
          const account = await adapter.prepare(next, options)
          return { account, hash: account.log.find((entry) => entry.hash)?.hash }
        } catch (error) {
          return { account: { ...previous, notice: mapDevnetError(error).message } }
        }
      }
      let session: Session
      try {
        session = await ensureSession(previous, options)
      } catch (error) {
        return { account: { ...previous, notice: mapDevnetError(error).message } }
      }
      if (session.legacy && sendsTransaction(previous, next))
        return { account: { ...decorate(session, previous), notice: notUpgradedNotice } }
      if (session.balance <= 0 && sendsTransaction(previous, next))
        return { account: { ...decorate(session, previous), notice: needsFunds } }
      return withLock(session, options, async () => {
        const sinceId = previous.log[0]?.id ?? 0
        try {
          const configHash = await syncConfig(session, next)
          const keys = await syncKeys(session, next)
          let account = next
          if (configHash)
            account = attachHash(account, (entry) => entry.kind === 'config', configHash, sinceId)
          for (const { title, hash } of keys)
            account = attachHash(
              account,
              (entry) => entry.kind === 'key' && entry.title === title,
              hash,
              sinceId,
            )
          const hash = keys.at(-1)?.hash ?? configHash
          if (hash) await readBalance(session)
          return { account: decorate(session, await readSpent(session, account), hash), hash }
        } catch (error) {
          return {
            account: { ...decorate(session, previous), notice: mapDevnetError(error).message },
          }
        }
      })
    },

    async submit(account, request, options = {}) {
      if (!isCreated(account))
        return { account, result: { ok: false, code: 'not-created', message: notCreatedNotice } }
      let session: Session
      try {
        session = await ensureSession(account, options)
      } catch (error) {
        return { account, result: { ok: false, ...mapDevnetError(error) } }
      }
      if (session.balance <= 0)
        return {
          account: decorate(session, account),
          result: { ok: false, code: 'insufficient-balance', message: needsFunds },
        }
      return withLock(session, options, async () => {
        const sinceId = account.log[0]?.id ?? 0
        let firstUse: AccessKey | undefined
        try {
          // Another sandbox on the page may have changed the shared account. A plain key account
          // has no configuration or keys on chain to bring up to date.
          if (!session.legacy) {
            await syncConfig(session, account)
            // A new key's first payment authorizes it in the same transaction.
            firstUse = firstKeyPayment(session, account, request)
            await syncKeys(session, account, firstUse?.id)
          }
        } catch (error) {
          return {
            account: decorate(session, account),
            result: { ok: false, ...mapDevnetError(error) },
          }
        }
        const checked = evaluateAction(account, request)
        if (!checked.ok) {
          if (checked.code === 'recipient-not-allowed') {
            const failure = await confirmRecipientRejection(session, account, request)
            if (failure)
              return { account: decorate(session, account), result: { ok: false, ...failure } }
          }
          return { account: decorate(session, account), result: checked }
        }
        // Signer changes and key authorizations are approval checks only; edits apply them.
        if (request.action.type !== 'payment')
          return { account: decorate(session, account), result: checked }
        try {
          const hash = firstUse
            ? await sendFirstKeyPayment(session, account, request, firstUse)
            : await sendPayment(session, account, request, checked.signerIds)
          const applied = applyAction(account, request)
          await readBalance(session)
          let paid = attachHash(applied.account, (entry) => entry.kind === 'payment', hash, sinceId)
          // The key's own "Authorized" entry came from an earlier edit, so it's older than `sinceId`.
          if (firstUse) {
            const title = `Authorized ${firstUse.name}`
            paid = attachHash(
              paid,
              (entry) => entry.kind === 'key' && entry.title === title,
              hash,
              0,
            )
          }
          const next = await readSpent(session, paid)
          const key = next.accessKeys.find((item) => item.id === checked.keyId)
          const result: ActionResult = {
            ...checked,
            hash,
            // Fees count against a key's limit, so report what devnet says is left.
            ...(key && {
              message: `${key.name} · ${formatUsd(remainingLimit(key))} USD left this ${key.period}`,
            }),
          }
          return { account: decorate(session, next, firstUse ? hash : undefined), result }
        } catch (error) {
          return {
            account: decorate(session, account),
            result: { ok: false, ...mapDevnetError(error) },
          }
        }
      })
    },
  }
  return adapter
}

let shared: DevnetAdapter | undefined

/** One adapter per page, so every sandbox reuses each preset's devnet account. */
export function getDevnetAdapter() {
  shared ??= createDevnetAdapter()
  return shared
}
