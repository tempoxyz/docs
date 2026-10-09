import { Mppx, tempo } from 'mppx/client'
import type { Account } from 'viem'
// [!region wallet-config]
import { tempo as tempoMainnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { getConnectorClient } from 'wagmi/actions'
import { tempoWallet } from 'wagmi/connectors'

export const mppConfig = createConfig({
  chains: [tempoMainnet],
  connectors: [tempoWallet()],
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
