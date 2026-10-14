import type { Address } from 'viem'

/**
 * Where the Accounts demos reach the multisig-1113 devnet. Kept apart from
 * `account-sandbox-devnet.ts` so small demos can import these values without bundling the adapter.
 */

/** The demo devnet's Tailscale RPC, for Node scripts on the tailnet. */
export const devnetTailnetRpcUrl = 'http://multisig-1113-nodes-rpc-service.tail388b2e.ts.net:8545'

/**
 * Pages reach the devnet through the docs site's same-origin proxy (`/api/devnet-rpc`), which holds
 * the public endpoint's API key and works from HTTPS pages. Outside a browser, use the tailnet RPC.
 */
export const devnetRpcUrl =
  typeof window === 'undefined' ? devnetTailnetRpcUrl : `${window.location.origin}/api/devnet-rpc`
export const devnetChainId = 31_318
/** AlphaUSD pays for every payment and every fee. */
export const devnetToken: Address = '0x20c0000000000000000000000000000000000001'
