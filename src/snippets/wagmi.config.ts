// @ts-nocheck
// biome-ignore-all lint: snippet
// biome-ignore-all format: snippet

import { KeyManager, webAuthn } from 'tempo.ts/wagmi'
// [!region setup]
import { tempo } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { KeyManager, webAuthn } from 'wagmi/tempo'

export const config = createConfig({
  connectors: [
    webAuthn({
      keyManager: KeyManager.http('https://keys.tempo.xyz'),
    }),
  ],
  chains: [tempo],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(),
  },
})

// [!endregion setup]

import { KeyManager, webAuthn } from 'tempo.ts/wagmi'
// [!region withFeePayer]
import { tempo } from 'viem/chains'
import { withFeePayer } from 'viem/tempo'
import { createConfig, http } from 'wagmi'
import { KeyManager, webAuthn } from 'wagmi/tempo'

export const config = createConfig({
  connectors: [
    webAuthn({
      keyManager: KeyManager.http('https://keys.tempo.xyz'),
    }),
  ],
  chains: [tempo],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: withFeePayer(http(), http('https://sponsor.tempo.xyz')),
  },
})
// [!endregion withFeePayer]
