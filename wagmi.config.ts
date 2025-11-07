import { QueryClient } from '@tanstack/react-query'
import { tempoAndantino, tempoLocal } from 'tempo.ts/chains'
import { webAuthn } from 'tempo.ts/wagmi'
import { createConfig, http } from 'wagmi'

const feeToken = '0x20c0000000000000000000000000000000000001'

export const config = createConfig({
  batch: {
    multicall: false,
  },
  chains: [
    import.meta.env.VITE_LOCAL !== 'true'
      ? tempoAndantino({ feeToken })
      : tempoLocal({ feeToken }),
  ],
  connectors: [webAuthn()],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempoAndantino.id]: http(undefined, {
      batch: true,
      fetchOptions: {
        headers: {
          Authorization: `Basic ${btoa(import.meta.env.VITE_RPC_CREDENTIALS)}`,
        },
      },
    }),
    [tempoLocal.id]: http(undefined, {
      batch: true,
    }),
  },
})

export const queryClient = new QueryClient()

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
