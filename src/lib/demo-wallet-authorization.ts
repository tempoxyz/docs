import type { Permissions } from 'accounts'
import { parseUnits } from 'viem'
import { Addresses } from 'viem/tempo'
import { alphaUsd, betaUsd, ousd, pathUsd, thetaUsd } from '../components/guides/tokens'

const tokens = [ousd, pathUsd, alphaUsd, betaUsd, thetaUsd] as const

/** The protocol contracts the guides call, besides tokens. */
const contracts = [
  Addresses.stablecoinDex,
  Addresses.feeManager,
  Addresses.tip20Factory,
  Addresses.tip403Registry,
  // The virtual addresses demo registers a virtual master.
  Addresses.addressRegistry,
] as const

/**
 * The access key the guides request at sign-in with Tempo ID. Tempo ID refuses an access key
 * without scopes from the browser, so it names each contract the guides call, with no selector, so
 * any of its functions. A token's scope needs a limit on that token.
 *
 * A token a guide creates has no address until it exists, so the guide signs in again with
 * `createdTokens` to add it.
 */
export function demoWalletAuthorization(createdTokens: readonly `0x${string}`[] = []) {
  const allTokens = unique([...tokens, ...createdTokens])
  return {
    expiry: '1d',
    limits: allTokens.map((token) => ({ token, limit: parseUnits('500', 6) })),
    scopes: unique([...allTokens, ...contracts]).map((address) => ({ address })),
  } as const satisfies Permissions.Permissions
}

function unique(addresses: readonly `0x${string}`[]) {
  return [...new Set(addresses.map((a) => a.toLowerCase() as `0x${string}`))]
}
