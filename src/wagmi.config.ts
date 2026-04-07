import { QueryClient } from '@tanstack/react-query'
import { Expiry } from 'accounts'
import { tempoWallet, webAuthn } from 'accounts/wagmi'
import * as React from 'react'
import { parseUnits } from 'viem'
import { tempoDevnet, tempoLocalnet, tempoModerato } from 'viem/chains'
import { withFeePayer } from 'viem/tempo'
import {
  type CreateConfigParameters,
  createConfig,
  createStorage,
  http,
  useConnectors,
  webSocket,
} from 'wagmi'
import { alphaUsd, betaUsd, pathUsd, thetaUsd } from './components/guides/tokens'

const feeToken = '0x20c0000000000000000000000000000000000001'

const chain =
  import.meta.env.VITE_TEMPO_ENV === 'localnet'
    ? tempoLocalnet.extend({ feeToken })
    : import.meta.env.VITE_TEMPO_ENV === 'devnet'
      ? tempoDevnet.extend({ feeToken })
      : tempoModerato.extend({ feeToken })

export function getConfig(options: getConfig.Options = {}) {
  const { multiInjectedProviderDiscovery = false } = options
  return createConfig({
    batch: {
      multicall: false,
    },
    chains: [chain],
    connectors: [
      tempoWallet({
        authorizeAccessKey: () => ({
          expiry: Expiry.days(1),
          limits: [
            { token: pathUsd, limit: parseUnits('500', 6) },
            { token: alphaUsd, limit: parseUnits('500', 6) },
            { token: betaUsd, limit: parseUnits('500', 6) },
            { token: thetaUsd, limit: parseUnits('500', 6) },
          ],
        }),
        feePayerUrl: 'https://sponsor.moderato.tempo.xyz',
      }),
      webAuthn({
        authUrl: 'https://keys.tempo.xyz',
        rdns: 'webAuthn',
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

export function useTempoWalletConnector() {
  const connectors = useConnectors()
  return React.useMemo(
    // biome-ignore lint/style/noNonNullAssertion: _
    () => connectors.find((connector) => connector.id === 'xyz.tempo')!,
    [connectors],
  )
}

export function useWebAuthnConnector() {
  const connectors = useConnectors()
  return React.useMemo(
    // biome-ignore lint/style/noNonNullAssertion: _
    () => connectors.find((connector) => connector.id === 'webAuthn')!,
    [connectors],
  )
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
