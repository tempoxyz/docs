/** Public `tidx` indexers that the `TidxQuery` widget and its Markdown export query. */
export const tidxNetworks = {
  mainnet: {
    name: 'Mainnet',
    chainId: 4217,
    endpoint: 'https://indexer.tempo.xyz',
  },
  testnet: {
    name: 'Testnet',
    chainId: 42431,
    endpoint: 'https://indexer.testnet.tempo.xyz',
  },
} as const satisfies Record<string, { name: string; chainId: number; endpoint: string }>

export type TidxNetwork = keyof typeof tidxNetworks
