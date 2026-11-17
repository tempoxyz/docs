import { describe, expect, it } from 'vitest'
import type { Connector } from 'wagmi'
import {
  filterSupportedFundableWalletConnectors,
  filterSupportedInjectedConnectors,
  isBrowserWalletConnectorId,
  isFundableWalletConnector,
} from './wallets'

const connectors = [
  { id: 'injected', name: 'Injected Wallet' },
  { id: 'io.metamask', name: 'MetaMask' },
  { id: 'webAuthn', name: 'Passkey' },
  { id: 'tempoId', name: 'Tempo ID' },
  { id: 'app.phantom', name: 'Phantom' },
  { id: 'injected', name: 'Injected Wallet Duplicate' },
] as Connector[]

describe('isFundableWalletConnector', () => {
  it.each([
    ['injected', true],
    ['io.metamask', true],
    ['webAuthn', false],
    ['tempoId', true],
  ])('returns %s fundable wallet status as %s', (connectorId, expected) => {
    expect(isFundableWalletConnector({ id: connectorId })).toBe(expected)
  })

  it('allows WebAuthn only when requested for e2e', () => {
    expect(isFundableWalletConnector({ id: 'webAuthn' }, { includeWebAuthn: true })).toBe(true)
  })
})

describe('isBrowserWalletConnectorId', () => {
  it.each([
    ['injected', true],
    ['io.metamask', true],
    ['webAuthn', false],
    ['tempoId', false],
  ])('returns %s browser wallet status as %s', (connectorId, expected) => {
    expect(isBrowserWalletConnectorId(connectorId)).toBe(expected)
  })
})

describe('filterSupportedInjectedConnectors', () => {
  it('keeps only supported browser wallets by default', () => {
    expect(filterSupportedInjectedConnectors(connectors).map((connector) => connector.id)).toEqual([
      'injected',
      'io.metamask',
    ])
  })

  it('allows WebAuthn only when requested for e2e', () => {
    expect(
      filterSupportedInjectedConnectors(connectors, { includeWebAuthn: true }).map(
        (connector) => connector.id,
      ),
    ).toEqual(['injected', 'io.metamask', 'webAuthn'])
  })
})

describe('filterSupportedFundableWalletConnectors', () => {
  it('keeps supported faucet-fundable wallets by default', () => {
    expect(
      filterSupportedFundableWalletConnectors(connectors).map((connector) => connector.id),
    ).toEqual(['injected', 'io.metamask', 'tempoId'])
  })

  it('allows WebAuthn only when requested for e2e', () => {
    expect(
      filterSupportedFundableWalletConnectors(connectors, { includeWebAuthn: true }).map(
        (connector) => connector.id,
      ),
    ).toEqual(['injected', 'io.metamask', 'webAuthn', 'tempoId'])
  })
})
