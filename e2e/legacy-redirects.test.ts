import { expect, test } from '@playwright/test'

const legacyRoutes = [
  ['/docs.md', '/index.md'],
  ['/assets/md/docs.md', '/assets/md/index.md'],
  ['/docs/guide', '/docs/quickstart/integrate-tempo'],
  ['/docs/quickstart', '/docs/quickstart/integrate-tempo'],
  ['/docs/guide/building-with-ai', '/docs/guide/using-tempo-with-ai'],
  ['/docs/learn/tempo/receive-policies', '/docs/guide/payments/configure-receive-policies'],
  ['/docs/protocol/blockspace', '/docs/protocol/blockspace/overview'],
  ['/docs/protocol/tip20', '/docs/protocol/tip20/overview'],
  ['/docs/protocol/tip20-rewards', '/docs/protocol/upgrades/t7#deprecate-tip-20-rewards'],
  ['/docs/sdk/typescript/prool', '/docs/sdk/typescript/prool/setup'],
  ['/docs/protocol/exchange/pathUSD', '/docs/protocol/exchange/quote-tokens#pathusd'],
] as const

for (const [source, destination] of legacyRoutes) {
  test(`preserves queries and destination anchors when retiring ${source}`, async ({ request }) => {
    const response = await request.get(`${source}?ref=legacy&utm_source=docs`, {
      maxRedirects: 0,
      headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0' },
    })
    expect(response.status()).toBe(301)
    const target = new URL(response.headers().location, response.url())
    const expected = new URL(destination, response.url())
    expect(target.pathname.replace(/^\/developers(?=\/|$)/, '')).toBe(expected.pathname)
    expect(target.hash).toBe(expected.hash)
    expect(target.searchParams.get('ref')).toBe('legacy')
    expect(target.searchParams.get('utm_source')).toBe('docs')
  })
}
