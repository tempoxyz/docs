import { thisDevice, thisDevicePasskey } from './this-device'
/**
 * Rules engine for the account sandbox. Pure functions only: no React and no network.
 *
 * The rules follow the configurable-account TIPs:
 * - TIP-1114: 1–48 owners, weights 1–255, total weight at most 255, threshold 1–255 and
 *   reachable with at most eight owner signatures. Signatures stop at the threshold.
 * - TIP-1131: a transaction carries at most two ZK (login) signatures, and wallets refuse
 *   configurations whose logins reach a threshold only three or more at a time.
 * - TIP-1107 and TIP-1109: updates increment the version, keep the address, and keep access keys.
 * - TIP-1111 and TIP-1137: access keys never count toward the threshold and can't manage keys
 *   or signers. Admin access keys don't exist.
 * - TIP-1135, simplified to one USD outflow rule plus an administrative weight. Equality doesn't
 *   escalate, non-payment operations need the administrative weight, and access keys can't spend
 *   while rules are on. The rules model assumes a fee sponsor, so fee reservations add no outflow.
 *
 * `AccountSandboxAdapter.submit` is the boundary a devnet adapter replaces.
 * `account-sandbox-devnet.ts` sends the same actions as real transactions.
 */

export const sandboxLimits = {
  maxOwners: 48,
  /** The UI caps signers so approval-set enumeration stays cheap. */
  maxSandboxOwners: 12,
  maxWeight: 255,
  maxTotalWeight: 255,
  maxThreshold: 255,
  maxSignatures: 8,
  maxLoginSignatures: 2,
} as const

// ---------------------------------------------------------------------------
// Signers

export type SignerKind =
  | 'google'
  | 'privy'
  | 'apple'
  | 'sso'
  | 'private-key'
  | 'passkey'
  | 'device'
  | 'hardware'
  | 'wallet-provider'
  | 'recovery-provider'

export type SignatureScheme = 'oidc' | 'webauthn' | 'p256' | 'secp256k1'

/** `you` for keys and logins the account holder controls, `provider` for keys a third party holds. */
export type SignerHolder = 'you' | 'provider'

type SignerKindInfo = {
  label: string
  scheme: SignatureScheme
  holder: SignerHolder
  group: 'Logins' | 'Keys' | 'Providers'
  loginWord?: string
}

export const signerKinds = {
  google: {
    label: 'Google login',
    scheme: 'oidc',
    holder: 'you',
    group: 'Logins',
    loginWord: 'Google',
  },
  privy: {
    label: 'Privy login',
    scheme: 'oidc',
    holder: 'you',
    group: 'Logins',
    loginWord: 'Privy',
  },
  apple: {
    label: 'Apple login',
    scheme: 'oidc',
    holder: 'you',
    group: 'Logins',
    loginWord: 'Apple',
  },
  sso: { label: 'Company SSO', scheme: 'oidc', holder: 'you', group: 'Logins', loginWord: 'SSO' },
  'private-key': { label: 'Private key', scheme: 'secp256k1', holder: 'you', group: 'Keys' },
  passkey: { label: 'Passkey', scheme: 'webauthn', holder: 'you', group: 'Keys' },
  device: { label: 'Device key', scheme: 'p256', holder: 'you', group: 'Keys' },
  hardware: { label: 'Hardware key', scheme: 'secp256k1', holder: 'you', group: 'Keys' },
  'wallet-provider': {
    label: 'Wallet provider key',
    scheme: 'secp256k1',
    holder: 'provider',
    group: 'Providers',
  },
  'recovery-provider': {
    label: 'Recovery provider',
    scheme: 'secp256k1',
    holder: 'provider',
    group: 'Providers',
  },
} as const satisfies Record<SignerKind, SignerKindInfo>

export const signerKindOrder = Object.keys(signerKinds) as SignerKind[]

export const schemeLabels: Record<SignatureScheme, string> = {
  oidc: 'OIDC',
  webauthn: 'WebAuthn',
  p256: 'P-256',
  secp256k1: 'secp256k1',
}

export type Signer = {
  id: string
  kind: SignerKind
  name: string
  detail: string
  /** The login identity, used to tell two logins with the same name apart. */
  subject?: string
  weight: number
  holder: SignerHolder
  lost: boolean
  revoked: boolean
  /** The config version that added this signer, or `null` while the update isn't applied. */
  addedIn: number | null
  /** How approval summaries refer to this signer. */
  phrase?: { list: string; solo: string }
  /** A `private-key` signer's generated key, for the reader to copy once and for devnet to sign. */
  privateKey?: string
}

export type SignerStatus = 'active' | 'added' | 'revoked' | 'lost'

export function isLogin(signer: Pick<Signer, 'kind'>) {
  return signerKinds[signer.kind].scheme === 'oidc'
}

export function signerStatus(account: SandboxAccount, signer: Signer): SignerStatus {
  if (signer.revoked) return 'revoked'
  if (signer.lost) return 'lost'
  if (
    signer.addedIn === null ||
    (signer.addedIn === account.version && signer.addedIn > account.startVersion)
  )
    return 'added'
  return 'active'
}

/** Owners in the current configuration. */
export function configuredSigners(account: Pick<SandboxAccount, 'signers'>) {
  return account.signers.filter((signer) => !signer.revoked)
}

/** Owners that can sign right now. */
export function usableSigners(signers: readonly Signer[]) {
  return signers.filter((signer) => !signer.revoked && !signer.lost)
}

function totalWeight(signers: readonly Pick<Signer, 'weight'>[]) {
  return signers.reduce((sum, signer) => sum + signer.weight, 0)
}

function largestWeights(signers: readonly Pick<Signer, 'weight'>[], count: number) {
  return totalWeight(
    signers
      .map((signer) => ({ weight: signer.weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, count),
  )
}

// ---------------------------------------------------------------------------
// Approval sets

export type ApprovalSetOptions = {
  maxSignatures?: number
  maxLogins?: number
  /** Stop after this many sets. */
  limit?: number
}

/**
 * Every minimal set of `signers` that reaches `weight`: at most eight signatures and two logins,
 * and no signer can be dropped without falling below `weight`. Minimal sets also satisfy
 * TIP-1114's rule that no signature may follow the one that reaches the threshold.
 * Sorted by size, then total weight (highest first), then fewer logins, then list order.
 */
export function approvalSets(
  signers: readonly Signer[],
  weight: number,
  options: ApprovalSetOptions = {},
): Signer[][] {
  const {
    maxSignatures = sandboxLimits.maxSignatures,
    maxLogins = sandboxLimits.maxLoginSignatures,
    limit = 5_000,
  } = options
  if (weight < 1) return []
  const order = new Map(signers.map((signer, index) => [signer.id, index]))
  // Descending weight: the last signer added to a set is its lightest, so a set is
  // minimal exactly when it first reaches the target.
  const candidates = [...signers].sort(
    (a, b) => b.weight - a.weight || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  )
  const suffix: number[] = []
  for (let index = candidates.length - 1; index >= 0; index--)
    suffix[index] = (suffix[index + 1] ?? 0) + candidates[index].weight

  const sets: Signer[][] = []
  const current: Signer[] = []
  function visit(start: number, sum: number, logins: number) {
    if (sets.length >= limit) return
    if (sum >= weight) {
      sets.push([...current])
      return
    }
    if (current.length >= maxSignatures) return
    for (let index = start; index < candidates.length; index++) {
      if (sum + suffix[index] < weight) return
      const candidate = candidates[index]
      const login = isLogin(candidate) ? 1 : 0
      if (logins + login > maxLogins) continue
      current.push(candidate)
      visit(index + 1, sum + candidate.weight, logins + login)
      current.pop()
    }
  }
  visit(0, 0, 0)

  const position = (signer: Signer) => order.get(signer.id) ?? 0
  return sets
    .map((set) => [...set].sort((a, b) => position(a) - position(b)))
    .sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length
      const weightDifference = totalWeight(b) - totalWeight(a)
      if (weightDifference) return weightDifference
      const loginDifference = a.filter(isLogin).length - b.filter(isLogin).length
      if (loginDifference) return loginDifference
      for (let index = 0; index < a.length; index++) {
        const difference = position(a[index]) - position(b[index])
        if (difference) return difference
      }
      return 0
    })
}

function listName(signer: Signer) {
  if (signer.phrase) return signer.phrase.list
  const info: SignerKindInfo = signerKinds[signer.kind]
  const suffix = signer.name.startsWith(info.label) ? signer.name.slice(info.label.length) : null
  if (suffix === null) return signer.name
  if (info.loginWord) return `${info.loginWord}${suffix}`
  return `${info.label.charAt(0).toLowerCase()}${info.label.slice(1)}${suffix}`
}

