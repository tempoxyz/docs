import { describe, expect, it } from 'vitest'
import { finalizeSitemap } from './sitemap'

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

describe('finalizeSitemap', () => {
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
    const result = finalizeSitemap(sitemap, [], ['billing', 'activities', 'billing'])

    expect(result).toContain('<loc>https://tempo.xyz/developers/docs/api/activities</loc>')
    expect(result).toContain('<loc>https://tempo.xyz/developers/docs/api/billing</loc>')
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
