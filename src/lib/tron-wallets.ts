import { useEffect, useState } from 'react'
import { bytesToHex, encodeFunctionData, erc20Abi, type Hex, hexToString, sha256 } from 'viem'
import { base58Decode } from './base58'

// Tron browser wallets, with no Tron SDK bundled: wallets announce a TIP-1193 provider through
// TIP-6963 (or inject a namespace), and each provider carries its own tronWeb for signing.

/** The CAIP-2 reference of Tron mainnet: the last 4 bytes of its genesis block ID. */
export const tronMainnet = 'tron:0x2b6653dc'
// TronGrid allows keyless browser reads (CORS `*`) at up to 3 requests per second.
const tronGrid = 'https://api.trongrid.io'
// A cap on the energy the sender burns, not the fee. A USDT approve or transfer costs ~10 TRX.
const feeLimitSun = 100_000_000

type TronTransaction = {
  txID: string
  raw_data: { contract: { parameter: { value: { data?: string } } }[] }
}
type TronWeb = {
  defaultAddress: { base58: string | false }
  transactionBuilder: {
    triggerSmartContract(
      to: string,
      selector: '',
      options: { feeLimit: number; callValue: number; input: string },
      params: [],
      from: string,
    ): Promise<{ result?: { result?: boolean; message?: string }; transaction?: TronTransaction }>
  }
  trx: {
    sign(transaction: TronTransaction): Promise<TronTransaction>
    sendRawTransaction(
      transaction: TronTransaction,
    ): Promise<{ result?: boolean; txid?: string; code?: string; message?: string }>
    getBlockByNumber(n: number): Promise<{ blockID: string }>
  }
}
type TronProvider = {
  request?(args: { method: string; params?: unknown }): Promise<unknown>
  tronWeb?: TronWeb | false
}
export type TronWallet = {
  id: string
  name: string
  provider: TronProvider
  /** TIP-1193 providers take `eth_requestAccounts`; older ones take `tron_requestAccounts`. */
  tip1193: boolean
  tronWeb: () => TronWeb | false | undefined
}
export type TronCall = { to: string; data: string; value: string }

const wallet = (
  id: string,
  name: string,
  provider: TronProvider | undefined,
  tip1193: boolean,
  tronWeb = () => provider?.tronWeb,
): TronWallet[] => (provider ? [{ id, name, provider, tip1193, tronWeb }] : [])

/** Wallets that inject a namespace instead of announcing through TIP-6963. */
function injectedWallets() {
  const w = window as unknown as Record<string, Record<string, TronProvider> | undefined> & {
    tron?: TronProvider & { isTronLink?: boolean }
    tronLink?: TronProvider
    tronWeb?: TronWeb
  }
  return {
    specific: [
      ...wallet('okx', 'OKX Wallet', w.okxwallet?.tronLink, false),
      ...wallet(
        'bitget',
        'Bitget Wallet',
        w.bitkeep?.tronLink,
        false,
        () => w.bitkeep?.tronWeb as TronWeb | undefined,
      ),
      ...wallet('trust', 'Trust Wallet', w.trustwallet?.tronLink, false),
      ...wallet('tokenpocket', 'TokenPocket', w.tokenpocket?.tron, true),
    ],
    generic: [
      ...wallet('tron', w.tron?.isTronLink ? 'TronLink' : 'Tron wallet', w.tron, true),
      ...wallet('tronlink', 'TronLink', w.tronLink, false),
      ...wallet('tronweb', 'Tron wallet', w.tronWeb ? { tronWeb: w.tronWeb } : undefined, false),
    ],
  }
}

/** Every Tron wallet in this browser: TIP-6963 announcements first, then injected namespaces. */
export function useTronWallets(): TronWallet[] {
  const [wallets, setWallets] = useState<TronWallet[]>([])
  useEffect(() => {
    const announced = new Map<string, TronWallet>()
    const emit = () => {
      const names = new Set([...announced.values()].map((w) => w.name))
      const { specific, generic } = injectedWallets()
      const list = [...announced.values(), ...specific.filter((w) => !names.has(w.name))]
      setWallets(list.length > 0 ? list : generic.slice(0, 1))
    }
    const announce = (event: Event) => {
      const { info, provider } = ((event as CustomEvent).detail ?? {}) as {
        info?: { uuid?: string; name?: string }
        provider?: TronProvider
      }
      if (!info?.uuid || typeof provider?.request !== 'function') return
      const tronWeb = () => provider.tronWeb
      const name = info.name || 'Tron wallet'
      announced.set(info.uuid, { id: info.uuid, name, provider, tip1193: true, tronWeb })
      emit()
    }
    window.addEventListener('TIP6963:announceProvider', announce)
    window.dispatchEvent(new Event('TIP6963:requestProvider'))
    emit()
    // Namespace-only wallets can inject after the page's scripts run.
    const late = setTimeout(emit, 1_000)
    return () => {
      clearTimeout(late)
      window.removeEventListener('TIP6963:announceProvider', announce)
    }
  }, [])
  return wallets
}

async function readyTronWeb(wallet: TronWallet) {
  // TronLink's tronWeb stays `false` until the reader approves this site.
  for (let i = 0; i < 40; i++) {
    const tronWeb = wallet.tronWeb()
    if (tronWeb) return tronWeb
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`Approve this site in ${wallet.name}, then try again.`)
}

