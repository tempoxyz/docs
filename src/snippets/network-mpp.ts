// @ts-nocheck
// Type-checked against accounts@alpha, which the site's own demos don't use yet.
import { tempoId } from 'accounts/wagmi'
import { Mppx, tempo } from 'mppx/client'
import type { Account } from 'viem'
// [!region wallet-config]
import { tempo as tempoMainnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { getConnectorClient } from 'wagmi/actions'

export const mppConfig = createConfig({
  chains: [tempoMainnet],
  connectors: [
    // Each sign-in requests an access key that spends up to 10 USDC.e for a day.
    tempoId({ accessKey: { expiry: '1d', limits: [{ limit: '10', token: 'USDC.e' }] } }),
  ],
  transports: { [tempoMainnet.id]: http() },
})
// [!endregion wallet-config]

export async function payWithViem(account: Account, paidUrl: string) {
  // [!region viem]
  const mppx = Mppx.create({
    polyfill: false,
    methods: [tempo({ account })],
  })
  const response = await mppx.fetch(paidUrl)
  console.log(await response.text())
  // [!endregion viem]
}

export async function payWithWagmi(paidUrl: string) {
  // [!region wagmi]
  const paymentMethod = tempo({
    getClient: ({ chainId }) => {
      if (chainId !== undefined && chainId !== tempoMainnet.id)
        throw new Error('This wallet configuration supports Tempo Mainnet only')
      return getConnectorClient(mppConfig, { chainId: tempoMainnet.id })
    },
  })
  const mppx = Mppx.create({ polyfill: false, methods: [paymentMethod] })
  const response = await mppx.fetch(paidUrl)
  console.log(await response.text())
  // [!endregion wagmi]
}
