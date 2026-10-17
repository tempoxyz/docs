import { useEffect, useState } from 'react'
import { concat, numberToBytes, sha256, stringToBytes } from 'viem'
import { base58Decode, base58Encode } from './base58'

// Solana browser wallets with no Solana SDK bundled. Phantom, Solflare, Backpack, and other
// wallets register through the Wallet Standard's window events; the demo builds the SPL token
// transfer itself and asks the wallet to sign and send it. Routes funds Solana sources through
// deposit addresses only, so a token transfer is all the demo sends.

/** Routes names Solana mainnet by CAIP-2 ID; wallets name it `solana:mainnet`. */
export const solanaMainnet = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
const chain = 'solana:mainnet'
// api.mainnet-beta.solana.com refuses requests from browsers; this public node allows them.
const rpcUrl = 'https://solana-rpc.publicnode.com'
const tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const associatedTokenProgram = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
const systemProgram = '11111111111111111111111111111111'

type WalletAccount = { address: string; chains: readonly string[]; features: readonly string[] }
/** The parts of a Wallet Standard wallet the demo uses. */
export type SolanaWallet = {
  name: string
  chains: readonly string[]
  features: Readonly<Record<string, unknown>>
}
type ConnectFeature = { connect(): Promise<{ accounts: readonly WalletAccount[] }> }
type SignAndSendFeature = {
  signAndSendTransaction(
    ...inputs: { account: WalletAccount; chain: string; transaction: Uint8Array }[]
  ): Promise<readonly { signature: Uint8Array }[]>
}
const connectFeature = 'standard:connect'
const sendFeature = 'solana:signAndSendTransaction'
const canSend = (wallet: SolanaWallet) =>
  wallet.chains.includes(chain) &&
  connectFeature in wallet.features &&
  sendFeature in wallet.features

// The Wallet Standard's app side: wallets that load first wait for `app-ready`; wallets that
// load later dispatch `register-wallet` with a callback that receives the same API.
const registered = new Set<SolanaWallet>()
const listeners = new Set<() => void>()
let listening = false
function listen() {
  if (listening) return
  listening = true
  const notify = () => {
    for (const listener of listeners) listener()
  }
  const api = {
    register(...wallets: SolanaWallet[]) {
      for (const wallet of wallets) registered.add(wallet)
      notify()
      return () => {
        for (const wallet of wallets) registered.delete(wallet)
        notify()
      }
    },
  }
  window.addEventListener('wallet-standard:register-wallet', (event) => {
    try {
      ;(event as CustomEvent<(app: typeof api) => void>).detail(api)
    } catch {
      // A wallet that fails to register is skipped.
    }
  })
  window.dispatchEvent(new CustomEvent('wallet-standard:app-ready', { detail: api }))
}

/** Every Solana wallet in this browser that can sign and send on mainnet. */
export function useSolanaWallets(): SolanaWallet[] {
  const [wallets, setWallets] = useState<SolanaWallet[]>([])
  useEffect(() => {
    const update = () => setWallets([...registered].filter(canSend))
    listeners.add(update)
    listen()
    update()
    return () => {
      listeners.delete(update)
    }
  }, [])
  return wallets
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const body = (await response.json().catch(() => ({}))) as {
    result?: T
    error?: { message?: string }
  }
  if (!response.ok || body.error || !('result' in body))
    throw new Error(`The Solana node could not answer ${method}. Try again.`)
  return body.result as T
}

