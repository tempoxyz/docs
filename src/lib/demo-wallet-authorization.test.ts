import { Permissions } from 'accounts'
import { tempoModerato } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { demoWalletAuthorization } from './demo-wallet-authorization'

describe('demo wallet authorization', () => {
  it('resolves to bounded scopes and spending limits', () => {
    const resolved = Permissions.resolve(demoWalletAuthorization(), { chainId: tempoModerato.id })
    expect(resolved.limits).toHaveLength(5)
    expect(resolved.limits?.every(({ limit }) => limit === 500_000_000n)).toBe(true)
    expect(resolved.scopes).toHaveLength(10)
    const now = Math.floor(Date.now() / 1000)
    expect(resolved.expiry).toBeGreaterThan(now)
    expect(resolved.expiry).toBeLessThanOrEqual(now + 86400 + 1)
  })

  it('adds a created token once, with a limit and a scope', () => {
    const token = '0x20C0000000000000000000000000000000000AbC'
    const authorization = demoWalletAuthorization([token, token.toLowerCase() as `0x${string}`])
    expect(authorization.limits).toHaveLength(6)
    expect(authorization.scopes).toHaveLength(11)
    expect(authorization.scopes.some((s) => s.address === token.toLowerCase())).toBe(true)
  })
})
