import MiniSearch from 'minisearch'
import { describe, expect, it } from 'vitest'
import config from '../../vocs.config'

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
})
