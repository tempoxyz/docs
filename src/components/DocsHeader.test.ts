import { describe, expect, it, vi } from 'vitest'
import { docsSections, getActiveDocsSection } from '../lib/docs-sections'
import { normalizeDocsPath, resolveSidebarItems } from './DocsHeader'

// These tests exercise routing helpers, not the Vocs UI or its virtual modules.
vi.mock('vocs', () => ({ useConfig: vi.fn() }))

const sidebar = {
  '/get-started': [{ text: 'Get Started' }],
  '/docs': [{ text: 'Get Started' }],
  '/docs/protocol': [{ text: 'Tempo EVM' }],
  '/docs/protocol/rpc': [{ text: 'RPC reference' }],
}

describe('normalizeDocsPath', () => {
  it.each([
    ['/developers/docs/protocol', '/docs/protocol'],
    ['/developers/docs/protocol/tip20/overview', '/docs/protocol/tip20/overview'],
    ['/developers', '/'],
    ['/developers/get-started', '/get-started'],
    ['/docs/tools', '/docs/tools'],
    ['', '/'],
  ])('normalizes %s to %s', (pathname, expected) => {
    expect(normalizeDocsPath(pathname)).toBe(expected)
  })
})

describe('resolveSidebarItems', () => {
  it('resolves the standalone getting-started sidebar under the production mount', () => {
    expect(resolveSidebarItems(sidebar, '/developers/get-started')[0]?.text).toBe('Get Started')
  })

  it('uses the current docs section when served from the developers mount', () => {
    const items = resolveSidebarItems(sidebar, '/developers/docs/protocol')

    expect(items[0]?.text).toBe('Tempo EVM')
  })

  it('uses the longest matching sidebar key', () => {
    const items = resolveSidebarItems(sidebar, '/docs/protocol/rpc/eth_getBalance')

    expect(items[0]?.text).toBe('RPC reference')
  })
})

