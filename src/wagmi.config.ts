import { QueryClient } from '@tanstack/react-query'
import { Expiry } from 'accounts'
import { tempoWallet, webAuthn as webAuthnAccounts } from 'accounts/wagmi'
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
} from 'wagmi'
import { KeyManager, webAuthn } from 'wagmi/tempo'
import { alphaUsd, betaUsd, pathUsd, thetaUsd } from './components/guides/tokens'

const feeToken = '0x20c0000000000000000000000000000000000001'

const chain =
  import.meta.env.VITE_TEMPO_ENV === 'localnet'
    ? tempoLocalnet.extend({ feeToken })
    : import.meta.env.VITE_TEMPO_ENV === 'devnet'
      ? tempoDevnet.extend({ feeToken })
      : tempoModerato.extend({ feeToken })

const rpId = (() => {
  const hostname = globalThis.location?.hostname
  if (!hostname) return undefined
  const parts = hostname.split('.')
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname
})()

export function getConfig(options: getConfig.Options = {}) {
  const { multiInjectedProviderDiscovery = false } = options
  return createConfig({
    batch: {
      multicall: false,
    },
    chains: [chain],
    connectors: [
      ...(import.meta.env.VITE_E2E === 'true'
        ? [
            webAuthnAccounts({
              rdns: 'webAuthn',
            }),
          ]
        : [
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
              feePayer: {
                precedence: 'user-first',
                url: 'https://sponsor.moderato.tempo.xyz',
              },
            }),
            webAuthn({
              keyManager: KeyManager.http('https://keys.tempo.xyz'),
              rpId,
            }),
          ]),
    ],
    multiInjectedProviderDiscovery,
    storage: createStorage({
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      key: 'tempo-docs',
    }),
    transports: {
      [tempoModerato.id]: withFeePayer(
        http('https://rpc.moderato.tempo.xyz'),
        http('https://sponsor.moderato.tempo.xyz'),
      ),
      [tempoDevnet.id]: withFeePayer(
        http(tempoDevnet.rpcUrls.default.http[0]),
        http('https://sponsor.devnet.tempo.xyz'),
      ),
      [tempoLocalnet.id]: http(undefined, { batch: true }),
    },
  })
}

export namespace getConfig {
  export type Options = Partial<Pick<CreateConfigParameters, 'multiInjectedProviderDiscovery'>>
}

export type Config = ReturnType<typeof getConfig>

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
    config: Config
  }
}
