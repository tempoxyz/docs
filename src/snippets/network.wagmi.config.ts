// [!region setup]
import { tempoModerato } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { tempoWallet } from 'wagmi/connectors'

export const alphaUsd = '0x20c0000000000000000000000000000000000001'
export const betaUsd = '0x20c0000000000000000000000000000000000002'
const chain = tempoModerato.extend({ feeToken: alphaUsd })
export const config = createConfig({
  chains: [chain],
  connectors: [tempoWallet({ feePayer: 'https://sponsor.moderato.tempo.xyz' })],
  transports: { [chain.id]: http() },
})
// [!endregion setup]