export function soloName(signer: Signer) {
  if (signer.phrase) return signer.phrase.solo
  const info: SignerKindInfo = signerKinds[signer.kind]
  if (signer.name.includes('’s ')) return signer.name
  if (info.loginWord && signer.name.startsWith(info.label))
    return `the ${info.loginWord} login${signer.name.slice(info.label.length)}`
  return `the ${listName(signer)}`
}

function joinAnd(items: readonly string[]) {
  if (items.length <= 1) return items.join('')
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function joinOr(items: readonly string[]) {
  if (items.length <= 1) return items.join('')
  if (items.length === 2) return `${items[0]} or ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, or ${items[items.length - 1]}`
}

function combinations(n: number, k: number) {
  let result = 1
  for (let index = 1; index <= k; index++) result = (result * (n - index + 1)) / index
  return Math.round(result)
}

function unionOf(sets: readonly Signer[][]) {
  const union: Signer[] = []
  for (const set of sets)
    for (const signer of set) if (!union.some((item) => item.id === signer.id)) union.push(signer)
  return union
}

function together(set: readonly Signer[], all: readonly Signer[]) {
  if (set.length === all.length && set.length > 2) return `all ${set.length} signers together`
  return `${joinAnd(set.map(listName))} together`
}

/** Phrase a group of same-size sets as "any 2 of …" or "the passkey plus Google or Privy". */
function groupPhrase(group: readonly Signer[][], size: number): string | null {
  if (group.length < 2) return null
  const union = unionOf(group)
  if (group.length === combinations(union.length, size))
    return `any ${size} of ${joinAnd(union.map(listName))}`
  const core = group[0].filter((signer) => group.every((set) => set.includes(signer)))
  if (core.length === 0) return null
  const rest = group.map((set) => set.filter((signer) => !core.includes(signer)))
  const restUnion = unionOf(rest)
  const restSize = size - core.length
  if (group.length !== combinations(restUnion.length, restSize)) return null
  const coreText = core.length === 1 ? soloName(core[0]) : joinAnd(core.map(listName))
  if (restSize === 1)
    return `${coreText} plus ${restUnion.length > 2 ? 'one of ' : ''}${joinOr(restUnion.map(listName))}`
  return `${coreText} plus any ${restSize} of ${joinAnd(restUnion.map(listName))}`
}

/**
 * Describe approval sets in a short phrase, such as "the passkey, or Google and Privy together".
 * Shows at most `maxAlternatives`, then "or N other combinations".
 */
export function describeApprovalSets(
  sets: readonly Signer[][],
  candidates: readonly Signer[] = unionOf(sets),
  maxAlternatives = 3,
) {
  if (sets.length === 0) return 'no usable combination'
  const phrases: { text: string; covers: number }[] = []
  const sizes = [...new Set(sets.map((set) => set.length))].sort((a, b) => a - b)
  for (const size of sizes) {
    const group = sets.filter((set) => set.length === size)
    if (size === 1) {
      if (group.length > 3)
        phrases.push({
          text: `any one of ${joinOr(group.map(([signer]) => listName(signer)))}`,
          covers: group.length,
        })
      else for (const [signer] of group) phrases.push({ text: soloName(signer), covers: 1 })
      continue
    }
    const grouped = groupPhrase(group, size)
    if (grouped) phrases.push({ text: grouped, covers: group.length })
    else for (const set of group) phrases.push({ text: together(set, candidates), covers: 1 })
  }
  const parts = phrases.slice(0, maxAlternatives).map((phrase) => phrase.text)
  const hidden = phrases.slice(maxAlternatives).reduce((sum, phrase) => sum + phrase.covers, 0)
  if (hidden) parts.push(`${hidden} other combination${hidden === 1 ? '' : 's'}`)
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(', ')}, or ${parts[parts.length - 1]}`
}

// ---------------------------------------------------------------------------
// Access keys

/**
 * `private-key`, `browser`, and `device` are keys the reader adds and holds: a generated test key,
 * a WebCrypto key in this browser, and a passkey on this device. The others are example keys
 * that presets load.
 */
export type AccessKeyKind =
  | 'private-key'
  | 'browser'
  | 'device'
  | 'phone'
  | 'laptop'
  | 'agent'
  | 'service'
  | 'account'

/** A configurable account acting as an access key (TIP-1111). Its own quorum signs. */
export type AccessKeyDelegate = {
  threshold: number
  members: { id: string; name: string; weight: number }[]
}

export type AccessKey = {
  id: string
  name: string
  kind: AccessKeyKind
  /** USD per period. */
  limit: number
  period: 'day' | 'week'
  /** USD spent in the current period. */
  spent: number
  expiresInDays: number | null
  recipients: 'any' | 'approved'
  status: 'active' | 'revoked' | 'expired'
  delegate?: AccessKeyDelegate
  /** A `private-key` key's generated key, for the reader to copy once and for devnet to sign. */
  privateKey?: string
}

export type AccessKeyTemplateId =
  | 'private-key'
  | 'browser'
  | 'device'
  | 'iphone'
  | 'macbook'
  | 'bill-pay'
  | 'payout'
  | 'team'

export const accessKeyTemplates: Record<
  AccessKeyTemplateId,
  Omit<AccessKey, 'id' | 'spent' | 'status'>
> = {
  'private-key': {
    name: 'Private key',
    kind: 'private-key',
    limit: 500,
    period: 'day',
    expiresInDays: 30,
    recipients: 'any',
  },
  browser: {
    name: 'This browser',
    kind: 'browser',
    limit: 500,
    period: 'day',
    expiresInDays: 30,
    recipients: 'any',
  },
  device: {
    name: 'This device',
    kind: 'device',
    limit: 500,
    period: 'day',
    expiresInDays: 30,
    recipients: 'any',
  },
  iphone: {
    name: 'This iPhone',
    kind: 'phone',
    limit: 500,
    period: 'day',
    expiresInDays: 30,
    recipients: 'any',
  },
  macbook: {
    name: 'MacBook',
    kind: 'laptop',
    limit: 500,
    period: 'day',
    expiresInDays: 30,
    recipients: 'any',
  },
  'bill-pay': {
    name: 'Bill-pay agent',
    kind: 'agent',
    limit: 100,
    period: 'week',
    expiresInDays: null,
    recipients: 'approved',
  },
  payout: {
    name: 'Payout service',
    kind: 'service',
    limit: 10_000,
    period: 'day',
    expiresInDays: null,
    recipients: 'approved',
  },
  team: {
    name: 'Marketing team',
    kind: 'account',
    limit: 2_000,
    period: 'day',
    expiresInDays: null,
    recipients: 'any',
    delegate: {
      threshold: 2,
      members: [
        { id: 'ana', name: 'Ana', weight: 1 },
        { id: 'ben', name: 'Ben', weight: 1 },
        { id: 'chloe', name: 'Chloe', weight: 1 },
      ],
    },
  },
}

const accessKeyKindLabels: Record<AccessKeyKind, string> = {
  'private-key': 'Test key',
  browser: 'Browser key',
  device: 'Device passkey',
  phone: 'Device key',
  laptop: 'Device key',
  agent: 'Agent key',
  service: 'Service key',
  account: 'Team account',
}

export function remainingLimit(key: AccessKey) {
  return Math.max(0, key.limit - key.spent)
}

export function accessKeyDetail(key: AccessKey) {
  return [
    accessKeyKindLabels[key.kind],
    key.delegate ? `${key.delegate.threshold} of ${key.delegate.members.length}` : null,
    `${formatUsd(key.limit)} USD a ${key.period}`,
    key.expiresInDays ? `${key.expiresInDays} days` : null,
    key.recipients === 'approved' ? 'approved recipients' : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Keys stay stored while approval rules are on, but they can't spend. */
export function accessKeyStatus(account: SandboxAccount, key: AccessKey) {
  if (key.status !== 'active') return key.status
  return account.committed.rules.enabled ? 'paused' : 'active'
}

// ---------------------------------------------------------------------------
// Account state

export type ApprovalRules = {
  enabled: boolean
  /** Payments above this USD amount need `paymentWeight`. Equal amounts don't escalate. */
  paymentLimit: number
  paymentWeight: number
  /** Signer changes, rule changes, and access-key management. */
  adminWeight: number
}

export type LogEntry = {
  id: number
  kind: 'preset' | 'config' | 'rules' | 'key' | 'payment' | 'approval' | 'event'
  title: string
  detail?: string
  /** The transaction that applied this entry, on a real network. */
  hash?: string
}

type CommittedState = {
  threshold: number
  owners: { id: string; weight: number }[]
  rules: ApprovalRules
}

export type SandboxAccount = {
  presetId: PresetId
  name: string
  avatar: string
  /**
   * Derived once from the version-zero configuration and never recomputed. `null` until the first
   * signer creates the account (`from-scratch` starts with no signers).
   */
  address: string | null
  /**
   * A plain private-key account: its address is the key's own, not derived from a configuration,
   * and it has no configuration on chain until it upgrades in place (`upgradeLegacyAccount`).
   */
  legacy?: boolean
  /** The version-zero configuration, for an account the reader created from scratch. */
  genesis?: {
    threshold: number
    owners: { id: string; weight: number }[]
    /** Unique per created account, so two with the same kind of first signer stay apart. */
    nonce?: string
  }
  balance: number
  version: number
  startVersion: number
  threshold: number
  signers: Signer[]
  accessKeys: AccessKey[]
  rules: ApprovalRules
  rulesRevision: number
  startRulesRevision: number
  /** The preset models a recommended setup. */
  recommended: boolean
  guided: GuidedActionId[]
  /** The last applied configuration. Edits that fail validation stay unapplied. */
  committed: CommittedState
  log: LogEntry[]
  /** Why the last edit was blocked. */
  notice: string | null
  serial: number
  identity: { local: string; domain: string }
  /** Set once a network adapter has created this account on the devnet. */
  devnet?: DevnetState
}

export type DevnetState = {
  /** The latest configuration or access-key transaction. */
  lastHash?: string
}

function snapshot(account: SandboxAccount): CommittedState {
  return {
    threshold: account.threshold,
    owners: configuredSigners(account).map(({ id, weight }) => ({ id, weight })),
    rules: { ...account.rules },
  }
}

const maxLogEntries = 50

function addLog(account: SandboxAccount, entry: Omit<LogEntry, 'id'>): SandboxAccount {
  const id = (account.log[0]?.id ?? 0) + 1
  return { ...account, log: [{ id, ...entry }, ...account.log].slice(0, maxLogEntries) }
}

// ---------------------------------------------------------------------------
// Address

/**
 * A deterministic stand-in for TIP-1110's CREATE2 derivation from the version-zero
 * configuration. FNV-1a, not a real address.
 */
export function deriveAddress(
  salt: string,
  genesis: { threshold: number; owners: readonly { id: string; weight: number }[] },
) {
  const input = `${salt}|${genesis.threshold}|${genesis.owners.map((owner) => `${owner.id}:${owner.weight}`).join(',')}`
  let hex = ''
  for (let round = 0; hex.length < 40; round++) {
    let hash = 0x811c9dc5
    for (const character of `${round}:${input}`) {
      hash ^= character.charCodeAt(0)
      hash = Math.imul(hash, 0x01000193) >>> 0
    }
    hex += hash.toString(16).padStart(8, '0')
  }
  return `0x${hex.slice(0, 40)}`
}

/** Whether the first signer has created the account, so it has an address. */
export function isCreated<T extends Pick<SandboxAccount, 'address'>>(
  account: T,
): account is T & { address: string } {
  return account.address !== null
}

export const notCreatedNotice = 'Add the first signer to create the account.'

export const notUpgradedNotice = 'Upgrade first to add signers and keys.'

export function shortAddress(address: string) {
  return `0x${address.slice(2, 6).toUpperCase()}…${address.slice(-4).toUpperCase()}`
}

/** A transaction hash such as `0x95d7…0cfc`. */
export function shortHash(hash: string) {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`
}