/** Ask the wallet for access on Tron mainnet, as `sender` when one is required. */
async function connectTron(wallet: TronWallet, sender?: string) {
  let address: string | undefined
  if (wallet.tip1193) {
    // Resolves to ['T…']; rejects with code 4001 when the reader declines.
    const accounts = await wallet.provider.request?.({ method: 'eth_requestAccounts' })
    address = (accounts as string[] | undefined)?.[0]
  } else if (wallet.provider.request) {
    // The older API resolves to { code: 200 | 4000 | 4001 }, or nothing while the wallet is locked.
    const result = (await wallet.provider.request({ method: 'tron_requestAccounts' })) as
      | { code?: number; message?: string }
      | undefined
    if (result?.code !== 200)
      throw new Error(result?.message || `Unlock ${wallet.name}, then try again.`)
  }
  const tronWeb = await readyTronWeb(wallet)
  address ||= tronWeb.defaultAddress.base58 || undefined
  if (!address) throw new Error(`Unlock ${wallet.name}, then try again.`)
  if (sender && address !== sender)
    throw new Error(`Switch ${wallet.name} to the sender, ${sender}.`)
  const { blockID } = await tronWeb.trx.getBlockByNumber(0)
  if (`tron:0x${blockID.slice(-8)}` !== tronMainnet)
    throw new Error(`Switch ${wallet.name} to Tron mainnet.`)
  return { tronWeb, address }
}

/** Connect a Tron wallet only to read its mainnet address. */
export const connectTronAccount = async (wallet: TronWallet) => (await connectTron(wallet)).address

const text = (hex?: string) => (hex ? hexToString(`0x${hex.replace(/^0x/, '')}`) : '')

/**
 * Build, sign in the wallet, and broadcast one Tron call from `sender`, or from the connected
 * account when no sender is required. Returns the transaction ID.
 */
export async function sendTronCall(
  wallet: TronWallet,
  sender: string | undefined,
  call: TronCall,
  onBroadcast?: () => void,
) {
  const { tronWeb, address: from } = await connectTron(wallet, sender)
  const input = call.data.replace(/^0x/, '').toLowerCase()
  // An empty selector with `input` sends the full calldata, selector included (TronWeb 5.3+).
  const built = await tronWeb.transactionBuilder.triggerSmartContract(
    call.to,
    '',
    { feeLimit: feeLimitSun, callValue: Number(BigInt(call.value)), input },
    [],
    from,
  )
  const transaction = built.transaction
  if (!built.result?.result || !transaction)
    throw new Error(`The Tron node rejected this call. ${text(built.result?.message)}`.trim())
  // An older wallet tronWeb drops `input` and builds an empty call: never sign that.
  if (transaction.raw_data.contract[0]?.parameter.value.data?.toLowerCase() !== input)
    throw new Error(`${wallet.name} built a different call. Update the wallet, then try again.`)
  // Built transactions expire after about a minute, so sign right away.
  const signed = await tronWeb.trx.sign(transaction)
  onBroadcast?.()
  const sent = await tronWeb.trx.sendRawTransaction(signed)
  if (!sent.result)
    throw new Error(`The Tron broadcast failed: ${sent.code ?? ''} ${text(sent.message)}`.trim())
  return sent.txid ?? signed.txID
}

type TronTransactionInfo = {
  blockNumber?: number
  result?: 'FAILED'
  resMessage?: string
  receipt?: { result?: string }
}
/**
 * Wait for the block that includes the transaction (~3 s). Tron has no nonce, so each call must
 * land before the next is sent. Throws on REVERT, OUT_OF_ENERGY, and other failures.
 */
export async function waitForTronReceipt(txid: string, { attempts = 40, intervalMs = 3_000 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const info = await fetch(`${tronGrid}/wallet/gettransactioninfobyid`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ value: txid }),
    })
      // TronGrid answers 429 for a few seconds past its rate limit: treat it as not yet.
      .then((response): Promise<TronTransactionInfo> | TronTransactionInfo =>
        response.ok ? response.json() : {},
      )
      .catch((): TronTransactionInfo => ({}))
    if (info.blockNumber) {
      const outcome = info.receipt?.result
      if (info.result === 'FAILED' || (outcome && outcome !== 'SUCCESS'))
        throw new TronRevertedError(outcome ?? 'FAILED', text(info.resMessage))
      return info
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error('The Tron transaction has not landed yet. Check it in a Tron explorer.')
}
export class TronRevertedError extends Error {
  constructor(outcome: string, detail: string) {
    super(
      outcome === 'OUT_OF_ENERGY'
        ? 'The Tron transaction ran out of energy. Add TRX to the sender for fees, then start a new test.'
        : `The Tron transaction failed (${outcome}). ${detail}`.trim(),
    )
  }
}

/** A TRC-20 transfer of `amount` base units, such as funding a deposit address. */
export function trc20Transfer(token: string, to: string, amount: bigint): TronCall {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [tronToEvm(to), amount],
  })
  return { to: token, data, value: '0x0' }
}

const checksum = (payload: Uint8Array) => sha256(sha256(payload, 'bytes'), 'bytes').slice(0, 4)

/** A `T…` address as the 20-byte EVM address Tron contracts use in ABI arguments. */
export function tronToEvm(address: string): Hex {
  let bytes: Uint8Array
  try {
    bytes = base58Decode(address)
  } catch {
    throw new Error(`Invalid Tron address: ${address}`)
  }
  const payload = bytes.slice(0, 21)
  if (
    bytes.length !== 25 ||
    payload[0] !== 0x41 ||
    bytesToHex(bytes.slice(21)) !== bytesToHex(checksum(payload))
  )
    throw new Error(`Invalid Tron address: ${address}`)
  return bytesToHex(payload.slice(1))
}
