import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'

test.skip(!process.env.CI, 'requires the production build output')

const pages = [
  { path: '/docs/protocol/transactions', maxBytes: 2_000_000, shiki: true },
  { path: '/docs/guide/tempo-transaction', maxBytes: 2_000_000, shiki: true },
  { path: '/docs/changelog', maxBytes: 1_000_000, shiki: false },
] as const

for (const page of pages) {
  test(`${page.path} stays below its initial HTML budget`, async ({ request }) => {
    const response = await request.get(page.path, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'Mozilla/5.0 Chrome/140 Safari/537.36',
      },
    })
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')

    const html = await response.text()
    expect(Buffer.byteLength(html)).toBeLessThan(page.maxBytes)

    if (page.shiki) {
      expect(html).toContain('data-shiki-styles')
      expect((html.match(/--shiki-light/g) ?? []).length).toBeLessThan(100)
      expect(html).toContain('light-dark(')
      expect(html).toContain('twoslash-hover')
    } else {
      expect(html.match(/bodyHtml/g) ?? []).toHaveLength(20)
      expect(html).toContain('https://github.com/tempoxyz/tempo/releases')
    }
  })
}
