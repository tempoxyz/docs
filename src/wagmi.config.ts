import { QueryClient } from '@tanstack/react-query'
import { tempoDevnet, tempoLocalnet, tempoModerato } from 'viem/chains'
import { withFeePayer } from 'viem/tempo'
import { type CreateConfigParameters, createConfig, createStorage, http, webSocket } from 'wagmi'
import { KeyManager, webAuthn } from 'wagmi/tempo'

const feeToken = '0x20c0000000000000000000000000000000000001'

const rpId = (() => {
  const hostname = globalThis.location?.hostname
  if (!hostname) return undefined
  const parts = hostname.split('.')
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname
})()

export function getConfig(options: getConfig.Options = {}) {
  const { multiInjectedProviderDiscovery } = options
  return createConfig({
    batch: {
      multicall: false,
    },
    chains: [
      import.meta.env.VITE_TEMPO_ENV === 'localnet'
        ? tempoLocalnet.extend({ feeToken })
        : import.meta.env.VITE_TEMPO_ENV === 'devnet'
          ? tempoDevnet.extend({ feeToken })
          : tempoModerato.extend({ feeToken }),
    ],
    connectors: [
      webAuthn({
        grantAccessKey: true,
        keyManager: KeyManager.http('https://key-manager.porto.workers.dev'),
        rpId,
      }),
    ],
    multiInjectedProviderDiscovery,
    storage: createStorage({
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      key: 'tempo-docs',
    }),
    transports: {
      [tempoModerato.id]: withFeePayer(
        webSocket('wss://rpc.moderato.tempo.xyz', {
          keepAlive: { interval: 1_000 },
        }),
        http('https://sponsor.moderato.tempo.xyz'),
        { policy: 'sign-only' },
      ),
      [tempoDevnet.id]: withFeePayer(
        webSocket(tempoDevnet.rpcUrls.default.webSocket[0], {
          keepAlive: { interval: 1_000 },
        }),
        http('https://sponsor.devnet.tempo.xyz'),
        { policy: 'sign-only' },
      ),
      [tempoLocalnet.id]: http(undefined, { batch: true }),
    },
  })
}

export namespace getConfig {
  export type Options = Partial<Pick<CreateConfigParameters, 'multiInjectedProviderDiscovery'>>
}

export const config = getConfig()

export const queryClient = new QueryClient()

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
