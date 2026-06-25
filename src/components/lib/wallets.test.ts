import { describe, expect, it } from 'vitest'
import { isFundableWalletConnector } from './wallets'

describe('isFundableWalletConnector', () => {
  it.each([
    ['injected', true],
    ['io.metamask', true],
    ['webAuthn', false],
    ['xyz.tempo', false],
  ])('returns %s fundable wallet status as %s', (connectorId, expected) => {
    expect(isFundableWalletConnector({ id: connectorId })).toBe(expected)
  })

  it('allows WebAuthn only when requested for e2e', () => {
    expect(isFundableWalletConnector({ id: 'webAuthn' }, { includeWebAuthn: true })).toBe(true)
  })
})
