import { ProviderRequest } from 'accounts'
import { describe, expect, it } from 'vitest'
import { demoWalletAuthorization } from './demo-wallet-authorization'

describe('demo wallet authorization', () => {
  it('passes the wallet request validator with bounded scopes and spending limits', () => {
    const authorization = demoWalletAuthorization()
    const request = JSON.parse(
      JSON.stringify(
        {
          method: 'wallet_connect',
          params: [{ capabilities: { authorizeAccessKey: authorization } }],
        },
        (_, value) => (typeof value === 'bigint' ? `0x${value.toString(16)}` : value),
      ),
    )
    expect(() => ProviderRequest.parse(request)).not.toThrow()
    expect(authorization.limits).toHaveLength(5)
    expect(authorization.limits.every(({ limit }) => limit === 500_000_000n)).toBe(true)
    expect(authorization.scopes.length).toBeGreaterThan(0)
    expect(authorization.expiry).toBeGreaterThan(Math.floor(Date.now() / 1000))
    expect(authorization.expiry).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 86400)
  })

  it('reproduces the reported failure when scopes are omitted', () => {
    const request = {
      method: 'wallet_connect',
      params: [
        {
          capabilities: {
            authorizeAccessKey: {
              expiry: 100,
              limits: [{ token: '0x20c0000000000000000000000000000000000001', limit: '0x1' }],
            },
          },
        },
      ],
    }
    expect(() => ProviderRequest.parse(request)).toThrow('scopes: Expected array')
  })
})
