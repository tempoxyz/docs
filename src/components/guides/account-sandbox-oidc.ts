/**
 * Real login signers for the account sandbox on the internal PR-8211 devnet: Google and Privy
 * sign-in through a locally running oidc-demos auth app (its relay, its issuer for bridged Privy
 * tokens, and the hosted prover). Each sign-in proves an OIDC ID token
 * in zero knowledge (TIP-1130, TIP-1131) and returns a login owner: a ZK signer address that a
 * configurable account lists as an owner.
 *
 * - The relay runs at `http://localhost:5173` with `WEB_URL` set to this docs origin, so only
 *   local dev and preview (`http://localhost:5179`) can use it. `isRelayAvailable` probes it.
 * - `signIn` opens the auth app's sign-in page in a popup. The relay redirects the popup to
 *   `/oidc-callback.html` with the credential in the URL fragment, and that page hands it back
 *   with `postMessage` (same origin only) or a `BroadcastChannel` when the opener is gone.
 * - A credential lasts at most 10 minutes from sign-in. Until then, the P-256 key it commits to
 *   signs owner approvals as a ZK signature (`0x06`) inside the account's configurable signature
 *   (`0x05`). After that, the login needs a new sign-in to approve again; its address stays the
 *   same for the same identity.
 * - viem refuses ZK owner approvals (`fromConfig` accepts primitive owners only), so this module
 *   builds the configurable signature with `ox-zk` (ox PR #505, `95d0516`) and serializes the
 *   signed transaction itself. Verified on devnet 8211.
 *
 * Import this module dynamically, like the devnet adapter, so the ox preview stays out of
 * production bundles.
 */

import { Address as OxAddress, Hex as OxHex, P256 } from 'ox-zk'
import {
  KeyAuthorization,
  MultisigConfig,
  Oidc,
  SignatureEnvelope,
  TxEnvelopeTempo,
  ZkSignature,
} from 'ox-zk/tempo'
import { encodeFunctionData, type Hex, type TransactionReceipt } from 'viem'
import * as Tempo from 'viem/tempo'

type Address = `0x${string}`

// ---------------------------------------------------------------------------
// Constants

/** The local oidc-demos auth app: sign-in page, relay, and Privy issuer. */
export const relayOrigin = 'http://localhost:5173'
export const relayChainId = 31_318
/** Where the relay sends the popup back to, on this docs origin. */
export const callbackPath = '/oidc-callback.html'
export const callbackMessageType = 'tempo-oidc-callback'
export const callbackChannel = 'tempo-oidc'
export const googleIssuer = 'https://accounts.google.com'

export const loginMethods = ['google', 'privy'] as const
export type LoginMethod = (typeof loginMethods)[number]

/** What each method's UI says while the popup is open. */
export const loginPromptLabels: Record<LoginMethod, string> = {
  google: 'Sign in with Google…',
  privy: 'Sign in with Privy…',
}

/** What a different identity is called when a renewed sign-in doesn't match. */
export const loginAccountNouns: Record<LoginMethod, string> = {
  google: 'Google account',
  privy: 'Privy account',
}

/**
 * Gas each login approval adds. Estimation models only primitive owner signatures; a ZK approval
 * measured 630,000 gas more on devnet 8211 (proof check plus Key Publisher read).
 */
export const loginApprovalGas = 650_000n
/** A transaction carries at most two ZK signatures (TIP-1131). */
export const maxLoginsPerTransaction = 2
/** The relay accepts a credential that lasts at most 600 s; this leaves 60 s for clock skew. */
export const credentialLifetimeSeconds = 540

const accountKeychain: Address = '0xaAAAaaAA00000000000000000000000000000000'
const signatureTypes = { secp256k1: 0, p256: 1, webAuthn: 2, configurable: 3 } as const

// ---------------------------------------------------------------------------
// Types

export type LoginCredential = ZkSignature.Credential

/** A login owner: the ZK signer a configurable account lists, with its live credential. */
export type LoginOwner = {
  type: 'login'
  method: LoginMethod
  /** The login's signer address, which a configurable account lists as an owner. */
  address: Address
  /** The P-256 key the credential commits to. It signs every approval. */
  accessKeyAddress: Address
  credential: LoginCredential
  issuer: string
  /** Unix seconds after which the login can't approve without a new sign-in. */
  validUntil: number
  secondsLeft(now?: number): number
  /** Sign a configurable-account approval digest. Returns a serialized ZK signature (`0x06`). */
  approve(digest: Hex): Promise<Hex>
}

