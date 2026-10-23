import { useEffect, useState } from 'react'
import { bytesToHex, concat, sha256, stringToBytes } from 'viem'

// Stellar browser wallets, with no Stellar SDK bundled: Hana, OneKey, and Bitget inject a provider
// into the page. Routes prepares the payment envelope, so the demo checks the wallet signed it
// unchanged, then submits it to Horizon itself.

/** Routes names Stellar's public network `stellar:pubnet`. */
export const stellarMainnet = 'stellar:pubnet'
const networkPassphrase = 'Public Global Stellar Network ; September 2015'
// Horizon allows browser requests (CORS `*`) and explains rejected submissions with result codes.
const horizon = 'https://horizon.stellar.org'

export type StellarWallet = {
  id: string
  name: string
  /** Resolves to the account the reader approves sharing; prompts when the site is new to it. */
  getAddress(): Promise<string>
  /** Resolves to the signed envelope as base64 XDR. */
  signTransaction(xdr: string, address: string): Promise<string>
}

type Signed = string | { signedTxXdr?: string } | undefined
type HanaProvider = {
  getPublicKey(): Promise<string>
  signTransaction(options: {
    xdr: string
    accountToSign: string
    networkPassphrase: string
  }): Promise<Signed>
}
/** OneKey and Bitget take SEP-43's `signTransaction(xdr, { address, networkPassphrase })`. */
type Sep43Provider = {
  connect?(): Promise<string>
  getPublicKey?(): Promise<string>
  signTransaction(
    xdr: string,
    options: { address: string; networkPassphrase: string },
  ): Promise<Signed>
}
const signedXdr = (result: Signed) =>
  typeof result === 'string' ? result : (result?.signedTxXdr ?? '')

/** The Stellar wallets that injected a provider into this page. */
export function injectedStellarWallets(): StellarWallet[] {
  const w = window as unknown as {
    hanaWallet?: { stellar?: HanaProvider }
    $onekey?: { stellar?: Sep43Provider }
    bitkeep?: { stellar?: Sep43Provider }
  }
  const hana = w.hanaWallet?.stellar
  const sep43 = (id: string, name: string, provider: Sep43Provider | undefined) =>
    provider
      ? [
          {
            id,
            name,
            // Bitget shares the account through `connect`, OneKey through `getPublicKey`.
            getAddress: async () =>
              (await (provider.connect ? provider.connect() : provider.getPublicKey?.())) ?? '',
            signTransaction: async (xdr: string, address: string) =>
              signedXdr(await provider.signTransaction(xdr, { address, networkPassphrase })),
          },
        ]
      : []
  return [
    ...(hana
      ? [
          {
            id: 'hana',
            name: 'Hana Wallet',
            getAddress: () => hana.getPublicKey(),
            signTransaction: async (xdr: string, address: string) =>
              signedXdr(
                await hana.signTransaction({ xdr, accountToSign: address, networkPassphrase }),
              ),
          },
        ]
      : []),
    ...sep43('onekey', 'OneKey', w.$onekey?.stellar),
    ...sep43('bitget', 'Bitget Wallet', w.bitkeep?.stellar),
  ]
}

/** Every Stellar wallet in this browser. */
export function useStellarWallets(): StellarWallet[] {
  const [wallets, setWallets] = useState<StellarWallet[]>([])
  useEffect(() => {
    const emit = () => setWallets(injectedStellarWallets())
    emit()
    // Extensions can inject their provider after the page's scripts run.
    const late = setTimeout(emit, 1_000)
    return () => clearTimeout(late)
  }, [])
  return wallets
}

/** Ask the wallet for its Stellar account, as `sender` when one is required. */
async function connectStellar(wallet: StellarWallet, sender?: string) {
  const address = await wallet.getAddress()
  if (!/^G[A-Z2-7]{55}$/.test(address)) throw new Error(`Unlock ${wallet.name}, then try again.`)
  if (sender && address !== sender)
    throw new Error(`Switch ${wallet.name} to the sender, ${sender}.`)
  return address
}

/** Connect a Stellar wallet only to read its address. */
export const connectStellarAccount = (wallet: StellarWallet) => connectStellar(wallet)

const fromBase64 = (text: string) => {
  try {
    return Uint8Array.from(atob(text), (char) => char.charCodeAt(0))
  } catch {
    return undefined
  }
}
/** An unsigned envelope: ENVELOPE_TYPE_TX (2), the transaction, then a zero signature count. */
function unsignedEnvelope(xdr: string) {
  const bytes = fromBase64(xdr)
  if (
    !bytes ||
    bytes.length < 12 ||
    bytes[0] !== 0 ||
    bytes[1] !== 0 ||
    bytes[2] !== 0 ||
    bytes[3] !== 2 ||
    bytes.slice(-4).some(Boolean)
  )
    throw new Error('Routes returned a Stellar envelope this demo cannot sign.')
  return bytes
}

/**
 * The hash Horizon and Routes identify the payment by: SHA-256 of the network ID followed by the
 * envelope type and transaction, which are the unsigned envelope's bytes before its signature count.
 */
