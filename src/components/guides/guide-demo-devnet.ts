/**
 * Devnet reads and local key work for the guide demos (`GuideChain`): configuration commitments,
 * balances, access-key limits, and generated private keys. Import it dynamically, like the devnet
 * adapter, so it stays out of production bundles.
 */
import type { Hex } from 'viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { readContract } from 'viem/actions'
import * as Tempo from 'viem/tempo'
import { type ChainConfig, devnetRpcUrl, devnetToken, unitsToUsd } from './account-sandbox-devnet'
import type { GuideChain } from './guide-demo-scripts'

type Address = `0x${string}`

/** The configurable-account precompile (`getConfigCommitment`). */
const nativeMultisig: Address = '0xAACC000000000000000000000000000000000000'

const multisigAbi = [
  {
    name: 'getConfigCommitment',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'bytes32' }],
  },
] as const

const zeroHash = `0x${'0'.repeat(64)}`

export function createGuideChain(options: { rpcUrl?: string } = {}): GuideChain {
  const client = Tempo.createClient({
    chain: Tempo.Chain.devnet,
    feeToken: devnetToken,
    transport: Tempo.http(options.rpcUrl ?? devnetRpcUrl, { retryCount: 0 }),
  })
  const { Account } = Tempo

  return {
    async commitment(address) {
      const commitment = await readContract(client, {
        address: nativeMultisig,
        abi: multisigAbi,
        functionName: 'getConfigCommitment',
        args: [address as Address],
      })
      return commitment === zeroHash ? null : commitment
    },

    configCommitment(config: ChainConfig) {
      return Tempo.AccountConfig.getCommitment(config)
    },

    inferAddress(config) {
      return Account.fromConfig({
        address: 'infer',
        owners: config.owners.map(({ owner, weight }) => ({ owner: owner as Address, weight })),
        threshold: config.threshold,
      }).address
    },

    async balance(address) {
      const { amount } = await client.token.getBalance({
        account: address as Address,
        token: devnetToken,
        decimals: 6,
      })
      return unitsToUsd(amount)
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