/** A primitive owner key (secp256k1, P-256, or WebAuthn), as viem accounts expose it. */
export type KeyApprover = {
  address: Address
  sign(parameters: { hash: Hex }): Promise<Hex>
}

export type Approver = LoginOwner | KeyApprover

/** A configurable account's configuration (`AccountConfig.Config`). */
export type ConfigurableConfig = {
  owners: readonly { owner: Address; weight: number }[]
  salt: Hex
  threshold: number
  version: bigint
}

export type SignInResult = {
  method: LoginMethod
  credential: LoginCredential
  /** `iss`: Google for Google, the relay's own issuer for Privy. */
  issuer: string
  /**
   * The identity's address seed: a hash of `sub`, `aud`, and the relay's salt. The relay doesn't
   * reveal `sub`, so this is the stable, pseudonymous subject.
   */
  subject: Hex
  /** The verified email the relay reports beside the credential, when it has one. */
  email?: string
  /** A Privy sign-in's user DID, such as `did:privy:cm…`. */
  privy?: string
  owner: LoginOwner
}

export type LoginErrorCode =
  | 'relay-unavailable'
  | 'popup-blocked'
  | 'cancelled'
  | 'timeout'
  | 'sign-in-failed'
  | 'login-expired'
  | 'wrong-identity'
  | 'too-many-logins'
  | 'not-an-owner'
  | 'below-threshold'

export class LoginError extends Error {
  readonly code: LoginErrorCode
  constructor(code: LoginErrorCode, message: string) {
    super(message)
    this.name = 'LoginError'
    this.code = code
  }
}

export function isLoginOwner(approver: Approver): approver is LoginOwner {
  return (approver as LoginOwner).type === 'login'
}

// ---------------------------------------------------------------------------
// Relay probe

export type RelayStatus = {
  chainId: number
  issuers: readonly string[]
  /** Login methods the relay can sign in with now. */
  methods: readonly LoginMethod[]
}

/**
 * Methods a relay config offers. A relay that lists `methods` (the Privy build does) is taken at its
 * word; otherwise its issuers decide: Google issues Google tokens. Privy needs an explicit `methods`
 * entry, since the relay bridges each Privy sign-in into its own ID token.
 */
export function relayMethods(config: {
  issuers?: readonly unknown[]
  methods?: readonly unknown[]
}): LoginMethod[] {
  if (Array.isArray(config.methods))
    return loginMethods.filter((method) => config.methods?.includes(method))
  const issuers = config.issuers ?? []
  return issuers.includes(googleIssuer) ? ['google'] : []
}

