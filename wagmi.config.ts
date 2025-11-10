import { QueryClient } from '@tanstack/react-query'
import { tempoAndantino, tempoLocal } from 'tempo.ts/chains'
import { webAuthn } from 'tempo.ts/wagmi'
import { createConfig, http, webSocket } from 'wagmi'

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
    [tempoAndantino.id]: webSocket(
      'wss://rpc.testnet.tempo.xyz?supersecretargument=pleasedonotusemeinprod',
    ),
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
