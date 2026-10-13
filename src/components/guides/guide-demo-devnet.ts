/**
 * Devnet reads and local key work for the guide demos (`GuideChain`): the relay's Key Publisher,
 * configuration commitments, balances, access-key limits, and generated private keys. Import it
 * dynamically, like the devnet adapter, so it stays out of production bundles.
 */
import { MultisigConfig, Oidc } from 'ox-zk/tempo'
import type { Hex } from 'viem'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { readContract } from 'viem/actions'
import * as Tempo from 'viem/tempo'
import { type ChainConfig, devnetRpcUrl, devnetToken, unitsToUsd } from './account-sandbox-devnet'
import { checkRelay, issuerFor, type LoginMethod, loginIdentity } from './account-sandbox-oidc'
import type { GuideChain } from './guide-demo-scripts'

type Address = `0x${string}`

/** TIP-1132's Key Publisher precompile. */
const keyPublisher: Address = '0x1132000000000000000000000000000000000000'
/** The configurable-account precompile (`getConfigCommitment`). */
const nativeMultisig: Address = '0xAACC000000000000000000000000000000000000'
/**
 * The local auth app's publisher on devnet 8211 (`PUBLISHER_ID` in its `devnet8211local`
 * environment). It lists Google's keys and the auth app's own issuer key, which signs bridged
 * Privy tokens.
 */
export const relayPublisherId: Hex =
  '0x5171dc207ef7eb6bc0bba25a9791e38c9abe7e8782dbab9ddda0027361beef38'

const keyPublisherAbi = [
  {
    name: 'activeKeys',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { type: 'bytes32', name: 'publisherId' },
      { type: 'bytes32', name: 'issuer' },
    ],
    outputs: [{ type: 'bytes32[]' }],
  },
] as const

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
    async publishedKeys(method: LoginMethod) {
      const issuer = issuerFor(method)
      const keys = await readContract(client, {
        address: keyPublisher,
        abi: keyPublisherAbi,
        functionName: 'activeKeys',
        args: [relayPublisherId, Oidc.hashIssuer(issuer) as Hex],
      })
      return { issuer, publisherId: relayPublisherId, count: keys.length }
    },

    async relay() {
      // Fresh each time, so the step shows what the auth app answers now.
      const status = await checkRelay()
      return status && { chainId: status.chainId, methods: status.methods }
    },

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
      return MultisigConfig.getCommitment(config as never)
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

    identity(result) {
      return loginIdentity({
        method: result.method,
        address: result.owner.address,
        email: result.email,
        privy: result.privy,
      })
    },
  }
}
