import { QueryClient } from '@tanstack/react-query'
import { Expiry } from 'accounts'
import * as React from 'react'
import { parseUnits } from 'viem'
import { tempoDevnet, tempoLocalnet, tempoModerato } from 'viem/chains'
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
import { tempoWallet, webAuthn } from 'wagmi/tempo'
import { alphaUsd, betaUsd, pathUsd, thetaUsd } from './components/guides/tokens'
import * as WebAuthnCeremony from './lib/webAuthnCeremony.ts'
import { feeToken, moderatoZones } from './lib/private-zones.ts'

const chain =
  import.meta.env.VITE_TEMPO_ENV === 'localnet'
    ? tempoLocalnet.extend({ feeToken })
    : import.meta.env.VITE_TEMPO_ENV === 'devnet'
      ? tempoDevnet.extend({ feeToken })
      : tempoModerato.extend({ feeToken, zones: moderatoZones })

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

export function getConfig(options: getConfig.Options = {}) {
  const { multiInjectedProviderDiscovery = false } = options
  return createConfig({
    batch: {
      multicall: false,
    },
    chains: [chain],
    connectors: [
      ...(import.meta.env.VITE_E2E === 'true'
        ? [webAuthn()]
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
            webAuthn({ ceremony: WebAuthnCeremony.keys() }),
          ]),
    ],
    multiInjectedProviderDiscovery,
    storage: createStorage({
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      key: 'tempo-docs',
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
      [tempoLocalnet.id]: http(undefined, { batch: true }),
    },
  })
}

export namespace getConfig {
  export type Options = Partial<Pick<CreateConfigParameters, 'multiInjectedProviderDiscovery'>>
}

export type Config = ReturnType<typeof getConfig>

export const config = getConfig()

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