const usd = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const balanceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatUsd(amount: number) {
  return usd.format(amount)
}

export function formatBalance(amount: number) {
  return `$${balanceFormat.format(amount)}`
}

// ---------------------------------------------------------------------------
// Presets

export type PresetId =
  | 'from-scratch'
  | 'portable-sign-in'
  | 'add-signers'
  | 'multi-factor'
  | 'rotate-keys'
  | 'change-login'
  | 'recover'
  | 'export'
  | 'team-treasury'
  | 'approval-rules'
  | 'team-account'
  | 'backend-automation'

export type GuidedActionId =
  | 'add-passkey'
  | 'rotate-operations'
  | 'change-login'
  | 'lose-passkey'
  | 'replace-passkey'
  | 'move-to-tempo-wallet'

type SignerSeed = Omit<Signer, 'holder' | 'lost' | 'revoked' | 'addedIn'> & {
  holder?: SignerHolder
}

type AccountSeed = {
  name: string
  avatar: string
  balance: number
  salt: string
  genesis: { threshold: number; owners: { id: string; weight: number }[] }
  identity: { local: string; domain: string }
}

type PresetDefinition = AccountSeed & {
  id: PresetId
  label: string
  recommended?: boolean
  version: number
  threshold: number
  signers: SignerSeed[]
  accessKeys: AccessKeyTemplateId[]
  rules?: Pick<ApprovalRules, 'paymentWeight' | 'adminWeight'>
  guided?: GuidedActionId[]
}

const mayaGoogle: SignerSeed = {
  id: 'google',
  kind: 'google',
  name: 'Google login',
  subject: 'maya@example.com',
  detail: 'OIDC · Google · maya@example.com',
  weight: 1,
}
const mayaPasskey: SignerSeed = {
  id: 'passkey',
  kind: 'passkey',
  name: 'Passkey',
  subject: 'this iPhone',
  detail: 'WebAuthn · Face ID · this iPhone',
  weight: 2,
}
const mayaPrivy: SignerSeed = {
  id: 'privy',
  kind: 'privy',
  name: 'Privy login',
  subject: 'm•••@example.com',
  detail: 'OIDC · Privy · m•••@example.com',
  weight: 1,
}

const hardwareKey = (id: string, name: string, serial: string): SignerSeed => ({
  id,
  kind: 'hardware',
  name,
  subject: `serial ${serial}`,
  detail: `secp256k1 · hardware wallet · ${serial}`,
  weight: 1,
})
const passkeySeed = (id: string, name: string, device: string): SignerSeed => ({
  id,
  kind: 'passkey',
  name,
  subject: device,
  detail: `WebAuthn · ${device}`,
  weight: 1,
})
const acmeSigners = [
  hardwareKey('finance', 'Finance key', '2209'),
  hardwareKey('operations', 'Operations key', '4471'),
  passkeySeed('cfo', 'CFO passkey', 'Touch ID · CFO’s MacBook'),
]

// Presets for one person or team share a version-zero configuration, so they share an address.
const maya: AccountSeed = {
  name: 'Maya’s account',
  avatar: 'M',
  balance: 12_480,
  salt: 'maya',
  genesis: { threshold: 1, owners: [{ id: 'google', weight: 1 }] },
  identity: { local: 'maya', domain: 'example.com' },
}
const acme: AccountSeed = {
  name: 'Acme treasury',
  avatar: 'A',
  balance: 84_200,
  salt: 'acme',
  genesis: {
    threshold: 2,
    owners: acmeSigners.map(({ id, weight }) => ({ id, weight })),
  },
  identity: { local: 'finance', domain: 'acme.example' },
}

