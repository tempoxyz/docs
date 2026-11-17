import { Permissions } from 'accounts'
import { describe, expect, it } from 'vitest'
import { routesAccessKey } from './routes-execution'

describe('routesAccessKey', () => {
  const token = '0x20C000000000000000000000b9537d11c60E8b50'
  const router = '0x00000000000000000000000000000000000000bb'
  it('scopes the token and every contract the batch calls, once', () => {
    const key = routesAccessKey({
      chainId: 4217,
      calls: [{ to: token }, { to: router }, { to: router }],
      token,
      amount: 1_000_000n,
    })
    expect(key.scopes).toEqual([{ address: token.toLowerCase() }, { address: router }])
    expect(key.limits).toEqual([{ token, limit: 1_010_001n }])
    const resolved = Permissions.resolve(key, { chainId: 4217 })
    expect(resolved.scopes).toHaveLength(2)
  })
})
