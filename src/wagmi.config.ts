import { QueryClient } from '@tanstack/react-query'
import { funding, viem } from 'accounts/plugins'
import * as test from 'accounts/test'
import { tempoId } from 'accounts/wagmi'
import * as React from 'react'
import {
  base,
  bsc,
  hyperEvm,
  mainnet,
  monad,
  polygon,
  tempo,
  tempoDevnet,
  tempoLocalnet,
  tempoModerato,
} from 'viem/chains'
import { withRelay } from 'viem/tempo'
import {
  type CreateConfigParameters,
  createConfig,
  createStorage,
  fallback,
  http,
  useConnectors,
  webSocket,
} from 'wagmi'
import { demoWalletAuthorization } from './lib/demo-wallet-authorization'
import { passkey } from './lib/passkeyConnector'

const feeToken = '0x20c0000000000000000000000000000000000001' as const

const chain =
  import.meta.env.VITE_TEMPO_ENV === 'localnet'
    ? tempoLocalnet.extend({ feeToken })
    : import.meta.env.VITE_TEMPO_ENV === 'devnet'
      ? tempoDevnet.extend({ feeToken })
      : tempoModerato.extend({ feeToken })

const rpId = (() => {
  const hostname = globalThis.location?.hostname
  if (!hostname) return undefined

  // IP hosts and localhost must use the exact hostname as the RP ID.
  if (hostname === 'localhost' || isIpAddress(hostname)) return hostname

  // Vercel preview hosts live under the public suffix `vercel.app`, so the
  // RP ID must stay scoped to the exact preview hostname.
  if (hostname.endsWith('.vercel.app')) return hostname

  const parts = hostname.split('.')
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname
})()

export const webAuthnRpId = rpId

/** EVM networks Routes transfers start from, so browser wallets can switch to and send on them. */
export const routesSourceChains = [mainnet, base, polygon, bsc, monad, hyperEvm] as const
/** Chains the docs reach through Tempo ID and the Tempo accounts SDK. */
export const tempoChainIds: ReadonlySet<number> = new Set([chain.id, tempo.id])

export function getConfig(options: getConfig.Options = {}) {
  const { multiInjectedProviderDiscovery = false, accessKey = true } = options
  const e2e = import.meta.env.VITE_E2E === 'true'
  const wallet = tempoId({
    // In a browser, the page's origin is the client ID. Prerendering has no page, and never signs in.
    ...(typeof window === 'undefined' ? { clientId: 'https://docs.tempo.xyz' } : {}),
    // An E2E build signs in with `accounts/test`, whose access key can make any call, so a test
    // needs no new access key for each contract. Tempo ID refuses such an access key on a page.
    // The guides request a bounded access key at sign-in. Pages that move real funds request a
    // short-lived access key that only sends mainnet stablecoins, up to 100 of each: its limits
    // scope each token's transfer and transferWithMemo. The Routes tester requests an access key
    // scoped to each batch's contracts before it sends.
    accessKey: e2e
      ? { expiry: '1h', scopes: 'any' }
      : accessKey
        ? demoWalletAuthorization()
        : {
            expiry: '1h',
            limits: (['USDC.e', 'ousd', 'pathUSD', 'usdt0', 'EURC.e'] as const).map((token) => ({
              limit: '100',
              token,
            })),
          },
    plugins: [
      // The public sponsor pays testnet fees. Other chains pay their own.
      viem({ chain: tempoModerato, relay: 'https://sponsor.moderato.tempo.xyz' }),
      funding(),
      // E2E tests can't use Tempo ID's dialog, so `accounts/test` signs in with a local account.
      ...(e2e ? [test.dialog()] : []),
    ],
  })
  return createConfig({
    // Demo balance watchers do not need to poll at the chain's subsecond default.
    pollingInterval: { [tempoModerato.id]: 2_000 },
    batch: {
      multicall: false,
    },
    // Tempo ID's connector starts on the first chain: testnet for the guides, mainnet for pages
    // that move real funds.
    chains: accessKey
      ? [chain, tempo, ...routesSourceChains]
      : [tempo, chain, ...routesSourceChains],
    // The private Zone guides sign Zone transactions with a passkey account's root key, which
    // Tempo's access keys can't do, so they use a passkey connector.
    connectors: [wallet, passkey({ rpId })],
    multiInjectedProviderDiscovery,
    storage: createStorage<Record<string, unknown>>({
      // Pages that move real funds keep wallet connections, and the addresses in them, for the
      // tab only, apart from the guides' saved connections.
      storage:
        typeof window === 'undefined' ? undefined : accessKey ? localStorage : sessionStorage,
      key: accessKey ? 'tempo-docs' : 'tempo-docs-funds',
    }),
    transports: {
      [tempoModerato.id]: withRelay(
        fallback([
          http('https://rpc.moderato.tempo.xyz', { batch: { batchSize: 5 } }),
          webSocket('wss://rpc.moderato.tempo.xyz', {
            keepAlive: { interval: 1_000 },
          }),
        ]),
        http('https://sponsor.moderato.tempo.xyz'),
        { policy: 'sign-only' },
      ),
      [tempoDevnet.id]: withRelay(
        fallback([
          http(tempoDevnet.rpcUrls.default.http[0]),
          webSocket(tempoDevnet.rpcUrls.default.webSocket[0], {
            keepAlive: { interval: 1_000 },
          }),
        ]),
        http('https://sponsor.devnet.tempo.xyz'),
        { policy: 'sign-only' },
      ),
      [tempo.id]: http(tempo.rpcUrls.default.http[0]),
      [mainnet.id]: http(),
      [base.id]: http(),
      [polygon.id]: http(),
      [bsc.id]: http(),
      [monad.id]: http(),
      [hyperEvm.id]: http(),
      [tempoLocalnet.id]: http(undefined, { batch: true }),
    },
  })
}

export namespace getConfig {
  export type Options = Partial<Pick<CreateConfigParameters, 'multiInjectedProviderDiscovery'>> & {
    /**
     * Request the guides' bounded testnet access key when Tempo ID signs in, and save wallet
     * connections across visits. Defaults to true. Pages that move real funds set it to false,
     * which requests a short-lived mainnet access key instead.
     */
    accessKey?: boolean
  }
}

export type Config = ReturnType<typeof getConfig>

export const queryClient = new QueryClient()

/** The connector ID of Tempo ID, from `accounts/wagmi`. */
export const tempoIdConnectorId = 'tempoId'

export function useTempoIdConnector() {
  const connectors = useConnectors()
  return React.useMemo(
    // biome-ignore lint/style/noNonNullAssertion: _
    () => connectors.find((c: { id: string }) => c.id === tempoIdConnectorId)!,
    [connectors],
  )
}

/** The private Zone guides' passkey connector. */
export function useWebAuthnConnector() {
  const connectors = useConnectors()
  return React.useMemo(
    // biome-ignore lint/style/noNonNullAssertion: _
    () => connectors.find((c: { id: string }) => c.id === 'webAuthn')!,
    [connectors],
  )
}

function isIpAddress(hostname: string) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')
}

declare module 'wagmi' {
  interface Register {
    config: Config
  }
}
