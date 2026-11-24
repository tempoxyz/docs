import type { Address } from 'viem'

/**
 * Where the Accounts demos reach Tempo testnet, where T14 runs configurable accounts. Kept apart
 * from `account-sandbox-testnet.ts` so small demos can import these values without bundling the
 * adapter.
 */

/** Testnet's public RPC. It needs no key and allows calls from any origin. */
export const testnetRpcUrl = 'https://rpc.moderato.tempo.xyz'
export const testnetChainId = 42_431
/** Testnet's block explorer. */
export const testnetExplorerUrl = 'https://explore.testnet.tempo.xyz'
/** AlphaUSD pays for every payment and every fee. */
export const testnetToken: Address = '0x20c0000000000000000000000000000000000001'
