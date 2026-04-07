// @ts-nocheck
// biome-ignore-all lint: snippet
// biome-ignore-all format: snippet

// [!region setup]
import { tempoWallet } from 'accounts/wagmi'
import { tempo } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { KeyManager, webAuthn } from 'wagmi/tempo'

export const config = createConfig({
  connectors: [tempoWallet()],
  chains: [tempo],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(),
  },
})

// [!endregion setup]

// [!region withFeePayer]
import { tempoWallet } from 'accounts/wagmi'
import { tempo } from 'viem/chains'
import { withFeePayer } from 'viem/tempo'
import { createConfig, http } from 'wagmi'
import { KeyManager, webAuthn } from 'wagmi/tempo'

export const config = createConfig({
  connectors: [
    tempoWallet({
      feePayerUrl: 'https://sponsor.moderato.tempo.xyz',
    }),
  ],
  chains: [tempo],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(),
  },
})
// [!endregion withFeePayer]
