import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackDocsRequest } from './docs-request-analytics'

const request = (path: string) =>
  new Request(`https://docs.example.com${path}`, { headers: { 'user-agent': 'GPTBot' } })

afterEach(() => vi.unstubAllGlobals())

describe('docs request analytics', () => {
  it('skips assets and redirects even for known crawlers', async () => {
    const send = vi.fn()
    vi.stubGlobal('fetch', send)

    await trackDocsRequest(request('/assets/layout.js'), 200, 0, { key: 'test' })
    await trackDocsRequest(request('/RSC/R/docs/accounts.txt'), 200, 0, { key: 'test' })
    await trackDocsRequest(request('/docs/old-page'), 308, 0, { key: 'test' })

    expect(send).not.toHaveBeenCalled()
  })

  it('sends Markdown views to the configured HTTP collector', async () => {
    const send = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', send)

    await trackDocsRequest(request('/docs/accounts.md'), 200, 0, {
      key: 'test',
      host: 'http://localhost:8000/analytics/',
    })

    expect(send).toHaveBeenCalledExactlyOnceWith(
      new URL('http://localhost:8000/analytics/capture/'),
      expect.objectContaining({ body: expect.stringContaining('"surface":"markdown"') }),
    )
  })
})
