import { type Address, type Hex, isAddressEqual, parseUnits } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Account, createClient, EarnShares } from 'viem/tempo'

export const earnDemoVault = '0x20147491b5701dea880263241c335caca9be326d'
export const earnDemoAsset = '0x20c0000000000000000000000000000000000000'
export const earnDemoShare = '0x20c0000000000000000000006ac30cbdea0747fa'
export const earnDemoEngine = '0x49c4600ba4f39c11006cb2269c371e8a19f26a26'
export const earnDemoAmount = 1_000_000n
export const earnDemoStorageKey = 'tempo-docs:earn-deposit-demo:v1'

export function parseEarnDemoAmount(value: string) {
  const amount = value.trim()
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(amount)) return undefined
  const parsed = parseUnits(amount, 6)
  return parsed > 0n && parsed < 2n ** 256n ? parsed : undefined
}

export type EarnDemoCredential = {
  credential: { id: string; publicKey: Hex }
  rpId: string
}

export function createEarnDemoClient(session: EarnDemoCredential) {
  return createClient({
    account: Account.fromWebAuthnP256(session.credential, { rpId: session.rpId }),
    chain: tempoModerato,
    feeToken: earnDemoAsset,
  })
}

/** Fail closed if the live directory no longer lists the tested deployment. */
export function verifyEarnDemoDirectory(
  value: unknown,
  operation: 'inspect' | 'deposit' | 'redeem' = 'deposit',
) {
  const data = record(value).data
  if (!Array.isArray(data)) throw new Error('The testnet vault directory is unavailable.')
  const vault = record(data.find((item) => address(record(item).id) === earnDemoVault))
  if (
    vault.verified !== true ||
    address(record(vault.assetToken).address) !== earnDemoAsset ||
    address(record(vault.shareToken).address) !== earnDemoShare ||
    address(record(vault.engine).address) !== earnDemoEngine
  )
    throw new Error('This testnet vault is not currently available for the demo.')
  const availability = {
    deposit:
      record(vault.access).status === 'open' &&
      record(vault.capabilities).deposit === true &&
      record(vault.state).depositsPaused === false,
    redeem: record(vault.capabilities).redeem === true,
  }
  if (operation !== 'inspect' && !availability[operation])
    throw new Error('This testnet vault is not currently available for that operation.')
  return availability
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function address(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : undefined
}

export async function verifyEarnDemoVault(operation: 'inspect' | 'deposit' | 'redeem' = 'deposit') {
  const response = await fetch(
    'https://api.tempo.xyz/v1/earn/vaults/verified?chainId=testnet&include=access,capabilities&limit=50',
    { credentials: 'omit', signal: AbortSignal.timeout(20_000) },
  )
  if (!response.ok) throw new Error('Could not verify the testnet vault. Select Check again.')
  const availability = verifyEarnDemoDirectory(await response.json(), operation)
  const client = createClient({ chain: tempoModerato })
  verifyEarnDemoNetwork(await client.getChainId())
  const state = await client.earn.getVault({ vault: earnDemoVault })
  if (
    !isAddressEqual(state.assetToken, earnDemoAsset) ||
    !isAddressEqual(state.shareToken, earnDemoShare) ||
    !isAddressEqual(state.engine.address, earnDemoEngine) ||
    !state.isSynced
  )
    throw new Error('The deployed vault configuration changed. The demo is disabled.')
  availability.deposit &&= !state.depositsPaused
  if (operation === 'deposit' && !availability.deposit)
    throw new Error('Deposits are currently paused for this vault.')
  return availability
}

export function verifyEarnDemoNetwork(chainId: number) {
  if (chainId !== tempoModerato.id) throw new Error('This demo only supports Moderato testnet.')
}

export function minimumEarnDemoShares(quotedShares: bigint) {
  if (quotedShares <= 0n) throw new Error('The deposit quote must return shares.')
  const minimum = EarnShares.minimumOutput(quotedShares, 50)
  if (minimum <= 0n) throw new Error('The deposit quote is too small.')
  return minimum
}

export function verifyEarnDemoDeposit(
  result: {
    recipient: Address
    assetAmount: bigint
    shareAmount: bigint
    receipt: { status: string }
  },
  account: Address,
  minimum: bigint,
  assetAmount = earnDemoAmount,
) {
  if (
    result.receipt.status !== 'success' ||
    !isAddressEqual(result.recipient, account) ||
    result.assetAmount !== assetAmount ||
    result.shareAmount < minimum
  )
    throw new Error('The receipt did not confirm the expected deposit. Check the transaction.')
}