const presetDefinitions: PresetDefinition[] = [
  {
    id: 'from-scratch',
    label: 'Start from scratch',
    name: 'Your account',
    avatar: 'Y',
    // No signers yet: the first one the reader adds is the version-zero configuration.
    balance: 0,
    salt: 'from-scratch',
    genesis: { threshold: 1, owners: [] },
    identity: { local: 'you', domain: 'example.com' },
    version: 0,
    threshold: 1,
    signers: [],
    accessKeys: [],
  },
  {
    id: 'portable-sign-in',
    label: 'Portable sign-in',
    ...maya,
    version: 0,
    threshold: 1,
    signers: [mayaGoogle],
    accessKeys: ['iphone'],
  },
  {
    id: 'add-signers',
    label: 'Add signers',
    ...maya,
    version: 0,
    threshold: 1,
    signers: [mayaGoogle],
    accessKeys: ['iphone'],
    guided: ['add-passkey'],
  },
  {
    id: 'multi-factor',
    label: 'Multi-factor',
    ...maya,
    version: 2,
    threshold: 2,
    signers: [mayaGoogle, mayaPasskey, mayaPrivy],
    accessKeys: ['iphone'],
  },
  {
    id: 'rotate-keys',
    label: 'Rotate keys',
    recommended: true,
    ...acme,
    version: 0,
    threshold: 2,
    signers: acmeSigners,
    accessKeys: ['payout'],
    guided: ['rotate-operations'],
  },
  {
    id: 'change-login',
    label: 'Change login',
    ...maya,
    version: 2,
    threshold: 2,
    signers: [mayaGoogle, mayaPasskey, mayaPrivy],
    accessKeys: ['iphone'],
    guided: ['change-login'],
  },
  {
    id: 'recover',
    label: 'Recover',
    ...maya,
    version: 2,
    threshold: 2,
    signers: [mayaGoogle, mayaPasskey, mayaPrivy],
    accessKeys: ['iphone'],
    guided: ['lose-passkey', 'replace-passkey'],
  },
  {
    id: 'export',
    label: 'Export',
    name: 'Harbor account',
    avatar: 'H',
    balance: 3_600,
    salt: 'harbor',
    genesis: { threshold: 1, owners: [{ id: 'harbor', weight: 1 }] },
    identity: { local: 'maya', domain: 'example.com' },
    version: 0,
    threshold: 1,
    signers: [
      {
        id: 'harbor',
        kind: 'wallet-provider',
        name: 'Harbor’s signer',
        detail: 'Embedded wallet · held by Harbor',
        weight: 1,
      },
    ],
    accessKeys: [],
    guided: ['move-to-tempo-wallet'],
  },
  {
    id: 'team-treasury',
    label: 'Team treasury',
    recommended: true,
    ...acme,
    version: 0,
    threshold: 2,
    signers: acmeSigners,
    accessKeys: ['payout'],
  },
  {
    id: 'approval-rules',
    label: 'Approval rules',
    ...acme,
    version: 1,
    threshold: 1,
    signers: acmeSigners,
    accessKeys: ['payout'],
    rules: { paymentWeight: 2, adminWeight: 3 },
  },
  {
    id: 'team-account',
    label: 'Team account',
    recommended: true,
    name: 'Acme group treasury',
    avatar: 'A',
    balance: 640_000,
    salt: 'acme-group',
    genesis: {
      threshold: 4,
      owners: ['finance', 'operations', 'cfo', 'ceo', 'controller'].map((id) => ({
        id,
        weight: 1,
      })),
    },
    identity: { local: 'treasury', domain: 'acme.example' },
    version: 0,
    threshold: 4,
    signers: [
      hardwareKey('finance', 'Finance key', '2209'),
      hardwareKey('operations', 'Operations key', '4471'),
      passkeySeed('cfo', 'CFO passkey', 'Touch ID · CFO’s MacBook'),
      passkeySeed('ceo', 'CEO passkey', 'Face ID · CEO’s iPhone'),
      hardwareKey('controller', 'Controller key', '7310'),
    ],
    accessKeys: ['team'],
  },
  {
    id: 'backend-automation',
    label: 'Backend automation',
    recommended: true,
    name: 'Kite Studio',
    avatar: 'K',
    balance: 18_900,
    salt: 'kite',
    genesis: {
      threshold: 2,
      owners: [
        { id: 'passkey', weight: 2 },
        { id: 'google', weight: 1 },
        { id: 'recovery', weight: 1 },
      ],
    },
    identity: { local: 'owner', domain: 'kite.example' },
    version: 0,
    threshold: 2,
    signers: [
      { ...passkeySeed('passkey', 'Passkey', 'Face ID · owner’s iPhone'), weight: 2 },
      {
        id: 'google',
        kind: 'google',
        name: 'Google login',
        subject: 'owner@kite.example',
        detail: 'OIDC · Google · owner@kite.example',
        weight: 1,
      },
      {
        id: 'recovery',
        kind: 'recovery-provider',
        name: 'Recovery provider',
        detail: 'secp256k1 · held by a recovery service',
        weight: 1,
      },
    ],
    accessKeys: ['payout'],
  },
]

export const presets = presetDefinitions.map(({ id, label, recommended = false }) => ({
  id,
  label,
  recommended,
}))

const paymentLimit = 5_000

export function loadPreset(id: PresetId): SandboxAccount {
  const preset = presetDefinitions.find((item) => item.id === id)
  if (!preset) throw new Error(`Unknown preset: ${id}`)
  const signers: Signer[] = preset.signers.map((seed) => ({
    holder: signerKinds[seed.kind].holder,
    ...seed,
    lost: false,
    revoked: false,
    addedIn: 0,
  }))
  const rules: ApprovalRules = preset.rules
    ? { enabled: true, paymentLimit, ...preset.rules }
    : defaultRules(preset.threshold, signers, false)
  const keys = preset.accessKeys.map(
    (template, index): AccessKey => ({
      ...accessKeyTemplates[template],
      id: `key-${index + 1}`,
      spent: 0,
      status: 'active',
    }),
  )
  const address = preset.genesis.owners.length ? deriveAddress(preset.salt, preset.genesis) : null
  const rulesRevision = rules.enabled ? 1 : 0
  const account: SandboxAccount = {
    presetId: preset.id,
    name: preset.name,
    avatar: preset.avatar,
    address,
    balance: preset.balance,
    version: preset.version,
    startVersion: preset.version,
    threshold: preset.threshold,
    signers,
    accessKeys: keys,
    rules,
    rulesRevision,
    startRulesRevision: rulesRevision,
    recommended: preset.recommended ?? false,
    guided: preset.guided ?? [],
    committed: { threshold: 0, owners: [], rules },
    log: [],
    notice: null,
    serial: keys.length + 1,
    identity: preset.identity,
  }
  return addLog(
    { ...account, committed: snapshot(account) },
    address
      ? {
          kind: 'preset',
          title: `Config v${preset.version} · ${preset.label}`,
          detail: `Address ${shortAddress(address)} from v0`,
        }
      : { kind: 'preset', title: preset.label, detail: 'No signers yet' },
  )
}

function defaultRules(threshold: number, owners: readonly Signer[], enabled: boolean) {
  const paymentWeight = Math.min(threshold + 1, sandboxLimits.maxThreshold)
  return {
    enabled,
    paymentLimit,
    paymentWeight,
    adminWeight: Math.max(paymentWeight, Math.min(totalWeight(owners), sandboxLimits.maxThreshold)),
  }
}

// ---------------------------------------------------------------------------
// Validation

export type TierId = 'base' | 'large-payment' | 'admin'

export type ConfigIssue = {
  code:
    | 'no-owners'
    | 'too-many-owners'
    | 'weight-range'
    | 'total-weight'
    | 'threshold-range'
    | 'unreachable'
    | 'signature-limit'
    | 'login-limit'
    | 'no-usable-path'
    | 'rule-order'
  tier?: TierId
  message: string
}

function tierSubject(tier: TierId, weight: number, rules: ApprovalRules) {
  if (tier === 'base') return `Threshold ${weight}`
  if (tier === 'large-payment') return `Over-$${formatUsd(rules.paymentLimit)} weight ${weight}`
  return `Change weight ${weight}`
}

function checkTier(
  owners: readonly Signer[],
  weight: number,
  tier: TierId,
  rules: ApprovalRules,
): ConfigIssue | null {
  const subject = tierSubject(tier, weight, rules)
  const total = totalWeight(owners)
  if (total < weight)
    return { code: 'unreachable', tier, message: `${subject} is above total weight ${total}.` }
  if (largestWeights(owners, sandboxLimits.maxSignatures) < weight)
    return { code: 'signature-limit', tier, message: `${subject} needs more than 8 signatures.` }
  const logins = owners
    .filter(isLogin)
    .map((signer) => signer.weight)
    .sort((a, b) => b - a)
  const loginTotal = logins.reduce((sum, value) => sum + value, 0)
  const target = tier === 'base' ? 'the threshold' : `weight ${weight}`
  // TIP-1131: logins that reach the weight together, but never two at a time, form an
  // approval path no transaction can carry. Wallets and SDKs must refuse these.
  if (loginTotal >= weight && (logins[0] ?? 0) + (logins[1] ?? 0) < weight)
    return {
      code: 'login-limit',
      tier,
      message: `Viem rejects configurations that need three or more logins to reach ${target}.`,
    }
  if (approvalSets(owners, weight, { limit: 1 }).length === 0)
    return { code: 'no-usable-path', tier, message: `Every path to ${target} needs 3+ logins.` }
  return null
}

export function validateConfig(config: {
  threshold: number
  owners: readonly Signer[]
  rules: ApprovalRules
}): ConfigIssue[] {
  const { threshold, owners, rules } = config
  if (owners.length === 0) return [{ code: 'no-owners', message: 'Add at least one signer.' }]
  if (owners.length > sandboxLimits.maxOwners)
    return [{ code: 'too-many-owners', message: 'An account has at most 48 signers.' }]
  if (
    owners.some(
      (owner) =>
        !Number.isInteger(owner.weight) ||
        owner.weight < 1 ||
        owner.weight > sandboxLimits.maxWeight,
    )
  )
    return [{ code: 'weight-range', message: 'Weights must be 1 to 255.' }]
  const total = totalWeight(owners)
  if (total > sandboxLimits.maxTotalWeight)
    return [{ code: 'total-weight', message: `Total weight ${total} is above 255.` }]
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > sandboxLimits.maxThreshold)
    return [{ code: 'threshold-range', message: 'Threshold must be 1 to 255.' }]

  const issues: ConfigIssue[] = []
  const base = checkTier(owners, threshold, 'base', rules)
  if (base) issues.push(base)
  if (rules.enabled) {
    const limit = `$${formatUsd(rules.paymentLimit)}`
    if (rules.paymentWeight <= threshold)
      issues.push({
        code: 'rule-order',
        tier: 'large-payment',
        message: `Over ${limit} must need more than threshold ${threshold}.`,
      })
    else {
      const issue = checkTier(owners, rules.paymentWeight, 'large-payment', rules)
      if (issue) issues.push(issue)
    }
    if (rules.adminWeight < rules.paymentWeight)
      issues.push({
        code: 'rule-order',
        tier: 'admin',
        message: `Changes must need at least weight ${rules.paymentWeight}.`,
      })
    else {
      const issue = checkTier(owners, rules.adminWeight, 'admin', rules)
      if (issue) issues.push(issue)
    }
  }
  return issues
}

