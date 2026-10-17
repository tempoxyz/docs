// [!region setup]
import { tempoModerato } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { tempoWallet } from 'wagmi/connectors'

export const config = createConfig({
  connectors: [tempoWallet()],
  chains: [tempoModerato],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempoModerato.id]: http(),
  },
})
// [!endregion setup]
