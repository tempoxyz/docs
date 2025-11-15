// [!region setup]
import { tempo } from 'tempo.ts/chains'
import { webAuthn } from 'tempo.ts/wagmi'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  connectors: [webAuthn()],
  chains: [tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(),
  },
})
// [!endregion setup]