export function validateAccount(account: SandboxAccount) {
  return validateConfig({
    threshold: account.threshold,
    owners: configuredSigners(account),
    rules: account.rules,
  })
}

// ---------------------------------------------------------------------------
// Actions

export type SandboxAction =
  | { type: 'payment'; amount: number }
  | { type: 'change-signers' }
  | { type: 'authorize-key' }

export type TryActionId = 'send-50' | 'send-6000' | 'change-signers' | 'authorize-key'

export const tryActions: { id: TryActionId; label: string; action: SandboxAction }[] = [
  { id: 'send-50', label: 'Send $50', action: { type: 'payment', amount: 50 } },
  { id: 'send-6000', label: 'Send $6,000', action: { type: 'payment', amount: 6_000 } },
  { id: 'change-signers', label: 'Change signers', action: { type: 'change-signers' } },
  { id: 'authorize-key', label: 'Authorize an access key', action: { type: 'authorize-key' } },
]

/** Access keys never count toward a threshold, so an approver is signers or one key. */
export type Approver =
  | { type: 'signers'; signerIds: string[] }
  /** `memberIds` are the delegate's own signers when the key is a team account. */
  | { type: 'access-key'; keyId: string; memberIds?: string[] }

export type ActionRequest = {
  action: SandboxAction
  approver: Approver
  recipient?: 'approved' | 'new'
}

export type FailureCode =
  | 'no-approver'
  | 'invalid-config'
  | 'unknown-signer'
  | 'revoked-signer'
  | 'lost-signer'
  | 'insufficient-weight'
  | 'login-limit'
  | 'signature-limit'
  | 'key-revoked'
  | 'key-expired'
  | 'key-not-allowed'
  | 'rules-block-keys'
  | 'recipient-not-allowed'
  | 'key-limit'
  | 'insufficient-balance'
  | 'network-error'
  | 'not-created'
  | 'not-live'

export type ActionResult =
  | {
      ok: true
      message: string
      requiredWeight?: number
      weight?: number
      signerIds?: string[]
      keyId?: string
      /** The transaction hash, on a real network. */
      hash?: string
    }
  | {
      ok: false
      code: FailureCode
      message: string
      requiredWeight?: number
      weight?: number
    }

export function requiredWeight(
  account: Pick<SandboxAccount, 'threshold' | 'rules'>,
  action: SandboxAction,
): { weight: number; tier: TierId } {
  const { rules, threshold } = account
  if (!rules.enabled) return { weight: threshold, tier: 'base' }
  if (action.type !== 'payment') return { weight: rules.adminWeight, tier: 'admin' }
  // Equality doesn't escalate: exactly the limit stays in the lower tier.
  if (action.amount > rules.paymentLimit)
    return { weight: rules.paymentWeight, tier: 'large-payment' }
  return { weight: threshold, tier: 'base' }
}

function fail(
  code: FailureCode,
  message: string,
  extra: { requiredWeight?: number; weight?: number } = {},
): ActionResult {
  return { ok: false, code, message, ...extra }
}

