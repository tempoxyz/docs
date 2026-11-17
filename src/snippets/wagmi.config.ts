// @ts-nocheck
// biome-ignore-all lint: snippet
// biome-ignore-all format: snippet

// [!region setup]
import { tempoId } from 'accounts/wagmi'
import { tempo } from 'viem/chains'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  connectors: [
    // Each sign-in requests an access key that spends up to 100 OUSD for a day.
    tempoId({ accessKey: { expiry: '1d', limits: [{ limit: '100', token: 'ousd' }] } }),
  ],
  chains: [tempo],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(),
  },
})

// [!endregion setup]

// [!region withFeePayer]
import { viem } from 'accounts/plugins'
import { tempoId } from 'accounts/wagmi'
import { tempoModerato } from 'viem/chains'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  connectors: [
    tempoId({
      accessKey: { expiry: '1d', limits: [{ limit: '100', token: 'ousd' }] },
      // Moderato's public sponsor co-signs each transaction as the fee payer.
      plugins: [viem({ relay: 'https://sponsor.moderato.tempo.xyz' })],
    }),
  ],
  chains: [tempoModerato],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempoModerato.id]: http(),
  },
})
// [!endregion withFeePayer]
