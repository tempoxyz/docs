import { afterEach, describe, expect, it, vi } from 'vitest'

describe('searchResultHref', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('keeps Vocs search paths unchanged outside production', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    const { searchResultHref } = await import('./SearchDialog')

    expect(searchResultHref('/docs/guide/payments#send-a-payment')).toBe(
      '/docs/guide/payments#send-a-payment',
    )
  })

  it('routes production search results through the public developers mount', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const { searchResultHref } = await import('./SearchDialog')

    expect(searchResultHref('/docs/guide/payments#send-a-payment')).toBe(
      '/developers/docs/guide/payments#send-a-payment',
    )
  })
})