function weightLabel(account: SandboxAccount, action: SandboxAction, tier: TierId) {
  if (tier === 'large-payment') return `Over $${formatUsd(account.rules.paymentLimit)} needs`
  if (tier === 'admin')
    return action.type === 'authorize-key' ? 'New keys need' : 'Signer changes need'
  return 'Needs'
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Decide whether `request` would be approved. Pure: it never changes the account. */
export function evaluateAction(account: SandboxAccount, request: ActionRequest): ActionResult {
  const { action, approver } = request
  if (!isCreated(account)) return fail('not-created', notCreatedNotice)
  if (approver.type === 'access-key')
    return evaluateAccessKey(account, request, approver.keyId, approver.memberIds ?? [])

  const selected: Signer[] = []
  for (const id of approver.signerIds) {
    const signer = account.signers.find((item) => item.id === id)
    if (!signer) return fail('unknown-signer', 'That signer isn’t on this account.')
    if (!selected.includes(signer)) selected.push(signer)
  }
  if (selected.length === 0) return fail('no-approver', 'Pick a signer.')
  if (validateAccount(account).length > 0)
    return fail('invalid-config', 'Fix the configuration first.')
  if (selected.some((signer) => signer.revoked))
    return fail('revoked-signer', 'Revoked signers can’t approve.')
  if (selected.some((signer) => signer.lost))
    return fail('lost-signer', 'Lost signers can’t approve.')

  const required = requiredWeight(account, action)
  const weight = totalWeight(selected)
  const extra = { requiredWeight: required.weight, weight }
  const [used] = approvalSets(selected, required.weight, { limit: 1 })
  if (!used) {
    if (weight < required.weight)
      return fail(
        'insufficient-weight',
        `${weightLabel(account, action, required.tier)} weight ${required.weight} · has ${weight}`,
        extra,
      )
    if (
      approvalSets(selected, required.weight, { maxLogins: Number.POSITIVE_INFINITY, limit: 1 })
        .length
    )
      return fail('login-limit', 'A transaction can carry at most two logins.', extra)
    return fail('signature-limit', 'A transaction can carry at most eight signatures.', extra)
  }
  if (action.type === 'payment' && action.amount > account.balance)
    return fail('insufficient-balance', `Balance is ${formatBalance(account.balance)}.`, extra)
  return {
    ok: true,
    message: `${capitalize(soloNames(used))} · weight ${totalWeight(used)} of ${required.weight}`,
    signerIds: used.map((signer) => signer.id),
    ...extra,
  }
}

function soloNames(signers: readonly Signer[]) {
  return joinAnd(signers.map(soloName))
}

function evaluateAccessKey(
  account: SandboxAccount,
  request: ActionRequest,
  keyId: string,
  memberIds: readonly string[],
): ActionResult {
  const { action } = request
  const key = account.accessKeys.find((item) => item.id === keyId)
  if (!key) return fail('no-approver', 'Pick an access key.')
  if (key.status === 'revoked') return fail('key-revoked', `${key.name} is revoked.`)
  if (key.status === 'expired') return fail('key-expired', `${key.name} has expired.`)
  if (action.type === 'change-signers')
    return fail('key-not-allowed', 'Access keys can’t change signers.')
  if (action.type === 'authorize-key')
    return fail('key-not-allowed', 'Access keys can’t authorize keys.')
  // Keys depend on the applied policy, not on an unapplied draft.
  if (account.committed.rules.enabled)
    return fail('rules-block-keys', 'Access keys can’t spend while approval rules are on.')
  if (key.delegate) {
    // A team account signs as the key with its own quorum (TIP-1111).
    const members = key.delegate.members.filter((member) => memberIds.includes(member.id))
    const weight = members.reduce((sum, member) => sum + member.weight, 0)
    if (weight < key.delegate.threshold)
      return fail(
        'insufficient-weight',
        `${key.name} needs weight ${key.delegate.threshold} · has ${weight}`,
        {
          requiredWeight: key.delegate.threshold,
          weight,
        },
      )
  }
  if (key.recipients === 'approved' && request.recipient !== 'approved')
    return fail('recipient-not-allowed', `${key.name} pays approved recipients only.`)
  const remaining = remainingLimit(key)
  if (action.amount > remaining)
    return fail(
      'key-limit',
      `${key.name} can spend ${formatUsd(key.limit)} USD a ${key.period}; ${formatUsd(remaining)} USD remains.`,
    )
  if (action.amount > account.balance)
    return fail('insufficient-balance', `Balance is ${formatBalance(account.balance)}.`)
  return {
    ok: true,
    message: `${key.name} · ${formatUsd(remaining - action.amount)} USD left this ${key.period}`,
    keyId: key.id,
  }
}

/** Evaluate `request` and, when approved, apply its effects and log it. */
export function applyAction(
  account: SandboxAccount,
  request: ActionRequest,
): { account: SandboxAccount; result: ActionResult } {
  const result = evaluateAction(account, request)
  if (!result.ok) return { account, result }
  const { action } = request
  let next: SandboxAccount = { ...account, notice: null }
  if (action.type === 'payment') {
    next = { ...next, balance: next.balance - action.amount }
    if (result.keyId) {
      const key = next.accessKeys.find((item) => item.id === result.keyId) as AccessKey
      next = {
        ...next,
        accessKeys: next.accessKeys.map((item) =>
          item.id === key.id ? { ...item, spent: item.spent + action.amount } : item,
        ),
      }
      next = addLog(next, {
        kind: 'payment',
        title: `Sent $${formatUsd(action.amount)} · ${key.name}`,
        detail: `${formatUsd(remainingLimit(key) - action.amount)} USD left this ${key.period}`,
      })
    } else
      next = addLog(next, {
        kind: 'payment',
        title: `Sent $${formatUsd(action.amount)}`,
        detail: `By ${soloNames(signersById(next, result.signerIds))}`,
      })
    return { account: next, result }
  }
  next = addLog(next, {
    kind: 'approval',
    title:
      action.type === 'change-signers' ? 'Signer change approved' : 'Key authorization approved',
    detail: `By ${soloNames(signersById(next, result.signerIds))} · check only`,
  })
  return { account: next, result }
}

function signersById(account: SandboxAccount, ids: readonly string[] = []) {
  return ids
    .map((id) => account.signers.find((signer) => signer.id === id))
    .filter((signer): signer is Signer => Boolean(signer))
}

/** The boundary the devnet adapter implements. `simulatedAdapter` runs `applyAction`, for tests. */
export type AccountSandboxAdapter = {
  network: string
  submit(
    account: SandboxAccount,
    request: ActionRequest,
  ): Promise<{ account: SandboxAccount; result: ActionResult }>
}

/** Applies actions locally with no network. Tests only: the sandbox runs on devnet. */
export const simulatedAdapter: AccountSandboxAdapter = {
  network: 'Simulated',
  submit: async (account, request) => applyAction(account, request),
}

// ---------------------------------------------------------------------------
// Edits

function committedOwners(account: SandboxAccount) {
  return account.committed.owners
    .map(({ id, weight }) => {
      const signer = account.signers.find((item) => item.id === id)
      return signer ? { ...signer, weight, revoked: false } : null
    })
    .filter((signer): signer is Signer => Boolean(signer))
}

/** Updates and key management need the applied configuration's change weight. */
function approveUpdate(account: SandboxAccount) {
  const { rules, threshold } = account.committed
  const weight = rules.enabled ? rules.adminWeight : threshold
  const [approvers] = approvalSets(usableSigners(committedOwners(account)), weight, { limit: 1 })
  return approvers
    ? { approvers }
    : { reason: `Locked out: no usable signers reach weight ${weight}.` }
}

/** Name a signer for the log, with its login identity when another signer shares the name. */
function logName(account: SandboxAccount, signer: Signer, weight?: number) {
  const duplicate = account.signers.filter((item) => item.name === signer.name).length > 1
  const qualifiers = [
    duplicate ? signer.subject : undefined,
    weight === undefined ? undefined : `W${weight}`,
  ].filter(Boolean)
  return qualifiers.length ? `${signer.name} (${qualifiers.join(', ')})` : signer.name
}

function describeConfigChanges(account: SandboxAccount) {
  const owners = configuredSigners(account)
  const before = new Map(account.committed.owners.map((owner) => [owner.id, owner.weight]))
  const parts: string[] = []
  for (const signer of owners)
    if (!before.has(signer.id)) parts.push(`added ${logName(account, signer, signer.weight)}`)
  for (const [id] of before)
    if (!owners.some((signer) => signer.id === id)) {
      const signer = account.signers.find((item) => item.id === id)
      if (signer) parts.push(`revoked ${logName(account, signer)}`)
    }
  for (const signer of owners) {
    const weight = before.get(signer.id)
    if (weight !== undefined && weight !== signer.weight)
      parts.push(`${logName(account, signer)} W${weight} → W${signer.weight}`)
  }
  if (account.committed.threshold !== account.threshold)
    parts.push(`threshold ${account.committed.threshold} → ${account.threshold}`)
  return parts
}

function describeRuleChange(before: ApprovalRules, after: ApprovalRules) {
  const weights = `over $${formatUsd(after.paymentLimit)} W${after.paymentWeight} · changes W${after.adminWeight}`
  if (!before.enabled && after.enabled) return `on · ${weights}`
  if (before.enabled && !after.enabled) return 'off'
  if (
    after.enabled &&
    (before.paymentWeight !== after.paymentWeight || before.adminWeight !== after.adminWeight)
  )
    return weights
  return null
}

function proposeUpdate(
  account: SandboxAccount,
  changes: Partial<Pick<SandboxAccount, 'signers' | 'threshold' | 'rules' | 'serial'>>,
): SandboxAccount {
  if (!isCreated(account)) return { ...account, notice: notCreatedNotice }
  if (account.legacy) return { ...account, notice: notUpgradedNotice }
  const approval = approveUpdate(account)
  if (!approval.approvers) return { ...account, notice: approval.reason }
  const draft: SandboxAccount = { ...account, ...changes, notice: null }
  // An invalid draft stays unapplied, like an update Tempo would reject.
  if (validateAccount(draft).length > 0) return draft

  const configChanges = describeConfigChanges(draft)
  const ruleChange = describeRuleChange(draft.committed.rules, draft.rules)
  const approvedBy = `By ${soloNames(approval.approvers)}`
  let next = draft
  if (configChanges.length > 0) {
    const version = draft.version + 1
    next = {
      ...next,
      version,
      signers: next.signers.map((signer) =>
        signer.addedIn === null ? { ...signer, addedIn: version } : signer,
      ),
    }
    next = addLog(next, {
      kind: 'config',
      title: `Config v${version} · ${capitalize(configChanges.join(', '))}`,
      detail: `${approvedBy} · same address and balance`,
    })
  }
  if (ruleChange) {
    const revision = draft.rulesRevision + 1
    next = addLog(
      { ...next, rulesRevision: revision },
      { kind: 'rules', title: `Rules r${revision} · ${ruleChange}`, detail: approvedBy },
    )
  }
  return { ...next, committed: snapshot(next) }
}

function uniqueName(base: string, names: readonly string[]) {
  if (!names.includes(base)) return base
  for (let index = 2; ; index++) if (!names.includes(`${base} ${index}`)) return `${base} ${index}`
}

function newSignerDetails(account: SandboxAccount, kind: SignerKind) {
  const { domain } = account.identity
  switch (kind) {
    case 'google':
      return { detail: 'OIDC · Google account' }
    case 'privy':
      return { detail: 'OIDC · Privy account' }
    case 'apple':
      return { detail: 'OIDC · Apple Account' }
    case 'sso':
      return { detail: `OIDC · ${domain} sign-in` }
    case 'private-key':
      return { detail: 'secp256k1 · generated in this browser' }
    case 'passkey':
      return thisDevicePasskey()
    case 'device':
      return { detail: `P-256 · key in this browser on this ${thisDevice().name}` }
    case 'hardware':
      return { detail: 'secp256k1 · hardware wallet' }
    case 'wallet-provider':
      return { detail: 'secp256k1 · held by your wallet provider' }
    case 'recovery-provider':
      return { detail: 'secp256k1 · held by a recovery service' }
  }
}

export function addSigner(
  account: SandboxAccount,
  kind: SignerKind,
  /** A `private-key` signer's generated key. */
  secret: Pick<Signer, 'privateKey'> = {},
): SandboxAccount {
  if (configuredSigners(account).length >= sandboxLimits.maxSandboxOwners)
    return { ...account, notice: 'An account here holds up to 12 signers.' }
  const info = signerKinds[kind]
  const signer: Signer = {
    id: `s${account.serial}`,
    kind,
    name: uniqueName(
      info.label,
      account.signers.map((item) => item.name),
    ),
    ...newSignerDetails(account, kind),
    weight: 1,
    holder: info.holder,
    lost: false,
    revoked: false,
    addedIn: null,
    ...secret,
  }
  if (!isCreated(account)) return createAccount(account, signer)
  return proposeUpdate(account, {
    signers: [...account.signers, signer],
    serial: account.serial + 1,
  })
}

/**
 * The first signer creates the account: it's the version-zero configuration (that signer at
 * weight 1, threshold 1), not an update. The address comes from that configuration, once.
 */
function createAccount(account: SandboxAccount, first: Signer): SandboxAccount {
  const signer: Signer = { ...first, weight: 1, addedIn: 0 }
  const nonce = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(8)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  const genesis = { threshold: 1, owners: [{ id: signer.id, weight: 1 }], nonce }
  // This address stands in for TIP-1110's derivation, so it varies with the signer and the
  // account. Devnet derives the real one from the signer's real key.
  const address = deriveAddress(
    `${account.presetId}:${signer.kind}:${signer.subject ?? ''}:${nonce}`,
    genesis,
  )
  const created: SandboxAccount = {
    ...account,
    address,
    genesis,
    version: 0,
    startVersion: 0,
    threshold: 1,
    signers: [signer],
    rules: defaultRules(1, [signer], false),
    notice: null,
    serial: account.serial + 1,
  }
  return addLog(
    { ...created, committed: snapshot(created) },
    {
      kind: 'config',
      title: `Created account · v0 · ${signer.name} W1 · address from v0`,
      detail: `Address ${shortAddress(address)}`,
    },
  )
}

/**
 * Start from a plain private-key account the reader already has: one key, whose own address is
 * the account's. It signs alone until it upgrades in place to a configurable account.
 */
export function createLegacyAccount(
  account: SandboxAccount,
  key: { privateKey: string; address: string },
): SandboxAccount {
  if (isCreated(account)) return account
  const signer: Signer = {
    id: `s${account.serial}`,
    kind: 'private-key',
    name: 'Private key',
    detail: 'secp256k1 · a plain key account',
    weight: 1,
    holder: 'you',
    lost: false,
    revoked: false,
    addedIn: 0,
    privateKey: key.privateKey,
  }
  const created: SandboxAccount = {
    ...account,
    address: key.address,
    legacy: true,
    version: 0,
    startVersion: 0,
    threshold: 1,
    signers: [signer],
    rules: defaultRules(1, [signer], false),
    notice: null,
    serial: account.serial + 1,
  }
  return addLog(
    { ...created, committed: snapshot(created) },
    {
      kind: 'config',
      title: 'Plain key account · not upgraded',
      detail: `Address ${shortAddress(key.address)} · the key’s own address`,
    },
  )
}

/**
 * Upgrade a plain key account in place: a configurable account at the same address, with the
 * original key as its only signer (weight 1, threshold 1). Tempo records that as version 1.
 */
export function upgradeLegacyAccount(account: SandboxAccount): SandboxAccount {
  if (!account.legacy) return account
  const [signer] = configuredSigners(account)
  const upgraded: SandboxAccount = {
    ...account,
    legacy: false,
    version: 1,
    startVersion: 1,
    notice: null,
  }
  return addLog(
    { ...upgraded, committed: snapshot(upgraded) },
    {
      kind: 'config',
      title: 'Upgraded in place · same address',
      detail: `Config v1 · ${signer?.name ?? 'Private key'} W1, threshold 1`,
    },
  )
}

export function setSignerWeight(account: SandboxAccount, id: string, weight: number) {
  const value = Math.min(sandboxLimits.maxWeight, Math.max(1, Math.round(weight)))
  return proposeUpdate(account, {
    signers: account.signers.map((signer) =>
      signer.id === id && !signer.revoked ? { ...signer, weight: value } : signer,
    ),
  })
}

/** Revoke a signer. A signer added in an unapplied draft disappears instead. */
export function removeSigner(account: SandboxAccount, id: string) {
  return proposeUpdate(account, {
    signers: account.signers.flatMap((signer) => {
      if (signer.id !== id) return [signer]
      if (signer.addedIn === null) return []
      return [{ ...signer, revoked: true }]
    }),
  })
}

/** Losing a signer is something that happens to it, not a config update. */
export function setSignerLost(account: SandboxAccount, id: string, lost: boolean) {
  const signer = account.signers.find((item) => item.id === id)
  if (!signer || signer.revoked || signer.lost === lost) return account
  return addLog(
    {
      ...account,
      notice: null,
      signers: account.signers.map((item) => (item.id === id ? { ...item, lost } : item)),
    },
    {
      kind: 'event',
      title: `${signer.name} ${lost ? 'lost' : 'found'}`,
      detail: 'Config unchanged',
    },
  )
}

export function setThreshold(account: SandboxAccount, threshold: number) {
  return proposeUpdate(account, {
    threshold: Math.min(sandboxLimits.maxThreshold, Math.max(1, Math.round(threshold))),
  })
}

export function setApprovalRules(account: SandboxAccount, enabled: boolean) {
  if (enabled === account.rules.enabled) return account
  return proposeUpdate(account, {
    rules: enabled
      ? defaultRules(account.threshold, configuredSigners(account), true)
      : { ...account.rules, enabled: false },
  })
}

export function setRuleWeight(
  account: SandboxAccount,
  rule: 'paymentWeight' | 'adminWeight',
  weight: number,
) {
  if (!account.rules.enabled) return account
  return proposeUpdate(account, {
    rules: {
      ...account.rules,
      [rule]: Math.min(sandboxLimits.maxThreshold, Math.max(1, Math.round(weight))),
    },
  })
}

function replacementDetails(account: SandboxAccount, signer: Signer) {
  const used = new Set(account.signers.map((item) => item.subject))
  const pick = (candidates: string[]) =>
    candidates.find((candidate) => !used.has(candidate)) ?? `${candidates[0]} ${account.serial}`
  if (signer.kind === 'google') {
    const { local, domain } = account.identity
    const subject = pick([
      `${local}@work.example`,
      `${local}@home.example`,
      `${local}.new@${domain}`,
    ])
    return { subject, detail: `OIDC · Google · ${subject}` }
  }
  if (signer.kind === 'hardware') {
    const serial = pick(['serial 8802', 'serial 5127', 'serial 6034']).replace('serial ', '')
    return { subject: `serial ${serial}`, detail: `secp256k1 · hardware wallet · ${serial}` }
  }
  if (signer.kind === 'passkey') {
    const subject = pick(['new iPhone', 'new MacBook', 'security key'])
    return { subject, detail: `WebAuthn · ${subject}` }
  }
  const subject = pick(['new key'])
  return { subject, detail: `${schemeLabels[signerKinds[signer.kind].scheme]} · ${subject}` }
}

/** Replace a signer with a new one of the same kind and weight, in one update. */
export function rotateSigner(account: SandboxAccount, id: string) {
  const current = configuredSigners(account).find((signer) => signer.id === id)
  if (!current) return account
  const replacement: Signer = {
    ...current,
    ...replacementDetails(account, current),
    id: `s${account.serial}`,
    lost: false,
    addedIn: null,
  }
  return proposeUpdate(account, {
    signers: [
      ...account.signers.map((signer) =>
        signer.id === current.id ? { ...signer, revoked: true } : signer,
      ),
      replacement,
    ],
    serial: account.serial + 1,
  })
}

/** Add a new Google login and revoke the old one in one update. */
export function changeLogin(account: SandboxAccount) {
  const current = configuredSigners(account).find((signer) => signer.kind === 'google')
  if (!current) return { ...account, notice: 'Add a Google login first.' }
  return rotateSigner(account, current.id)
}

function appSigner(account: SandboxAccount) {
  return configuredSigners(account).find(
    (signer) => signer.kind === 'wallet-provider' && signer.holder === 'provider',
  )
}

/** Export: add a Tempo Wallet signer and revoke the app's embedded-wallet signer in one update. */
export function moveToTempoWallet(account: SandboxAccount) {
  const app = appSigner(account)
  if (!app) return { ...account, notice: 'No app signer to replace.' }
  const wallet: Signer = {
    id: `s${account.serial}`,
    kind: 'passkey',
    name: 'Tempo Wallet signer',
    detail: 'WebAuthn · passkey in Tempo Wallet',
    weight: app.weight,
    holder: 'you',
    lost: false,
    revoked: false,
    addedIn: null,
    phrase: { list: 'Tempo Wallet signer', solo: 'the Tempo Wallet signer' },
  }
  return proposeUpdate(account, {
    signers: [
      ...account.signers.map((signer) =>
        signer.id === app.id ? { ...signer, revoked: true } : signer,
      ),
      wallet,
    ],
    serial: account.serial + 1,
  })
}

const guidedLabels: Record<GuidedActionId, string> = {
  'add-passkey': 'Add a passkey',
  'rotate-operations': 'Rotate the operations key',
  'change-login': 'Change Google login',
  'lose-passkey': 'Lose the passkey',
  'replace-passkey': 'Replace the passkey',
  'move-to-tempo-wallet': 'Move to Tempo Wallet',
}

function guidedTarget(account: SandboxAccount, id: GuidedActionId): Signer | null | undefined {
  const owners = configuredSigners(account)
  const passkey = owners.find((signer) => signer.kind === 'passkey')
  switch (id) {
    case 'add-passkey':
      return passkey ? undefined : null
    case 'rotate-operations':
      return owners.find((signer) => signer.name === 'Operations key')
    case 'change-login':
      return owners.find((signer) => signer.kind === 'google')
    case 'lose-passkey':
      return passkey && !passkey.lost ? passkey : undefined
    case 'replace-passkey':
      return passkey?.lost ? passkey : undefined
    case 'move-to-tempo-wallet':
      return appSigner(account)
  }
}

/** The preset's guided actions that apply to the account's current state. */
export function guidedActions(account: SandboxAccount) {
  return account.guided
    .filter((id) => guidedTarget(account, id) !== undefined)
    .map((id) => ({ id, label: guidedLabels[id] }))
}

export function runGuidedAction(account: SandboxAccount, id: GuidedActionId): SandboxAccount {
  const target = guidedTarget(account, id)
  if (target === undefined) return account
  switch (id) {
    case 'add-passkey': {
      const passkey: Signer = {
        id: `s${account.serial}`,
        kind: 'passkey',
        name: 'Passkey',
        // The reader's own account gets a passkey on the reader's device.
        ...(account.presetId === 'from-scratch'
          ? thisDevicePasskey()
          : { subject: 'this iPhone', detail: 'WebAuthn · Face ID · this iPhone' }),
        weight: 2,
        holder: 'you',
        lost: false,
        revoked: false,
        addedIn: null,
      }
      return proposeUpdate(account, {
        signers: [...account.signers, passkey],
        serial: account.serial + 1,
      })
    }
    case 'lose-passkey':
      return target ? setSignerLost(account, target.id, true) : account
    case 'move-to-tempo-wallet':
      return moveToTempoWallet(account)
    default:
      return target ? rotateSigner(account, target.id) : account
  }
}

/** A template's key name. Device keys the reader adds are named after the reader's device. */
export function accessKeyTemplateName(account: SandboxAccount, template: AccessKeyTemplateId) {
  const { name, kind } = accessKeyTemplates[template]
  // A passkey used as an access key: it asks for Touch ID (or the device's unlock) on each payment.
  if (kind === 'device') {
    const { unlock } = thisDevice()
    return unlock === 'passkey' ? 'Passkey' : `Passkey (${unlock})`
  }
  if (account.presetId === 'from-scratch' && kind === 'phone') return `This ${thisDevice().name}`
  return name
}

/**
 * The access keys any account can add: keys the reader holds for real. Example keys, such as a
 * payout service, come with the presets that need them.
 */
export const accessKeyTemplateOptions: readonly AccessKeyTemplateId[] = [
  'private-key',
  'browser',
  'device',
]

export function addAccessKey(
  account: SandboxAccount,
  template: AccessKeyTemplateId,
  /** A `private-key` key's generated key. */
  secret: Pick<AccessKey, 'privateKey'> = {},
) {
  if (!isCreated(account)) return { ...account, notice: notCreatedNotice }
  if (account.legacy) return { ...account, notice: notUpgradedNotice }
  const approval = approveUpdate(account)
  if (!approval.approvers) return { ...account, notice: approval.reason }
  const base = accessKeyTemplates[template]
  const key: AccessKey = {
    ...base,
    ...secret,
    id: `key-${account.serial}`,
    name: uniqueName(
      accessKeyTemplateName(account, template),
      account.accessKeys.map((item) => item.name),
    ),
    spent: 0,
    status: 'active',
  }
  return addLog(
    {
      ...account,
      notice: null,
      serial: account.serial + 1,
      accessKeys: [...account.accessKeys, key],
    },
    {
      kind: 'key',
      title: `Authorized ${key.name}`,
      detail: `By ${soloNames(approval.approvers)}${account.committed.rules.enabled ? ' · paused by rules' : ''}`,
    },
  )
}

export function revokeAccessKey(account: SandboxAccount, id: string) {
  const key = account.accessKeys.find((item) => item.id === id)
  if (!key || key.status === 'revoked') return account
  const approval = approveUpdate(account)
  if (!approval.approvers) return { ...account, notice: approval.reason }
  return addLog(
    {
      ...account,
      notice: null,
      accessKeys: account.accessKeys.map((item) =>
        item.id === id ? { ...item, status: 'revoked' as const } : item,
      ),
    },
    { kind: 'key', title: `Revoked ${key.name}`, detail: `By ${soloNames(approval.approvers)}` },
  )
}

// ---------------------------------------------------------------------------
// Health

export type Notice = {
  id: string
  tone: 'error' | 'warning' | 'ok'
  message: string
  signerIds?: string[]
}

export type ApprovalTier = {
  id: TierId
  label: string
  weight: number
  sets: Signer[][]
  summary: string
}

export type AccountHealth = {
  valid: boolean
  issues: ConfigIssue[]
  notices: Notice[]
  tiers: ApprovalTier[]
  /** For the header, such as "Threshold 2: the passkey, or Google and Privy together". */
  summary: string
  /** A recommended preset that is unchanged and raises no warnings. */
  recommended: boolean
}

export function approvalTiers(account: SandboxAccount, signers: readonly Signer[]): ApprovalTier[] {
  const { rules, threshold } = account
  const limit = `$${formatUsd(rules.paymentLimit)}`
  const tiers: Omit<ApprovalTier, 'sets' | 'summary'>[] = rules.enabled
    ? [
        { id: 'base', label: `Up to ${limit}`, weight: threshold },
        { id: 'large-payment', label: `Over ${limit}`, weight: rules.paymentWeight },
        { id: 'admin', label: 'Changes and new keys', weight: rules.adminWeight },
      ]
    : [{ id: 'base', label: 'Payments and changes', weight: threshold }]
  return tiers.map((tier) => {
    const sets = approvalSets(signers, tier.weight)
    return { ...tier, sets, summary: describeApprovalSets(sets, signers) }
  })
}

export function analyzeAccount(account: SandboxAccount): AccountHealth {
  if (!isCreated(account))
    return {
      valid: false,
      issues: [],
      notices: [
        {
          id: 'not-created',
          tone: 'warning',
          message: 'No signers yet. Add the first one to create the account.',
        },
      ],
      tiers: [],
      summary: 'Not created',
      recommended: false,
    }
  const owners = configuredSigners(account)
  const issues = validateAccount(account)
  const valid = issues.length === 0
  const tiers = approvalTiers(account, owners)
  const summary = valid ? `Threshold ${account.threshold}: ${tiers[0].summary}` : 'Not applied'
  const notices: Notice[] = issues.map((issue, index) => ({
    id: `issue-${index}`,
    tone: 'error',
    message: issue.message,
  }))
  if (!valid) return { valid, issues, notices, tiers, summary, recommended: false }

  const { rules, threshold } = account
  const changeWeight = rules.enabled ? rules.adminWeight : threshold
  const lost = owners.filter((signer) => signer.lost)
  let locked = false
  if (lost.length > 0) {
    const usable = usableSigners(owners)
    const sets = approvalSets(usable, changeWeight)
    const what = lost.length === 1 ? 'the lost signer' : 'the lost signers'
    locked = sets.length === 0
    notices.push(
      locked
        ? {
            id: 'recovery',
            tone: 'error',
            message: `Locked out: remaining signers can’t reach weight ${changeWeight}.`,
          }
        : {
            id: 'recovery',
            tone: 'ok',
            message: `Recoverable: ${describeApprovalSets(sets, usable)} can replace ${what}.`,
          },
    )
  }

  if (owners.length > 0 && owners.every(isLogin))
    notices.push({
      id: 'logins-alone',
      tone: 'warning',
      message: 'Only logins can approve. Add a passkey for large balances.',
    })
  const outside = owners.filter(
    (signer) => signer.holder === 'provider' && signer.weight >= threshold,
  )
  if (outside.length > 0)
    notices.push({
      id: 'provider-alone',
      tone: 'warning',
      message: 'One key you don’t hold can move funds alone.',
      signerIds: outside.map((signer) => signer.id),
    })
  if (!locked) {
    const changeSets = approvalSets(owners, changeWeight)
    const critical = owners.filter((signer) => changeSets.every((set) => set.includes(signer)))
    if (owners.length === 1)
      notices.push({
        id: 'no-backup',
        tone: 'warning',
        message: 'No backup signer: losing it locks the account.',
      })
    else if (critical.length === owners.length)
      notices.push({
        id: 'no-backup',
        tone: 'warning',
        message: rules.enabled
          ? 'Changes need every signer: losing one blocks recovery.'
          : 'Every signer must approve: losing one locks the account.',
      })
    else if (critical.length > 0)
      notices.push({
        id: 'no-backup',
        tone: 'warning',
        message: `No backup for ${joinAnd(critical.map(soloName))}.`,
        signerIds: critical.map((signer) => signer.id),
      })
  }
  const recommended =
    account.recommended &&
    account.version === account.startVersion &&
    account.rulesRevision === account.startRulesRevision &&
    notices.length === 0
  return { valid, issues, notices, tiers, summary, recommended }
}
