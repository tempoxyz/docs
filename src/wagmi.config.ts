import { QueryClient } from '@tanstack/react-query'
import { tempoWallet, webAuthn } from '@wagmi/core/tempo'
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
import * as WebAuthnCeremony from './lib/webAuthnCeremony.ts'

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
/** Chains the docs reach through Tempo Wallet and the Tempo accounts SDK. */
export const tempoChainIds: ReadonlySet<number> = new Set([chain.id, tempo.id])

export function getConfig(options: getConfig.Options = {}) {
  const { multiInjectedProviderDiscovery = false, accessKey = true } = options
  const wallet = tempoWallet({
    // The guides authorize a bounded access key on connect. Without one, connecting only signs in
    // with a passkey and shares the address, and each transaction is approved in Tempo Wallet.
    ...(accessKey ? { accessKey: { authorize: demoWalletAuthorization } } : {}),
    feePayer: {
      precedence: 'user-first',
      url: 'https://sponsor.moderato.tempo.xyz',
    },
  })
  return createConfig({
    batch: {
      multicall: false,
    },
    chains: [chain, tempo, ...routesSourceChains],
    connectors:
      import.meta.env.VITE_E2E === 'true'
        ? [webAuthn(), wallet]
        : [wallet, webAuthn({ ceremony: WebAuthnCeremony.keys({ rpId }) })],
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
          http('https://rpc.moderato.tempo.xyz'),
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
     * Authorize the guides' bounded access key when Tempo Wallet connects, and save wallet
     * connections across visits. Defaults to true; pages that move real funds set it to false.
     */
    accessKey?: boolean
  }
}

export type Config = ReturnType<typeof getConfig>

export const queryClient = new QueryClient()

export function useTempoWalletConnector() {
  const connectors = useConnectors()
  return React.useMemo(
    // biome-ignore lint/style/noNonNullAssertion: _
    () => connectors.find((c: { id: string }) => c.id === 'xyz.tempo')!,
    [connectors],
  )
}

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