// A program address must not be an ed25519 public key, so derivation skips points on the curve.
const P = 2n ** 255n - 19n
const mod = (a: bigint) => ((a % P) + P) % P
function power(base: bigint, exponent: bigint) {
  let result = 1n
  for (let b = mod(base), e = exponent; e > 0n; e >>= 1n, b = (b * b) % P)
    if (e & 1n) result = (result * b) % P
  return result
}
const D = mod(-121665n * power(121666n, P - 2n))
function onCurve(bytes: Uint8Array) {
  let y = 0n
  for (let i = 31; i >= 0; i--) y = (y << 8n) | BigInt(i === 31 ? bytes[i] & 0x7f : bytes[i])
  const y2 = mod(y * y)
  // x² = (y² − 1) / (d·y² + 1) must have a square root; x = 0 cannot carry the sign bit.
  const x2 = mod((y2 - 1n) * power(D * y2 + 1n, P - 2n))
  if (x2 === 0n) return (bytes[31] & 0x80) === 0
  return power(x2, (P - 1n) / 2n) === 1n
}
function programAddress(seeds: Uint8Array[], program: string) {
  for (let bump = 255; bump >= 0; bump--) {
    const hash = sha256(
      concat([
        ...seeds,
        Uint8Array.of(bump),
        base58Decode(program),
        stringToBytes('ProgramDerivedAddress'),
      ]),
      'bytes',
    )
    if (!onCurve(hash)) return base58Encode(hash)
  }
  throw new Error('No program address exists for these seeds.')
}
/** The associated token account an owner holds a mint in. */
export const tokenAccount = (owner: string, mint: string) =>
  programAddress(
    [base58Decode(owner), base58Decode(tokenProgram), base58Decode(mint)],
    associatedTokenProgram,
  )

type Instruction = {
  program: string
  accounts: { address: string; writable: boolean; signer?: boolean }[]
  data: Uint8Array
}
const shortVec = (n: number) => {
  const bytes: number[] = []
  for (let rest = n; ; rest >>= 7) {
    if (rest < 0x80) return [...bytes, rest]
    bytes.push((rest & 0x7f) | 0x80)
  }
}
/** A legacy transaction with one signer, the fee payer, and an empty signature slot. */
export function legacyTransaction(payer: string, blockhash: string, instructions: Instruction[]) {
  const roles = new Map<string, { signer: boolean; writable: boolean }>([
    [payer, { signer: true, writable: true }],
  ])
  const add = (address: string, signer: boolean, writable: boolean) => {
    const role = roles.get(address) ?? { signer: false, writable: false }
    roles.set(address, { signer: role.signer || signer, writable: role.writable || writable })
  }
  for (const instruction of instructions) {
    for (const account of instruction.accounts)
      add(account.address, !!account.signer, account.writable)
    add(instruction.program, false, false)
  }
  // Signers first, then within each group writable before read-only; the payer leads.
  const rank = ([address, { signer, writable }]: [
    string,
    { signer: boolean; writable: boolean },
  ]) => (address === payer ? -1 : (signer ? 0 : 2) + (writable ? 0 : 1))
  const entries = [...roles.entries()].sort((a, b) => rank(a) - rank(b))
  const keys = entries.map(([address]) => address)
  const count = (signer: boolean, writable: boolean) =>
    entries.filter(([, role]) => role.signer === signer && role.writable === writable).length
  const message = concat([
    Uint8Array.of(count(true, true) + count(true, false), count(true, false), count(false, false)),
    Uint8Array.from(shortVec(keys.length)),
    ...keys.map(base58Decode),
    base58Decode(blockhash),
    Uint8Array.from(shortVec(instructions.length)),
    ...instructions.flatMap((instruction) => [
      Uint8Array.of(keys.indexOf(instruction.program)),
      Uint8Array.from(shortVec(instruction.accounts.length)),
      Uint8Array.from(instruction.accounts.map((a) => keys.indexOf(a.address))),
      Uint8Array.from(shortVec(instruction.data.length)),
      instruction.data,
    ]),
  ])
  return concat([Uint8Array.of(1), new Uint8Array(64), message])
}

/** Ask the wallet for access and return its mainnet account. */
async function connectSolana(wallet: SolanaWallet) {
  const { accounts } = await (wallet.features[connectFeature] as ConnectFeature).connect()
  const account = accounts.find((a) => a.chains.includes(chain) && a.features.includes(sendFeature))
  if (!account) throw new Error(`${wallet.name} did not share a Solana mainnet account.`)
  return account
}