/** The relay's config, or `null` when this page can't use it (HTTPS page, down, wrong chain). */
export async function checkRelay(
  options: {
    url?: string
    timeoutMs?: number
    fetch?: typeof globalThis.fetch
    protocol?: string
  } = {},
): Promise<RelayStatus | null> {
  const {
    url = relayOrigin,
    timeoutMs = 2_000,
    fetch: fetchFn = globalThis.fetch,
    protocol = globalThis.location?.protocol,
  } = options
  if (protocol === 'https:' || !fetchFn) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchFn(`${url}/api/config`, { signal: controller.signal })
    if (!response.ok) return null
    const body = (await response.json()) as {
      chainId?: unknown
      issuers?: unknown
      methods?: unknown
    }
    if (body.chainId !== relayChainId || !Array.isArray(body.issuers)) return null
    const methods = relayMethods({
      issuers: body.issuers,
      methods: Array.isArray(body.methods) ? body.methods : undefined,
    })
    return {
      chainId: relayChainId,
      issuers: body.issuers.filter((issuer): issuer is string => typeof issuer === 'string'),
      methods,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

let probed: Promise<RelayStatus | null> | undefined

/** `checkRelay`, once per page. */
export function probeRelay() {
  probed ??= checkRelay()
  return probed
}

/** True when the local auth app is up, on chain 31318, and reachable from this page. */
export async function isRelayAvailable(method?: LoginMethod) {
  const status = await probeRelay()
  if (!status) return false
  return method ? status.methods.includes(method) : status.methods.length > 0
}

// ---------------------------------------------------------------------------
// Sign-in: pure parts

/** A fresh P-256 login key and the commitment its sign-in's nonce makes to it. */
export function prepareLogin(options: { privateKey?: Hex; now?: number; lifetime?: number } = {}) {
  const {
    privateKey = P256.randomPrivateKey(),
    now = Date.now() / 1_000,
    lifetime = credentialLifetimeSeconds,
  } = options
  const publicKey = P256.getPublicKey({ privateKey })
  const { accessKeyAddress, blinding, validUntil } = Oidc.prepare({
    publicKey,
    validUntil: Math.floor(now) + lifetime,
  })
  return { privateKey, accessKeyAddress, blinding, validUntil }
}

/** The callback URL for one sign-in. The relay only returns to its `WEB_URL` origin. */
export function callbackUrl(origin: string, requestId: string) {
  return `${origin}${callbackPath}?request=${encodeURIComponent(requestId)}`
}

export type CallbackMessage = {
  type: typeof callbackMessageType
  request: string
  credential?: string | null
  error?: string | null
  email?: string | null
  /** A Privy sign-in's user DID. */
  privy?: string | null
}

export type CallbackResult =
  | { error: string; credential?: undefined }
  | {
      error?: undefined
      credential: LoginCredential
      email?: string
      privy?: string
    }

/** Read what the callback page passed on: a credential, or the relay's error. */
export function parseCallback(message: unknown, requestId: string): CallbackResult | null {
  if (!message || typeof message !== 'object') return null
  const data = message as Partial<CallbackMessage>
  if (data.type !== callbackMessageType || data.request !== requestId) return null
  if (data.error) return { error: String(data.error) }
  if (!data.credential) return { error: 'The local auth app returned no credential.' }
  let credential: LoginCredential
  try {
    credential = JSON.parse(data.credential) as LoginCredential
    ZkSignature.assert(credential)
  } catch {
    return { error: 'The local auth app returned a malformed credential.' }
  }
  return {
    credential,
    ...(data.email ? { email: String(data.email) } : {}),
    ...(data.privy ? { privy: String(data.privy) } : {}),
  }
}

/**
 * `iss` for each method: Privy tokens come from the relay itself. The relay checks
 * each Privy sign-in and issues its own RS256 ID token for it, so Privy's issuer never reaches the
 * proof.
 */
export function issuerFor(method: LoginMethod, origin = relayOrigin) {
  return method === 'google' ? googleIssuer : origin
}

/** The login owner for a credential and the P-256 key it commits to. */
export function loginOwner(options: {
  credential: LoginCredential
  privateKey: Hex
  method: LoginMethod
  issuer?: string
}): LoginOwner {
  const { credential, privateKey, method, issuer = issuerFor(method) } = options
  ZkSignature.assert(credential)
  const publicKey = P256.getPublicKey({ privateKey })
  const secondsLeft = (now = Date.now() / 1_000) => credential.validUntil - Math.floor(now)
  return {
    type: 'login',
    method,
    address: ZkSignature.getAddress(credential),
    accessKeyAddress: OxAddress.fromPublicKey(publicKey),
    credential,
    issuer,
    validUntil: credential.validUntil,
    secondsLeft,
    async approve(digest) {
      if (secondsLeft() < 0)
        throw new LoginError('login-expired', 'This login expired. Sign in again to approve.')
      return zkApproval({ credential, digest, privateKey, publicKey })
    },
  }
}

/** A ZK signature over `digest`: the credential, plus the login key's P-256 signature. */
export function zkApproval(options: {
  credential: LoginCredential
  digest: Hex
  privateKey: Hex
  publicKey?: ReturnType<typeof P256.getPublicKey>
}): Hex {
  const { credential, digest, privateKey } = options
  const publicKey = options.publicKey ?? P256.getPublicKey({ privateKey })
  const payload = ZkSignature.getSignPayload({ credential, payload: digest })
  const signature = P256.sign({ payload, privateKey })
  return SignatureEnvelope.serialize(
    SignatureEnvelope.from({
      ...credential,
      accessKeySignature: { prehash: false, publicKey, signature, type: 'p256' },
      type: 'zk',
    }),
  )
}

/** Whether `owner` needs a new sign-in before it can approve, with `margin` seconds to spare. */
export function needsSignIn(owner: Pick<LoginOwner, 'validUntil'> | undefined, margin = 30) {
  return !owner || owner.validUntil - Math.floor(Date.now() / 1_000) < margin
}

/** An email address with all but the first letter of its name hidden, like `l•••@tempo.xyz`. */
export function maskEmail(email: string) {
  const at = email.lastIndexOf('@')
  if (at < 1) return email
  return `${email.slice(0, 1)}•••${email.slice(at)}`
}

/** A DID with its ID cut to the first and last four characters, like `did:privy:cmab…7xyz`. */
export function shortenDid(did: string) {
  const colon = did.lastIndexOf(':')
  const id = did.slice(colon + 1)
  if (id.length <= 9) return did
  return `${did.slice(0, colon + 1)}${id.slice(0, 4)}…${id.slice(-4)}`
}

/** How a Privy login reads: its masked verified email, else its shortened DID. */
export function maskPrivyIdentity(options: {
  email?: string | undefined
  did?: string | undefined
}) {
  if (options.email) return maskEmail(options.email)
  if (options.did) return shortenDid(options.did)
  return undefined
}

/**
 * How the sandbox names a real login: the Google account or the Privy account.
 */
export function loginIdentity(options: {
  method: LoginMethod
  address: Address
  email?: string | undefined
  /** A Privy sign-in's user DID. */
  privy?: string | undefined
}) {
  const { method, address, email, privy } = options
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`
  // The relay asks Google for `openid email` and returns the verified email beside the credential.
  if (method === 'google')
    return email
      ? { subject: email, detail: `OIDC · Google · ${email}` }
      : { subject: address, detail: `OIDC · Google account · ${short}` }
  if (method === 'privy') {
    const masked = maskPrivyIdentity({ email, did: privy })
    return masked
      ? { subject: masked, detail: `OIDC · Privy · ${masked}` }
      : { subject: address, detail: `OIDC · Privy · ${short}` }
  }
  return { subject: address, detail: `OIDC · ${short}` }
}

// ---------------------------------------------------------------------------
// Sign-in: popup

/**
 * Open the sign-in popup. Call it synchronously in the click handler, before any `await`, so the
 * browser doesn't block it, and pass it to `signIn` as `popup`.
 */
export function openSignInWindow() {
  if (typeof window === 'undefined') return null
  const width = 480
  const height = 680
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 3)
  const popup = window.open(
    'about:blank',
    'tempo-sandbox-sign-in',
    `popup,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`,
  )
  // The page has nothing to show until the relay answers, so say what's coming. The popup is its
  // own blank document, outside the site's compiled styles, so it carries a small stylesheet.
  try {
    if (popup) {
      const { document } = popup
      document.title = 'Signing in'
      const sheet = document.createElement('style')
      sheet.textContent =
        'body{font:15px/1.5 system-ui,sans-serif;display:grid;place-items:center;min-height:90vh;margin:0}'
      document.head.append(sheet)
      document.body.textContent = 'Preparing sign-in…'
    }
  } catch {}
  return popup
}

async function postJson(url: string, body: unknown, signal?: AbortSignal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  }).catch(() => {
    throw new LoginError('relay-unavailable', 'The local auth app isn’t running.')
  })
  const result = (await response.json().catch(() => ({}))) as { error?: string; url?: string }
  if (!response.ok || !result.url)
    throw new LoginError('sign-in-failed', result.error ?? 'The auth app refused the sign-in.')
  return result.url
}

function waitForCallback(options: {
  popup: Window
  requestId: string
  timeoutMs: number
  signal?: AbortSignal
}) {
  const { popup, requestId, timeoutMs, signal } = options
  return new Promise<CallbackResult>((resolve, reject) => {
    const channel =
      typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(callbackChannel)
    const cleanup = () => {
      window.removeEventListener('message', onMessage)
      channel?.close()
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
    const settle = (data: unknown) => {
      const parsed = parseCallback(data, requestId)
      if (!parsed) return
      cleanup()
      resolve(parsed)
    }
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      settle(event.data)
    }
    const fail = (error: LoginError) => {
      cleanup()
      if (!popup.closed) popup.close()
      reject(error)
    }
    const onAbort = () => fail(new LoginError('cancelled', 'Sign-in cancelled.'))
    window.addEventListener('message', onMessage)
    if (channel) channel.onmessage = (event) => settle(event.data)
    signal?.addEventListener('abort', onAbort)
    // No closed-window check: Google's pages isolate the popup (COOP), which makes it look closed
    // from here while the person is still signing in, and Privy's social logins can hand the popup
    // to such a page. The timeout and `signal` end an abandoned sign-in.
    const timer = setTimeout(() => fail(new LoginError('timeout', 'Sign-in timed out.')), timeoutMs)
  })
}

/**
 * Sign in with a real login and return its owner. Privy opens the relay's sign-in page with
 * Privy's sign-in; Google goes straight to Google. The popup must come from `openSignInWindow` in the click handler, or
 * this opens one itself (and may be blocked).
 */
export async function signIn(options: {
  method: LoginMethod
  /** The P-256 key the login commits to. A fresh one when omitted. */
  accessKey?: { privateKey: Hex }
  popup?: Window | null
  relayUrl?: string
  signal?: AbortSignal
  timeoutMs?: number
}): Promise<SignInResult> {
  const { method, relayUrl = relayOrigin, signal, timeoutMs = 10 * 60_000 } = options
  const popup = options.popup ?? openSignInWindow()
  if (!popup) throw new LoginError('popup-blocked', 'Allow pop-ups to sign in.')
  try {
    const prepared = prepareLogin({ privateKey: options.accessKey?.privateKey })
    const requestId = OxHex.random(16)
    const pageUrl = await postJson(
      `${relayUrl}/api/authorize`,
      {
        accessKeyAddress: prepared.accessKeyAddress,
        blinding: prepared.blinding,
        validUntil: prepared.validUntil,
        mode: 'redirect',
        returnTo: callbackUrl(window.location.origin, requestId),
      },
      signal,
    )
    const target = await (async () => {
      if (method === 'google') {
        const state = new URL(pageUrl).searchParams.get('state')
        return postJson(`${relayUrl}/api/redirect`, { provider: 'google', state }, signal)
      }
      // The relay's page offers every method; `method` lets a build preselect one.
      const url = new URL(pageUrl)
      url.searchParams.set('method', method)
      return url.toString()
    })()
    popup.location.href = target
    const result = await waitForCallback({ popup, requestId, timeoutMs, signal })
    if (!popup.closed) popup.close()
    if (result.error !== undefined) throw new LoginError('sign-in-failed', result.error)
    if (result.credential.validUntil !== prepared.validUntil)
      throw new LoginError('sign-in-failed', 'The credential is for a different sign-in.')
    const owner = loginOwner({
      credential: result.credential,
      privateKey: prepared.privateKey,
      method,
      issuer: issuerFor(method, relayUrl),
    })
    return {
      method,
      credential: result.credential,
      issuer: owner.issuer,
      subject: result.credential.addressSeed,
      ...(result.email ? { email: result.email } : {}),
      ...(result.privy ? { privy: result.privy } : {}),
      owner,
    }
  } catch (error) {
    if (!popup.closed) popup.close()
    throw error
  }
}

/** Sign in again as `owner` (its credential expired) and check it's the same identity. */
export async function renewLogin(
  owner: Pick<LoginOwner, 'address' | 'method'>,
  options: Omit<Parameters<typeof signIn>[0], 'method'> = {},
) {
  const result = await signIn({ ...options, method: owner.method })
  if (result.owner.address.toLowerCase() !== owner.address.toLowerCase())
    throw new LoginError(
      'wrong-identity',
      `Signed in as a different ${loginAccountNouns[owner.method]}.`,
    )
  return result
}

// ---------------------------------------------------------------------------
// Signing as a configurable account with login approvals

/**
 * Approvers from `approvers`, in order, until their weight reaches the threshold. Throws when an
 * approver isn't an owner, the weight falls short, or more than two logins are needed.
 */
export function chooseApprovers<approver extends Approver>(
  config: Pick<ConfigurableConfig, 'owners' | 'threshold'>,
  approvers: readonly approver[],
) {
  const chosen: approver[] = []
  let weight = 0
  for (const approver of approvers) {
    if (weight >= config.threshold) break
    const owner = config.owners.find(
      (item) => item.owner.toLowerCase() === approver.address.toLowerCase(),
    )
    if (!owner)
      throw new LoginError('not-an-owner', `${approver.address} isn’t an owner on devnet.`)
    if (chosen.some((item) => item.address.toLowerCase() === approver.address.toLowerCase()))
      continue
    chosen.push(approver)
    weight += owner.weight
  }
  if (weight < config.threshold)
    throw new LoginError('below-threshold', 'The approvers don’t reach the devnet threshold.')
  if (chosen.filter(isLoginOwner).length > maxLoginsPerTransaction)
    throw new LoginError('too-many-logins', 'A transaction can carry at most two logins.')
  return chosen
}

/** Gas to add on top of an estimate for `approvers`' login approvals. */
export function loginGas(approvers: readonly Approver[]) {
  return BigInt(approvers.filter(isLoginOwner).length) * loginApprovalGas
}

/** The configurable signature (`0x05`) over `payload`, with ZK approvals for login owners. */
export async function configurableSignature(options: {
  account: Address
  config: ConfigurableConfig
  payload: Hex
  approvers: readonly Approver[]
}) {
  const { account, payload } = options
  const config = MultisigConfig.from(options.config)
  const chosen = chooseApprovers(options.config, options.approvers)
  const digest = MultisigConfig.getSignPayload({ account, config, payload })
  const approvals = await Promise.all(
    chosen.map(async (approver) =>
      SignatureEnvelope.from(
        isLoginOwner(approver)
          ? await approver.approve(digest)
          : await approver.sign({ hash: digest }),
      ),
    ),
  )
  return SignatureEnvelope.from({
    account,
    config,
    signatures: SignatureEnvelope.sortMultisigApprovals({
      account,
      config,
      payload,
      signatures: approvals as SignatureEnvelope.Primitive[],
    }),
    type: 'multisig',
  })
}

/** Sign an unsigned Tempo transaction (`0x76…`) from a configurable account. */
export async function signConfigurableTransaction(options: {
  unsigned: Hex
  account: Address
  config: ConfigurableConfig
  approvers: readonly Approver[]
}): Promise<Hex> {
  const envelope = TxEnvelopeTempo.deserialize(options.unsigned as TxEnvelopeTempo.Serialized)
  const signature = await configurableSignature({
    account: options.account,
    config: options.config,
    payload: TxEnvelopeTempo.getSignPayload(envelope),
    approvers: options.approvers,
  })
  return TxEnvelopeTempo.serialize(envelope, { signature })
}

type SendingClient = {
  prepareTransactionRequest(parameters: Record<string, unknown>): Promise<Record<string, unknown>>
  sendRawTransactionSync(parameters: { serializedTransaction: Hex }): Promise<TransactionReceipt>
}

/**
 * Send `calls` from a configurable account whose quorum may include logins. `account` is the
 * adapter's `Account.fromConfig(…)` for the on-chain configuration (owners may be bare addresses).
 * Estimation can't model ZK approvals, so each login adds `loginApprovalGas`.
 */
export async function sendFromConfigurable(options: {
  client: unknown
  account: { address: string; config?: unknown }
  config: ConfigurableConfig
  approvers: readonly Approver[]
  calls: readonly { to: Address; data?: Hex; value?: bigint }[]
  gas?: bigint
}): Promise<TransactionReceipt> {
  const client = options.client as SendingClient
  const address = options.account.address as Address
  const chosen = chooseApprovers(options.config, options.approvers)
  const prepared = await client.prepareTransactionRequest({
    account: options.account,
    calls: options.calls,
    ...(options.gas ? { gas: options.gas } : {}),
  })
  const gas = options.gas ?? (prepared.gas as bigint) + loginGas(chosen)
  const unsigned = (await Tempo.Transaction.serialize({
    ...prepared,
    gas,
    signatures: undefined,
  } as never)) as Hex
  const serializedTransaction = await signConfigurableTransaction({
    unsigned,
    account: address,
    config: options.config,
    approvers: chosen,
  })
  const receipt = await client.sendRawTransactionSync({ serializedTransaction })
  if (receipt.status !== 'success') throw new Error(`Devnet reverted ${receipt.transactionHash}.`)
  return receipt
}

/** Gas for an access key's first payment: authorizing the key, registering the account, paying. */
export const firstKeyUseGas = 3_500_000n

/**
 * Pay with an access key in the transaction that authorizes it. The transfer is signed by the key
 * and carries a key authorization that `approvers`, a quorum with at most one login, signed (one
 * ZK proof per login). Estimation can't model it, so it sends a fixed gas limit.
 */
export async function sendWithKeyAuthorization(options: {
  client: unknown
  /** The configurable account the key spends for. */
  account: Address
  config: ConfigurableConfig
  approvers: readonly Approver[]
  /** The access key's viem account, bound to `account`. Its signature wraps itself for the account. */
  accessKey: { sign(parameters: { hash: Hex }): Promise<Hex> }
  key: {
    address: Address
    type: 'secp256k1' | 'p256' | 'webAuthn'
    expiry?: number
    limits: readonly { token: Address; limit: bigint; period?: number }[]
    scopes?: readonly Scope[]
  }
  chainId: number
  calls: readonly { to: Address; data?: Hex; value?: bigint }[]
}): Promise<TransactionReceipt> {
  const client = options.client as SendingClient
  const { account, config, key } = options
  const chosen = chooseApprovers(config, options.approvers)
  if (chosen.filter(isLoginOwner).length > 1)
    throw new LoginError('too-many-logins', 'A first key payment can carry one login.')
  const authorization = KeyAuthorization.from({
    account,
    address: key.address,
    chainId: BigInt(options.chainId),
    type: key.type,
    ...(key.expiry ? { expiry: key.expiry } : {}),
    limits: key.limits.map(({ token, limit, period }) => ({
      token,
      limit,
      ...(period ? { period } : {}),
    })),
    ...(key.scopes ? { scopes: key.scopes } : {}),
  } as never)
  const signature = await configurableSignature({
    account,
    config,
    payload: KeyAuthorization.getSignPayload(authorization),
    approvers: chosen,
  })
  const keyAuthorization = KeyAuthorization.from(authorization, { signature } as never)
  const gas = firstKeyUseGas + loginGas(chosen)
  const prepared = await client.prepareTransactionRequest({
    account: options.accessKey,
    calls: options.calls,
    gas,
  })
  const unsigned = (await Tempo.Transaction.serialize({
    ...prepared,
    gas,
    signatures: undefined,
  } as never)) as Hex
  const envelope = TxEnvelopeTempo.from({
    ...TxEnvelopeTempo.deserialize(unsigned as TxEnvelopeTempo.Serialized),
    keyAuthorization,
  } as never)
  // The access key's account adds the `0x04 || payload || account` binding and the keychain wrapper.
  const keySignature = await options.accessKey.sign({
    hash: TxEnvelopeTempo.getSignPayload(envelope),
  })
  const serializedTransaction = TxEnvelopeTempo.serialize(envelope, {
    signature: SignatureEnvelope.from(keySignature),
  } as never)
  const receipt = await client.sendRawTransactionSync({ serializedTransaction })
  if (receipt.status !== 'success') throw new Error(`Devnet reverted ${receipt.transactionHash}.`)
  return receipt
}

// ---------------------------------------------------------------------------
// Calls a login quorum sends (one ZK signature per login, unlike `keyAuthorization`)

type Scope = { address: Address; selector?: Hex | string; recipients?: readonly Address[] }

/**
 * Authorize an access key by calling the keychain precompile from the account. A key
 * authorization would need the quorum's signatures twice (the transaction and the
 * authorization), which caps a login quorum at one login.
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

/** The configuration after an update: same salt, next version. */
export function nextConfig(
  current: ConfigurableConfig,
  next: Pick<ConfigurableConfig, 'owners' | 'threshold'>,
): ConfigurableConfig {
  return MultisigConfig.from({
    owners: next.owners,
    salt: current.salt,
    threshold: next.threshold,
    version: current.version + 1n,
  })
}

/** The account's `updateConfig` call, for a login quorum to send. */
export function updateConfigCall(
  current: ConfigurableConfig,
  next: Pick<ConfigurableConfig, 'owners' | 'threshold'>,
) {
  const { to, data } = Tempo.Actions.accounts.updateConfig.call({
    currentConfig: current,
    nextConfig: next,
  })
  return { to, data }
}
