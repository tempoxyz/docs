import { describe, expect, it } from 'vitest'
import { docsSections, getActiveDocsSection } from '../lib/docs-sections'
import { normalizeDocsPath, resolveSidebarItems } from './DocsHeader'

const sidebar = {
  '/get-started': [{ text: 'Get Started' }],
  '/docs': [{ text: 'Get Started' }],
  '/docs/protocol': [{ text: 'Specifications' }],
  '/docs/protocol/rpc': [{ text: 'Developer Resources' }],
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

    expect(items[0]?.text).toBe('Specifications')
  })

  it('uses the longest matching sidebar key', () => {
    const items = resolveSidebarItems(sidebar, '/docs/protocol/rpc/eth_getBalance')

    expect(items[0]?.text).toBe('Developer Resources')
  })
})

describe('getActiveDocsSection', () => {
  it('presents products in task order with machine payments inside Payments', () => {
    expect(docsSections.map(({ label }) => label)).toEqual([
      'Get Started',
      'Accounts',
      'Payments',
      'Earn',
      'Routes',
      'Zones',
      'Developer Resources',
    ])
  })

  it('keeps section navigation active under the developers mount and trailing slashes', () => {
    expect(getActiveDocsSection('/developers/docs/api/transfers/')?.id).toBe('development')
    expect(getActiveDocsSection('/developers/get-started/')?.id).toBe('overview')
    expect(getActiveDocsSection('/developers/docs/protocol/upgrades/t12/')?.id).toBe('changelog')
    expect(getActiveDocsSection('/developers/docs/protocol/')?.label).toBe('Specifications')
  })

  it.each([
    ['/get-started', 'overview'],
    ['/get-started/stablecoins', 'overview'],
    ['/docs/development', 'development'],
    ['/docs/api/console', 'development'],
    ['/docs/quickstart/evm-compatibility', 'development'],
    ['/docs/guide/using-tempo-with-ai', 'development'],
    ['/docs/quickstart/faucet', 'overview'],
    ['/docs/accounts', 'accounts'],
    ['/docs/accounts/create', 'accounts'],
    ['/docs/accounts/providers', 'accounts'],
    ['/docs/accounts/access-keys', 'accounts'],
    ['/docs/accounts/agents', 'accounts'],
    ['/docs/payments', 'payments'],
    ['/docs/build', 'accounts'],
    ['/docs/guide/getting-funds', 'accounts'],
    ['/docs/guide/payments/send-a-payment', 'payments'],
    ['/docs/guide/tempo-transaction', 'payments'],
    ['/docs/quickstart/wallet-developers', 'accounts'],
    ['/docs/quickstart/tokenlist', 'accounts'],
    ['/docs/earn', 'earn'],
    ['/docs/earn/balances', 'earn'],
    ['/docs/earn/withdraw', 'earn'],
    ['/docs/routes', 'routes'],
    ['/docs/routes/transfers', 'routes'],
    ['/docs/routes/deposits', 'routes'],
    ['/docs/guide/stablecoin-dex/executing-swaps', 'routes'],
    ['/docs/guide/bridge-layerzero', 'development'],
    ['/docs/guide/bridge-bungee', 'development'],
    ['/docs/guide/bridge-relay', 'development'],
    ['/docs/zones', 'zones'],
    ['/docs/guide/private-zones/connect-to-a-zone', 'zones'],
    ['/docs/agents', 'payments'],
    ['/docs/guide/machine-payments/agent', 'payments'],
    ['/docs/guide/mercator', 'payments'],
    ['/docs/ecosystem', 'development'],
    ['/docs/ecosystem/wallets', 'development'],
    ['/docs/guide/ousd', 'development'],
    ['/docs/partners', 'development'],
    ['/docs/quickstart/integrate-tempo', 'development'],
    ['/docs/quickstart/connection-details', 'development'],
    ['/docs/guide/issuance/create-a-stablecoin', 'protocol'],
    ['/docs/protocol/tip20/overview', 'protocol'],
    ['/docs/guide/node/installation', 'development'],
    ['/docs/protocol/upgrades', 'changelog'],
    ['/docs/protocol/upgrades/t11', 'changelog'],
    ['/docs/protocol/upgrades/t12', 'changelog'],
    ['/docs/guide/node/upgrade-cadence', 'development'],
    ['/docs/guide/node/network-upgrades', 'changelog'],
    ['/docs/changelog', 'changelog'],
    ['/docs/api/indexer-api', 'development'],
    ['/docs/protocol/rpc/eth_getBalance', 'development'],
    ['/docs/sdk/typescript', 'development'],
    ['/docs/cli/request', 'development'],
    ['/docs/wallet/recipes', 'development'],
    ['/docs/server/relay-handler', 'development'],
    ['/docs/tools', 'development'],
    ['/docs/quickstart/developer-tools', 'development'],
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
  ])('does not mark an unrelated route active: %s', (pathname) =>
    expect(getActiveDocsSection(pathname)).toBeUndefined())
})
