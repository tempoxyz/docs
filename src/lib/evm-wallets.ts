import { type Address, encodeFunctionData, erc20Abi, type Hex } from 'viem'
import { getTransactionCount, waitForTransactionReceipt } from 'viem/actions'
import { type Config, type Connector, useConnectors } from 'wagmi'
import {
  connect,
  estimateGas,
  getConnections,
  getConnectorClient,
  sendTransaction,
  switchChain,
} from 'wagmi/actions'
import { assertUnexpired, SourceRevertedError } from './routes-execution'

// Browser EVM wallets through wagmi. The Routes test page sets `mipd: true`, so wagmi creates a
// connector for every wallet that announces itself through EIP-6963.

// The docs' own Tempo SDK announces its providers too. They only sign on Tempo.
const docsConnectors = new Set(['xyz.tempo', 'com.injectedwallet', 'webAuthn'])

/** The browser wallets wagmi found, for the reader to choose from. */
export function useEvmWallets(): readonly Connector[] {
  return useConnectors().filter(
    (connector) => connector.type === 'injected' && !docsConnectors.has(connector.id),
  )
}

/**
 * The wallet failed to send and the sender's nonce did not move, so nothing was broadcast and the
 * same call can be sent again.
 */
export class WalletSendError extends Error {
  constructor(readonly detail: string) {
    super(detail)
  }
}
/** The wallet's own error under wagmi's and viem's wrapping, so its code and message show. */
function walletError(e: unknown) {
  let error = e as Error & { code?: number; cause?: unknown }
  while (error?.cause) error = error.cause as typeof error
  return error
}
const nonceRecheckMs = 2_000

type EvmCall = { to: string; data: string; value: string }

/**
 * Ask a browser wallet which account to share; the address is the same on every network.
 * `wallet_requestPermissions` opens the wallet's account picker even when this site is already
 * connected, so an explicit Connect always asks. Wallets without it fall back to wagmi's connect,
 * which prompts only the first time.
 */
export async function connectEvmAccount(config: Config, connector: Connector) {
  const provider = (await connector.getProvider()) as
    | { request(args: { method: string; params?: unknown[] }): Promise<unknown> }
    | undefined
  await provider
    ?.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
    .catch((e) => {
      const error = walletError(e)
      if (error.code === 4001) throw error
    })
  const connected = getConnections(config).some((c) => c.connector.uid === connector.uid)
  const accounts = connected
    ? await connector.getAccounts()
    : (
        await connect(config, { connector }).catch((e) => {
          throw walletError(e)
        })
      ).accounts
  if (!accounts[0]) throw new Error(`${connector.name} did not share an account.`)
  return accounts[0]
}

/** Connect the wallet, or reuse its connection, and put it on the source network. */
async function connectOn(config: Config, connector: Connector, chainId: number) {
  const existing = getConnections(config).find((c) => c.connector.uid === connector.uid)
  const accounts = existing
    ? existing.accounts
    : (
        await connect(config, { connector, chainId }).catch((e) => {
          throw walletError(e)
        })
      ).accounts
  if ((await connector.getChainId()) !== chainId)
    // wagmi adds the network to the wallet first when the wallet does not know it.
    await switchChain(config, { connector, chainId }).catch(() => {})
  if ((await connector.getChainId()) !== chainId)
    throw new Error('Switch your wallet to the selected source network.')
  return accounts[0]
}

/**
 * Send one call from a browser wallet, from `sender` when one is required, and save the hash
 * before waiting for it. `expiresAt: null` means the call has no expiry, as when funding a
 * deposit address.
 */
export async function sendEvmCall(
  config: Config,
  options: {
    connector: Connector
    chainId: number
    sender?: string
    call: EvmCall
    expiresAt: unknown
    onHash: (hash: string) => void
    onBroadcast?: () => void
  },
) {
  const { connector, chainId, expiresAt } = options
  if (expiresAt !== null) assertUnexpired(expiresAt)
  const account = await connectOn(config, connector, chainId)
  if (!account || (options.sender && account.toLowerCase() !== options.sender.toLowerCase()))
    throw new Error('Connect the sender wallet entered in step 1.')
  const transaction = {
    to: options.call.to as Address,
    data: options.call.data as Hex,
    value: BigInt(options.call.value),
  }
  // Read the nonce through the wallet, which sees its own broadcasts before public nodes do.
  const walletClient = await getConnectorClient(config, { connector, chainId })
  const pendingNonce = async (delayMs = 0) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return getTransactionCount(walletClient, { address: account, blockTag: 'pending' }).then(
      BigInt,
      () => undefined,
    )
  }
  // Our own gas estimate, with headroom, for wallets whose estimation fails on bridge calls.
  const gas = await estimateGas(config, { chainId, account, ...transaction }).then(
    (estimate) => (estimate * 6n) / 5n,
    () => undefined,
  )
  const nonce = await pendingNonce()
  if (expiresAt !== null) assertUnexpired(expiresAt)
  options.onBroadcast?.()
  let hash: string
  try {
    hash = await sendTransaction(config, { connector, chainId, account, ...transaction, gas })
  } catch (e) {
    const error = walletError(e)
    // A rejection, or a nonce that moved, keeps the wallet's own error and its uncertainty.
    // The recheck waits briefly so a transaction the wallet did broadcast has time to appear.
    if (
      error.code === 4001 ||
      nonce === undefined ||
      (await pendingNonce(nonceRecheckMs)) !== nonce
    )
      throw error
    throw new WalletSendError(
      [error.message || 'The wallet returned an error', error.code].filter(Boolean).join(' · '),
    )
  }
  options.onHash(hash)
  return hash
}

/** A token transfer, such as funding a deposit address. */
export const evmTokenTransfer = (token: string, to: string, amount: bigint): EvmCall => ({
  to: token,
  data: encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [to as Address, amount],
  }),
  value: '0x0',
})

/**
 * Wait for the source receipt from the network's own node. A mined revert stops the test rather
 * than sending again.
 */
export async function waitForEvmCall(config: Config, chainId: number, hash: string) {
  const receipt = await waitForTransactionReceipt(config.getClient({ chainId }), {
    hash: hash as Hex,
    pollingInterval: 2_000,
    timeout: 5 * 60_000,
  })
  if (receipt.status !== 'success') throw new SourceRevertedError()
  return receipt
}