describe('getActiveDocsSection', () => {
  it('presents seven product and developer tabs without availability badges', () => {
    expect(docsSections.map(({ label }) => label)).toEqual([
      'Get Started',
      'Accounts',
      'Earn',
      'Routes',
      'Zones',
      'Machine Payments',
      'Tempo EVM',
    ])
  })

  it('opens the guide library from Tempo EVM and the MPP introduction from Machine payments', () => {
    expect(docsSections.find(({ id }) => id === 'developers')?.href).toBe('/docs/development')
    expect(docsSections.find(({ id }) => id === 'machine-payments')?.href).toBe('/docs/agents')
  })

  it('keeps section navigation active under the developers mount and trailing slashes', () => {
    expect(getActiveDocsSection('/developers/docs/api/transfers/')?.id).toBe('tools')
    expect(getActiveDocsSection('/developers/get-started/')?.id).toBe('overview')
    expect(getActiveDocsSection('/developers/docs/protocol/upgrades/t12/')?.id).toBe('developers')
    expect(getActiveDocsSection('/developers/docs/protocol/')?.label).toBe('Tempo EVM')
  })

  it.each([
    ['/get-started', 'overview'],
    ['/get-started/quickstart', 'overview'],
    ['/docs/network', 'developers'],
    ['/docs/network/transactions', 'developers'],
    ['/get-started/stablecoins', 'overview'],
    ['/docs/development', 'developers'],
    ['/docs/api/console', 'tools'],
    ['/docs/quickstart/evm-compatibility', 'developers'],
    ['/docs/guide/using-tempo-with-ai', 'overview'],
    ['/docs/quickstart/faucet', 'overview'],
    ['/docs/accounts', 'accounts'],
    ['/docs/accounts/create', 'accounts'],
    ['/docs/accounts/keys', 'developers'],
    ['/docs/accounts/admin-keys', 'developers'],
    ['/docs/accounts/providers', 'accounts'],
    ['/docs/accounts/access-keys', 'developers'],
    ['/docs/accounts/agents', 'accounts'],
    ['/docs/protocol/transactions/AccountKeychain', 'developers'],
    ['/docs/protocol/tip20/virtual-addresses', 'accounts'],
    ['/docs/protocol/tip403/receive-policies', 'accounts'],
    ['/docs/payments', 'accounts'],
    ['/docs/build', 'accounts'],
    ['/docs/guide/getting-funds', 'accounts'],
    ['/docs/guide/payments/send-a-payment', 'accounts'],
    ['/docs/guide/tempo-transaction', 'developers'],
    ['/docs/quickstart/wallet-developers', 'developers'],
    ['/docs/quickstart/tokenlist', 'developers'],
    ['/docs/earn', 'earn'],
    ['/docs/earn/balances', 'earn'],
    ['/docs/earn/withdraw', 'earn'],
    ['/docs/routes', 'routes'],
    ['/docs/routes/transfers', 'routes'],
    ['/docs/routes/deposits', 'routes'],
    ['/docs/guide/stablecoin-dex/executing-swaps', 'developers'],
    ['/docs/guide/bridge-layerzero', 'ecosystem'],
    ['/docs/guide/bridge-bungee', 'ecosystem'],
    ['/docs/guide/bridge-relay', 'ecosystem'],
    ['/docs/zones', 'zones'],
    ['/docs/protocol/zones', 'zones'],
    ['/docs/protocol/zones/architecture', 'zones'],
    ['/docs/protocol/zones/accounts', 'zones'],
    ['/docs/protocol/zones/bridging', 'zones'],
    ['/docs/protocol/zones/rpc', 'zones'],
    ['/docs/protocol/zones/execution', 'zones'],
    ['/docs/protocol/zones/proving', 'zones'],
    ['/docs/guide/private-zones/connect-to-a-zone', 'zones'],
    ['/docs/agents', 'machine-payments'],
    ['/docs/guide/machine-payments/agent', 'machine-payments'],
    ['/docs/guide/machine-payments/pay-as-you-go', 'machine-payments'],
    ['/docs/guide/machine-payments/streamed-payments', 'machine-payments'],
    ['/docs/guide/mercator', 'machine-payments'],
    ['/docs/partners', 'ecosystem'],
    ['/docs/partners/wallets', 'ecosystem'],
    ['/docs/guide/ousd', 'ecosystem'],
    ['/docs/partners/join', 'ecosystem'],
    ['/docs/quickstart/integrate-tempo', 'developers'],
    ['/docs/quickstart/connection-details', 'developers'],
    ['/docs/guide/issuance/create-a-stablecoin', 'developers'],
    ['/docs/guide/issuance/manage-stablecoin', 'developers'],
    ['/docs/guide/issuance/migrate-erc20-to-tip20', 'developers'],
    ['/docs/protocol', 'developers'],
    ['/docs/protocol/transactions', 'developers'],
    ['/docs/protocol/transactions/spec-tempo-transaction', 'developers'],
    ['/docs/protocol/transactions/eip-4337', 'developers'],
    ['/docs/protocol/transactions/eip-7702', 'developers'],
    ['/docs/protocol/fees/spec-fee', 'developers'],
    ['/docs/protocol/fees/fee-amm', 'developers'],
    ['/docs/protocol/tip20/overview', 'developers'],
    ['/docs/protocol/tip20/spec', 'developers'],
    ['/docs/protocol/tip403/spec', 'developers'],
    ['/docs/protocol/exchange/spec', 'developers'],
    ['/docs/protocol/blockspace/payment-lane-specification', 'developers'],
    ['/docs/guide/node/installation', 'developers'],
    ['/docs/protocol/upgrades', 'developers'],
    ['/docs/protocol/upgrades/t11', 'developers'],
    ['/docs/protocol/upgrades/t12', 'developers'],
    ['/docs/guide/node/upgrade-cadence', 'developers'],
    ['/docs/guide/node/network-upgrades', 'developers'],
    ['/docs/changelog', 'developers'],
    ['/docs/api/indexer-api', 'tools'],
    ['/docs/protocol/rpc/eth_getBalance', 'developers'],
    ['/docs/sdk/typescript', 'tools'],
    ['/docs/cli/request', 'tools'],
    ['/docs/wallet/recipes', 'tools'],
    ['/docs/server/relay-handler', 'tools'],
    ['/docs/tools', 'tools'],
    ['/docs/quickstart/developer-tools', 'tools'],
  ])('assigns %s to the %s section', (pathname, expected) => {
    expect(getActiveDocsSection(pathname)?.id).toBe(expected)
    expect(getActiveDocsSection(`/developers${pathname}/`)?.id).toBe(expected)
  })

  it.each([
    '/',
    '/developers/',
    '/docs',
    '/blog',
    '/docs/apiary',
    '/docs/earnings',
    '/docs/spend',
    '/docs/spending',
    '/docs/guide/private-zones-extra',
    '/docs/guide/machine-payments-extra',
    '/docs/agents-extra',
  ])('does not mark an unrelated route active: %s', (pathname) =>
    expect(getActiveDocsSection(pathname)).toBeUndefined())
})
