// [!region setup]
import { tempo } from 'tempo.ts/chains'
import { webAuthn } from 'tempo.ts/wagmi'
import { createConfig, http } from 'wagmi'

const credentials = `${process.env['TEMPO_USERNAME']}:${process.env['TEMPO_PASSWORD']}`

export const config = createConfig({
  connectors: [webAuthn()],
  chains: [tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(undefined, {
      fetchOptions: {
        headers: {
          Authorization: `Basic ${btoa(credentials)}`,
        },
      },
    }),
  },
})
// [!endregion setup]
