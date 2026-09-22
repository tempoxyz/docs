import { createWalletClient, custom, maxUint256, parseUnits } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Actions, Transaction } from 'viem/tempo'
import { describe, expect, it } from 'vitest'

const client = createWalletClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: tempoModerato,
  transport: custom({
    request: async () => {
      throw new Error('These SDK checks must not make network requests')
    },
  }),
})

const call = Actions.token.transfer.call({
  token: '0x20c0000000000000000000000000000000000001',
  to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  amount: parseUnits('50', 6),
})

describe('documented expiring transaction examples', () => {
  it('sets the expiry fields for the live parallel-payments demo', async () => {
    const before = Math.floor(Date.now() / 1000)
    const request = await client.prepareTransactionRequest({
      calls: [call],
      nonceKey: 'expiring',
      parameters: [],
    })
    expect(request.nonceKey).toBe(maxUint256)
    expect(request.nonce).toBe(0)
    expect(request.validBefore).toBeGreaterThan(before)
    expect(request.validBefore).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 300)
  })

  it('preserves distinct T12 nonces through preparation and serialization', async () => {
    const validBefore = Math.floor(Date.now() / 1000) + 60
    const requests = await Promise.all(
      [1, 2].map((nonce) =>
        client.prepareTransactionRequest({
          calls: [call],
          nonceKey: maxUint256,
          nonce,
          validBefore,
          parameters: [],
        }),
      ),
    )
    expect(requests.map((request) => request.nonce)).toEqual([1, 2])
    for (const request of requests) {
      expect(request.nonceKey).toBe(maxUint256)
      expect(request.validBefore).toBe(validBefore)
      expect(request.calls).toEqual([call])
    }

    const serialized = await Promise.all(
      requests.map((request) =>
        Transaction.serialize({
          type: 'tempo',
          chainId: tempoModerato.id,
          calls: request.calls,
          nonceKey: request.nonceKey,
          nonce: request.nonce,
          validBefore: request.validBefore,
          gas: 100_000n,
          maxFeePerGas: 1n,
          maxPriorityFeePerGas: 0n,
        }),
      ),
    )
    expect(serialized[0]).not.toBe(serialized[1])
  })
})
