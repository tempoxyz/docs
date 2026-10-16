/**
 * Devnet reads and local key work for the guide demos (`GuideChain`): inferred addresses,
 * access-key limits, and generated private keys. Import it dynamically, like the devnet
 * adapter, so it stays out of production bundles.
 */
import type { Hex } from 'viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import * as Tempo from 'viem/tempo'
import { devnetRpcUrl, devnetToken, unitsToUsd } from './account-sandbox-devnet'
import type { GuideChain } from './guide-demo-scripts'

type Address = `0x${string}`

export function createGuideChain(options: { rpcUrl?: string } = {}): GuideChain {
  const client = Tempo.createClient({
    chain: Tempo.Chain.devnet,
    feeToken: devnetToken,
    transport: Tempo.http(options.rpcUrl ?? devnetRpcUrl, { retryCount: 0 }),
  })
  const { Account } = Tempo

  return {
    inferAddress(config) {
      return Account.fromConfig({
        address: 'infer',
        owners: config.owners.map(({ owner, weight }) => ({ owner: owner as Address, weight })),
        threshold: config.threshold,
      }).address
    },

    async remaining(account, keyId) {
      const { remaining } = await client.accessKey.getRemainingLimit({
        account: account as Address,
        accessKey: keyId as Address,
        token: devnetToken,
      })
      return unitsToUsd(remaining)
    },

    generatePrivateKey,

    addressOf(privateKey) {
      return privateKeyToAddress(privateKey as Hex)
    },
  }
}