/** Connect a Solana wallet only to read its mainnet address. */
export const connectSolanaAccount = async (wallet: SolanaWallet) =>
  (await connectSolana(wallet)).address

type AccountInfo = { value: { owner: string; space: number } | null }

/**
 * Send `amount` base units of an SPL token to `to`, such as funding a deposit address. Creates
 * the recipient's token account first when it has none, which the sender pays rent for.
 */
export async function sendSplToken(options: {
  wallet: SolanaWallet
  mint: string
  decimals: number
  to: string
  amount: bigint
  onBroadcast?: () => void
}) {
  const { wallet, mint, decimals, to, amount } = options
  const account = await connectSolana(wallet)
  const [mintInfo, toInfo, latest] = await Promise.all([
    rpc<AccountInfo>('getAccountInfo', [mint, { encoding: 'base64', commitment: 'confirmed' }]),
    rpc<AccountInfo>('getAccountInfo', [to, { encoding: 'base64', commitment: 'confirmed' }]),
    rpc<{ value: { blockhash: string; lastValidBlockHeight: number } }>('getLatestBlockhash', [
      { commitment: 'confirmed' },
    ]),
  ])
  if (mintInfo.value?.owner !== tokenProgram)
    throw new Error('This token is not an SPL Token mint this demo can send.')
  // A token account is paid directly; an owner address is paid through its token account.
  const toIsTokenAccount = toInfo.value?.owner === tokenProgram && toInfo.value.space === 165
  const source = tokenAccount(account.address, mint)
  const destination = toIsTokenAccount ? to : tokenAccount(to, mint)
  const createDestination: Instruction = {
    // CreateIdempotent does nothing when the token account already exists.
    program: associatedTokenProgram,
    accounts: [
      { address: account.address, writable: true, signer: true },
      { address: destination, writable: true },
      { address: to, writable: false },
      { address: mint, writable: false },
      { address: systemProgram, writable: false },
      { address: tokenProgram, writable: false },
    ],
    data: Uint8Array.of(1),
  }
  const transfer: Instruction = {
    program: tokenProgram,
    accounts: [
      { address: source, writable: true },
      { address: mint, writable: false },
      { address: destination, writable: true },
      { address: account.address, writable: false, signer: true },
    ],
    // TransferChecked: instruction 12, the amount as a little-endian u64, then the decimals.
    data: concat([
      Uint8Array.of(12),
      numberToBytes(amount, { size: 8 }).reverse(),
      Uint8Array.of(decimals),
    ]),
  }
  const transaction = legacyTransaction(
    account.address,
    latest.value.blockhash,
    toIsTokenAccount ? [transfer] : [createDestination, transfer],
  )
  options.onBroadcast?.()
  const [output] = await (
    wallet.features[sendFeature] as SignAndSendFeature
  ).signAndSendTransaction({ account, chain, transaction })
  if (!output) throw new Error(`${wallet.name} returned no signature. Check its history.`)
  return {
    signature: base58Encode(output.signature),
    lastValidBlockHeight: BigInt(latest.value.lastValidBlockHeight),
  }
}

/** Wait until the transaction is confirmed. Throws if it failed onchain or its blockhash expired. */
export async function waitForSolanaSignature(
  signature: string,
  lastValidBlockHeight: bigint,
  { intervalMs = 1_500, attempts = 80 } = {},
) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const {
      value: [status],
    } = await rpc<{ value: ({ err: unknown; confirmationStatus?: string } | null)[] }>(
      'getSignatureStatuses',
      [[signature]],
    )
    if (status?.err) throw new Error(`The Solana transaction failed: ${JSON.stringify(status.err)}`)
    if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized')
      return
    if (
      !status &&
      BigInt(await rpc<number>('getBlockHeight', [{ commitment: 'confirmed' }])) >
        lastValidBlockHeight
    )
      throw new Error('The Solana transaction expired before it landed. Send it again.')
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error('The Solana transaction has not confirmed yet. Check it in a Solana explorer.')
}
