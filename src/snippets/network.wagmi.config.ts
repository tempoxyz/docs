// [!region setup]
import { tempoModerato } from 'viem/chains'
import { alphausd, betausd } from 'viem/tokens'
import { createConfig, http } from 'wagmi'
import { tempoWallet } from 'wagmi/connectors'

export const alphaUsd = alphausd(42431).address
export const betaUsd = betausd(42431).address
const chain = tempoModerato.extend({ feeToken: alphaUsd })
export const config = createConfig({
  chains: [chain],
  connectors: [tempoWallet({ feePayer: 'https://sponsor.moderato.tempo.xyz' })],
  transports: { [chain.id]: http() },
})
// [!endregion setup]
