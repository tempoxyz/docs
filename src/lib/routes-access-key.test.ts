import { Permissions } from 'accounts'
import { describe, expect, it, vi } from 'vitest'
import { routesAccessKey, routesFeeTokens, submitTempoCalls } from './routes-execution'

const token = '0x20C000000000000000000000b9537d11c60E8b50'
const router = '0x00000000000000000000000000000000000000bb'

describe('routesAccessKey', () => {
  it('scopes the token and every contract the batch calls, once', () => {
    const key = routesAccessKey({
      chainId: 4217,
      calls: [{ to: token }, { to: router }, { to: router }],
      token,
      amount: 1_000_000n,
    })
    expect(key.scopes).toEqual([{ address: token.toLowerCase() }, { address: router }])
    // The amount, 1%, and the default 1-unit network-fee budget.
    expect(key.limits).toEqual([{ token, limit: 2_010_001n }])
    expect(Permissions.resolve(key, { chainId: 4217 }).scopes).toHaveLength(2)
  })

  it('adds a fee limit on each other USD stablecoin', () => {
    const feeTokens = routesFeeTokens(4217)
    expect(feeTokens.length).toBeGreaterThan(1)
    const key = routesAccessKey({
      chainId: 4217,
      calls: [{ to: router }],
      token,
      amount: 1n,
      feeTokens,
    })
    const tokens = key.limits.map((l) => l.token.toLowerCase())
    expect(new Set(tokens).size).toBe(tokens.length)
    expect(key.limits.length).toBe(
      feeTokens.filter((t) => t.toLowerCase() !== token.toLowerCase()).length + 1,
    )
    expect(() => Permissions.resolve(key, { chainId: 4217 })).not.toThrow()
  })
})

describe('submitTempoCalls authorize', () => {
  it('authorizes before marking the batch as possibly sent', async () => {
    const order: string[] = []
    const failure = new Error('sign-in failed')
    await expect(
      submitTempoCalls(vi.fn(), {
        chainId: 4217,
        sender: router,
        connected: router,
        calls: [{ to: router, data: '0x', value: '0x0' }],
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        required: { amount: 1n, symbol: 'USDC.e', decimals: 6 },
        readBalance: async () => 10n,
        simulate: async () => order.push('simulate'),
        authorize: async () => {
          order.push('authorize')
          throw failure
        },
        onBroadcast: () => order.push('broadcast'),
        onHash: () => {},
      }),
    ).rejects.toBe(failure)
    expect(order).toEqual(['simulate', 'authorize'])
  })
})
