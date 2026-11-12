import MiniSearch from 'minisearch'
import { describe, expect, it } from 'vitest'
import config from '../../vocs.config'
import { docsSearch } from './docs-search'

describe('documentation search', () => {
  it('finds account pages while the user is still typing', () => {
    const index = new MiniSearch({
      ...config.search?.index,
      fields: ['title', 'titles', 'subtitle', 'path', 'excerpt'],
      storeFields: ['title', 'href'],
    })
    index.addAll(
      [
        { id: 'accounts', title: 'Accounts', href: '/docs/accounts' },
        { id: 'create', title: 'Create an account', href: '/docs/accounts/create' },
        { id: 'routes', title: 'Tempo Routes', href: '/docs/routes' },
      ].map((document) => ({
        ...document,
        category: '',
        searchPriority: undefined,
        subtitle: '',
        text: '',
        titles: [],
        type: 'page' as const,
      })),
    )

    for (const query of ['acc', 'accoun', 'account', 'accounts']) {
      expect(index.search(query, config.search?.query).map((result) => result.id)).toContain(
        'accounts',
      )
    }
    expect(index.search('accoun', config.search?.query).map((result) => result.id)).toContain(
      'create',
    )
    expect(index.search('accoun', config.search?.query).map((result) => result.id)).not.toContain(
      'routes',
    )
  })

  it('ranks guides above API operations for intent queries', () => {
    // Vocs sends search functions to the browser as source text, so rebuild them from it.
    const fromSource = <T>(options: T): T =>
      Object.fromEntries(
        Object.entries(options as Record<string, unknown>).map(([key, value]) => [
          key,
          typeof value === 'function' ? new Function(`return ${value.toString()}`)() : value,
        ]),
      ) as T
    const indexOptions = fromSource(docsSearch.index)
    const index = new MiniSearch({
      ...indexOptions,
      storeFields: ['category', 'href', 'searchPriority', 'title', 'titles', 'type'],
    })
    const operation = (group: string, id: string, title: string) => ({
      id: `openapi:/docs/api/${group.toLowerCase().replaceAll(' ', '-')}#${id}`,
      href: `/docs/api/${group.toLowerCase().replaceAll(' ', '-')}#${id}`,
      category: 'Tempo API',
      subtitle: '',
      text: title,
      title,
      titles: ['Tempo API', group],
      type: 'section',
    })
    const page = (href: string, title: string, text = '') => ({
      id: href,
      href,
      category: 'Docs',
      subtitle: '',
      text,
      title,
      titles: [],
      type: 'page',
    })
    index.addAll([
      page(
        '/docs/api/console/api-keys#how-to-create-and-manage-api-keys',
        'How to create and manage API keys',
        'API keys authenticate an integration and attribute its usage to a project.',
      ),
      operation('API keys', 'revokeapikey', 'Revoke API key'),
      operation('API keys', 'rotateapikey', 'Rotate API key'),
      page('/docs/quickstart/faucet#tempo-faucet', 'Tempo faucet: get testnet funds'),
      { ...operation('Faucet', 'fundtestnetaccount', 'Fund testnet account') },
      {
        ...page('/docs/api/faucet', 'Faucet'),
        id: 'openapi:/docs/api/faucet',
        titles: ['Tempo API'],
      },
      page(
        '/docs/quickstart/connection-details#network-details',
        'Network details',
        'Use Tempo Mainnet for production and Moderato testnet for development.',
      ),
      operation('JSON-RPC', 'eth_chainid', 'eth_chainId'),
      { ...operation('JSON-RPC', 'eth_blocknumber', 'eth_blockNumber'), text: 'RPC url' },
    ])
    const queryOptions = { ...fromSource(docsSearch.query), tokenize: indexOptions.tokenize }
    const search = (query: string) => index.search(query, queryOptions)

    expect(search('api key')[0]?.title).toBe('How to create and manage API keys')
    expect(search('faucet')[0]?.title).toBe('Tempo faucet: get testnet funds')
    expect(search('chain id')[0]?.title).toBe('Network details')
    expect(search('rpc url')[0]?.title).toBe('Network details')
    // Operations still surface for their own names, under a breadcrumb that names the
    // section once.
    const revoke = search('revoke api key').find((result) => result.title === 'Revoke API key')
    expect(revoke?.titles).toEqual(['API keys'])
  })
})
