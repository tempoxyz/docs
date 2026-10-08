import { describe, expect, it } from 'vitest'
import { finalizeSitemap, sitemapCoverage } from './sitemap'

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tempo.xyz/developers/blog</loc>
  </url>
  <url>
    <loc>https://tempo.xyz/developers/blog/[slug]</loc>
    <lastmod>2026-07-18</lastmod>
  </url>
  <url>
    <loc>https://tempo.xyz/developers/docs/api</loc>
  </url>
  <url>
    <loc>https://tempo.xyz/developers/docs/api/authentication</loc>
  </url>
  <url>
    <loc>https://tempo.xyz/developers/example/[id]</loc>
  </url>
</urlset>`

describe('sitemapCoverage', () => {
  it('validates the new docs home without requiring a /docs index entry', () => {
    const current = sitemap.replace(
      '</urlset>',
      '<url><loc>https://tempo.xyz/developers/</loc></url></urlset>',
    )
    expect(sitemapCoverage(current, ['/', '/blog', '/docs/api']).missing).toEqual([])
  })

  it('detects missing nested getting-started and blog routes', () => {
    expect(sitemapCoverage(sitemap, ['/get-started/stablecoins', '/blog/t6']).missing).toEqual([
      'https://tempo.xyz/developers/get-started/stablecoins',
      'https://tempo.xyz/developers/blog/t6',
    ])
  })

  it('uses the API index if no blog index is available', () => {
    const apiOnly = '<urlset><url><loc>https://example.com/docs/api</loc></url></urlset>'
    expect(sitemapCoverage(apiOnly, ['/docs/api']).missing).toEqual([])
  })

  it('rejects a sitemap without a recognizable content index', () => {
    expect(() => sitemapCoverage('<urlset />', ['/'])).toThrow(
      'Could not resolve the site base URL',
    )
  })
})

describe('finalizeSitemap', () => {
  it('excludes redirected marketing surfaces while preserving docs and blog URLs', () => {
    const previousSite = sitemap.replace(
      '</urlset>',
      `${[
        '',
        '/get-started',
        '/get-started/stablecoins',
        '/get-started-extra',
        '/docs',
        '/build',
        '/build/tip20-tokens',
        '/build/tempo-transactions',
        '/performance',
      ]
        .map((route) => `<url><loc>https://tempo.xyz/developers${route}</loc></url>`)
        .join('\n')}</urlset>`,
    )
    const result = finalizeSitemap(previousSite, [{ slug: 't6' }])

    const locations = [...result.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    expect(locations).toContain('https://tempo.xyz/developers/blog/t6')
    expect(locations).toContain('https://tempo.xyz/developers/docs/api')
    expect(locations).toContain('https://tempo.xyz/developers')
    expect(locations).toContain('https://tempo.xyz/developers/get-started')
    expect(locations).toContain('https://tempo.xyz/developers/get-started/stablecoins')
    expect(locations).not.toContain('https://tempo.xyz/developers/get-started-extra')
    expect(locations).not.toContain('https://tempo.xyz/developers/docs')
    expect(
      locations.every((location) =>
        /^https:\/\/tempo\.xyz\/developers(?:\/?$|\/get-started(?:\/|$)|\/(?:docs\/|blog(?:\/|$)))/.test(
          location,
        ),
      ),
    ).toBe(true)
  })

  it('replaces the blog template with canonical post URLs and removes other templates', () => {
    const result = finalizeSitemap(sitemap, [
      { slug: 't7-network-upgrade' },
      { slug: 't6', lastmod: '2026-07-19' },
    ])

    expect(result).toContain('<loc>https://tempo.xyz/developers/blog/t6</loc>')
    expect(result).toContain('<loc>https://tempo.xyz/developers/blog/t7-network-upgrade</loc>')
    expect(result.indexOf('/blog/t6')).toBeLessThan(result.indexOf('/blog/t7-network-upgrade'))
    expect(result).toMatch(
      /<loc>https:\/\/tempo\.xyz\/developers\/blog\/t6<\/loc>\s*<lastmod>2026-07-19<\/lastmod>/,
    )
    expect(result).not.toMatch(
      /<loc>https:\/\/tempo\.xyz\/developers\/blog\/t7-network-upgrade<\/loc>\s*<lastmod>/,
    )
    expect(result).not.toContain('[slug]')
    expect(result).not.toContain('[id]')
  })

  it('does not duplicate a blog URL that the sitemap already contains', () => {
    const withExistingPost = sitemap.replace(
      '</urlset>',
      '  <url>\n    <loc>https://tempo.xyz/developers/blog/t6</loc>\n  </url>\n</urlset>',
    )
    const result = finalizeSitemap(withExistingPost, [{ slug: 't6', lastmod: '2026-07-19' }])

    expect(result.match(/<loc>https:\/\/tempo\.xyz\/developers\/blog\/t6<\/loc>/g)).toHaveLength(1)
  })

  it('uses the blog index when the framework stops emitting a template route', () => {
    const withoutBlogTemplate = sitemap.replace(
      / {2}<url>\n {4}<loc>https:\/\/tempo\.xyz\/developers\/blog\/\[slug\]<\/loc>\n {4}<lastmod>2026-07-18<\/lastmod>\n {2}<\/url>\n/,
      '',
    )
    const result = finalizeSitemap(withoutBlogTemplate, [{ slug: 't6' }])

    expect(result).toContain('<loc>https://tempo.xyz/developers/blog/t6</loc>')
  })

  it('adds generated OpenAPI routes without lastmod in stable order', () => {
    const result = finalizeSitemap(
      sitemap,
      [],
      ['billing', 'activities', 'routes/quotes', 'billing'],
    )

    expect(result).toContain('<loc>https://tempo.xyz/developers/docs/api/activities</loc>')
    expect(result).toContain('<loc>https://tempo.xyz/developers/docs/api/billing</loc>')
    expect(result).toContain('<loc>https://tempo.xyz/developers/docs/api/routes/quotes</loc>')
    expect(result.indexOf('/api/activities')).toBeLessThan(result.indexOf('/api/billing'))
    expect(result).not.toMatch(
      /<loc>https:\/\/tempo\.xyz\/developers\/docs\/api\/(?:activities|billing)<\/loc>\s*<lastmod>/,
    )
  })

  it('does not duplicate an authored OpenAPI route', () => {
    const result = finalizeSitemap(sitemap, [], ['authentication'])

    expect(
      result.match(/<loc>https:\/\/tempo\.xyz\/developers\/docs\/api\/authentication<\/loc>/g),
    ).toHaveLength(1)
  })
})