export function stellarTransactionHash(xdr: string) {
  const networkId = sha256(stringToBytes(networkPassphrase), 'bytes')
  return bytesToHex(sha256(concat([networkId, unsignedEnvelope(xdr).slice(0, -4)]), 'bytes')).slice(
    2,
  )
}

/** Whether `signed` carries the unsigned envelope's exact transaction and at least one signature. */
export function signsUnchanged(unsigned: string, signed: string) {
  const before = unsignedEnvelope(unsigned)
  const after = fromBase64(signed)
  const length = before.length - 4
  if (!after || after.length <= before.length) return false
  for (let i = 0; i < length; i++) if (after[i] !== before[i]) return false
  return new DataView(after.buffer, after.byteOffset + length, 4).getUint32(0) > 0
}

type ResultCodes = { transaction?: string; operations?: string[] }
const rejections: Record<string, string> = {
  tx_bad_auth:
    'The signature does not authorize the sender account. Check that the wallet is on Stellar mainnet.',
  tx_bad_seq:
    'The sender sent another Stellar transaction after this transfer was created, so this payment can no longer land. Start a new test.',
  tx_insufficient_balance:
    'The sender needs more XLM for the network fee and its reserve. Add XLM, then try again.',
  tx_insufficient_fee: 'Stellar fees are above this payment’s bid right now. Try again shortly.',
  tx_no_source_account: 'The sender account does not exist on Stellar mainnet.',
  tx_too_late: 'The quote expired before the payment reached Stellar. Start a new test.',
}
const failures: Record<string, string> = {
  op_no_destination: 'The deposit account does not exist.',
  op_no_trust: 'The deposit account cannot hold this asset.',
  op_src_no_trust: 'The sender has no trustline for this asset.',
  op_src_not_authorized: 'The asset issuer has not authorized the sender to send it.',
  op_underfunded: 'The sender does not hold enough of this asset.',
}

type HorizonTransaction = { successful?: boolean }
/** The included transaction, `null` when Horizon has no record of it, or `undefined` without an answer. */
async function lookup(hash: string): Promise<HorizonTransaction | null | undefined> {
  const response = await fetch(`${horizon}/transactions/${hash}`).catch(() => undefined)
  if (response?.status === 404) return null
  if (!response?.ok) return undefined
  return (await response.json().catch(() => undefined)) as HorizonTransaction | undefined
}

/**
 * Sign Routes' prepared envelope in the wallet, then submit it to Horizon. `onHash` receives the
 * hash before submission, so a lost answer is resolved by waiting, never by sending again.
 */
export async function sendStellarTransaction(options: {
  wallet: StellarWallet
  sender: string
  xdr: string
  onHash?: (hash: string) => void
}) {
  const { wallet, sender, xdr } = options
  const hash = stellarTransactionHash(xdr)
  await connectStellar(wallet, sender)
  const signed = await wallet.signTransaction(xdr, sender)
  // A wallet that changes the fee, sequence, or time bounds signs a payment Routes cannot match.
  if (!signsUnchanged(xdr, signed))
    throw new Error(`${wallet.name} signed a different transaction. Nothing was sent.`)
  options.onHash?.(hash)
  const response = await fetch(`${horizon}/transactions`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ tx: signed }),
  }).catch(() => undefined)
  // Without a verdict (no answer, or a timeout), the payment may still land: wait for it by hash.
  if (response?.status !== 400) return hash
  const codes = (
    (await response.json().catch(() => ({}))) as { extras?: { result_codes?: ResultCodes } }
  ).extras?.result_codes
  if (codes?.transaction === 'tx_failed') throw new StellarFailedError(codes)
  // An earlier submission that already landed is rejected as a reused sequence.
  if ((await lookup(hash)) !== null) return hash
  const code = codes?.transaction ?? 'unknown'
  throw new StellarRejectedError(
    `${rejections[code] ?? `Stellar rejected the payment (${code}).`} Nothing was sent.`,
  )
}

/** Wait for the ledger that includes the payment (~5 s). Throws if it landed but failed. */
export async function waitForStellarTransaction(
  hash: string,
  { attempts = 40, intervalMs = 3_000 } = {},
) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const transaction = await lookup(hash)
    if (transaction) {
      if (transaction.successful === false) throw new StellarFailedError()
      return transaction
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error('The Stellar payment has not landed yet. Check it in a Stellar explorer.')
}

/** Horizon refused the payment before any ledger, so the same envelope may be submitted again. */
export class StellarRejectedError extends Error {}

/** The payment landed in a ledger and failed, using its sequence number. */
export class StellarFailedError extends Error {
  constructor(codes?: ResultCodes) {
    const operation = codes?.operations?.find((code) => code !== 'op_success')
    const detail = operation && (failures[operation] ?? `(${operation})`)
    super(['The Stellar payment failed.', detail, 'Start a new test.'].filter(Boolean).join(' '))
  }
}
