// [!region setup]
import { getAddress } from 'viem'
import { Account, createClient } from 'viem/tempo'

const privateKey = process.env.TEMPO_PRIVATE_KEY
const recipientAddress = process.env.TEMPO_RECIPIENT
if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey))
  throw new Error('Set TEMPO_PRIVATE_KEY to your funded test account private key')
if (!recipientAddress) throw new Error('Set TEMPO_RECIPIENT to an address you control')

export const alphaUsd = '0x20c0000000000000000000000000000000000001'
export const betaUsd = '0x20c0000000000000000000000000000000000002'
export const recipient = getAddress(recipientAddress)
export const client = createClient({
  account: Account.fromSecp256k1(privateKey as `0x${string}`),
  testnet: true,
  feeToken: alphaUsd,
})
// [!endregion setup]
