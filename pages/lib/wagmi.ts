import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

export const tempoTestnet = defineChain({
  id: 111551119090,
  name: 'Tempo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.tempo.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explorer.testnet.tempo.xyz',
    },
  },
})

export const wagmiConfig = createConfig({
  chains: [tempoTestnet],
  transports: {
    [tempoTestnet.id]: http(),
  },
})
