import { type Address, getAddress, isAddress, isAddressEqual } from 'viem'
import { tempo, tempoDevnet, tempoLocalnet, tempoModerato } from 'viem/chains'
import { alphaUsd, betaUsd, ousd, pathUsd, thetaUsd, usdce } from '../../tokens'

/** The Tempo network a fee token choice belongs to. */
export type FeeTokenNetwork = 'mainnet' | 'testnet'

export type FeeTokenChoice = {
  address: Address
  label: string
  recommended?: boolean
}

const testnetChainIds: ReadonlySet<number> = new Set([
  tempoModerato.id,
  tempoDevnet.id,
  tempoLocalnet.id,
])

/** Stablecoins the widget offers on each network, recommended first. */
export const FEE_TOKEN_CHOICES = {
  // OUSD is the recommended stablecoin on mainnet. USDC.e is what bridged USDC arrives as.
  mainnet: [
    { address: ousd, label: 'OUSD', recommended: true },
    { address: usdce, label: 'USDC.e' },
    { address: pathUsd, label: 'pathUSD' },
  ],
  // The faucet funds AlphaUSD first, so it stays the testnet default.
  testnet: [
    { address: alphaUsd, label: 'AlphaUSD' },
    { address: betaUsd, label: 'BetaUSD' },
    { address: thetaUsd, label: 'ThetaUSD' },
    { address: ousd, label: 'OUSD' },
    { address: pathUsd, label: 'pathUSD' },
  ],
} as const satisfies Record<FeeTokenNetwork, readonly FeeTokenChoice[]>

/** What an account without a default fee token pays in, from T13 on mainnet and testnet. */
export const FEE_TOKEN_FALLBACK_NOTE = 'Not set: fees fall back to pathUSD, then OUSD'

/** The chain each network's demos use. */
export const NETWORK_CHAIN_IDS = {
  mainnet: tempo.id,
  testnet: tempoModerato.id,
} as const satisfies Record<FeeTokenNetwork, number>

export const NETWORK_NAMES = {
  mainnet: 'Tempo Mainnet',
  testnet: 'Tempo Testnet',
} as const satisfies Record<FeeTokenNetwork, string>

/** The network of a Tempo chain ID, or `undefined` for any other chain. */
export function feeTokenNetwork(chainId: number | undefined): FeeTokenNetwork | undefined {
  if (chainId === undefined) return undefined
  if (chainId === tempo.id) return 'mainnet'
  if (testnetChainIds.has(chainId)) return 'testnet'
  return undefined
}

export function feeTokenChoices(network: FeeTokenNetwork): readonly FeeTokenChoice[] {
  return FEE_TOKEN_CHOICES[network]
}

/** The listed choice for an address on a network, if any. */
export function findFeeTokenChoice(
  network: FeeTokenNetwork,
  address: string | null | undefined,
): FeeTokenChoice | undefined {
  if (!address || !isAddress(address, { strict: false })) return undefined
  return feeTokenChoices(network).find((choice) => isAddressEqual(choice.address, address))
}

/** The token's name when the network lists it, otherwise its shortened address. */
export function feeTokenLabel(network: FeeTokenNetwork, address: string): string {
  const choice = findFeeTokenChoice(network, address)
  if (choice) return choice.label
  return address.length > 10 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}

/** A link's name for a listed stablecoin, such as \`usdce\` for USDC.e. */
export function feeTokenSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** The network a link's \`network\` parameter names, by name or chain ID. */
export function parseFeeTokenNetwork(
  value: string | null | undefined,
): FeeTokenNetwork | undefined {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return undefined
  if (normalized === 'mainnet') return 'mainnet'
  if (normalized === 'testnet' || normalized === 'moderato') return 'testnet'
  if (/^\d+$/.test(normalized)) return feeTokenNetwork(Number(normalized))
  return undefined
}

/**
 * The token a link's \`token\` parameter names: a listed stablecoin by symbol, such as \`usdce\` or
 * \`USDC.e\`, or any address in any letter case.
 */
export function resolveFeeTokenPreset(
  network: FeeTokenNetwork,
  value: string | null | undefined,
): Address | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  if (isAddress(trimmed, { strict: false })) return getAddress(trimmed.toLowerCase())
  const slug = feeTokenSlug(trimmed)
  return feeTokenChoices(network).find((choice) => feeTokenSlug(choice.label) === slug)?.address
}

/** The \`token\` parameter for an address: its symbol when the network lists it, else the address. */
export function feeTokenParam(network: FeeTokenNetwork, address: Address): string {
  const choice = findFeeTokenChoice(network, address)
  return choice ? feeTokenSlug(choice.label) : address
}
