import { describe, expect, it } from 'vitest'
import { finalizeSitemap, shouldIncludeInSitemap } from './sitemap'

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
    <loc>https://tempo.xyz/developers/example/[id]</loc>
  </url>
</urlset>`

describe('finalizeSitemap', () => {
  it('replaces the blog template with canonical post URLs and removes other templates', () => {
    const result = finalizeSitemap(sitemap, ['t7-network-upgrade', 't6'])

    expect(result).toContain('<loc>https://tempo.xyz/developers/blog/t6</loc>')
    expect(result).toContain('<loc>https://tempo.xyz/developers/blog/t7-network-upgrade</loc>')
    expect(result.indexOf('/blog/t6')).toBeLessThan(result.indexOf('/blog/t7-network-upgrade'))
    expect(result).not.toContain('[slug]')
    expect(result).not.toContain('[id]')
  })

  it('does not duplicate a blog URL that the sitemap already contains', () => {
    const withExistingPost = sitemap.replace(
      '</urlset>',
      '  <url>\n    <loc>https://tempo.xyz/developers/blog/t6</loc>\n  </url>\n</urlset>',
    )
    const result = finalizeSitemap(withExistingPost, ['t6'])

    expect(result.match(/<loc>https:\/\/tempo\.xyz\/developers\/blog\/t6<\/loc>/g)).toHaveLength(1)
  })

  it('uses the blog index when the framework stops emitting a template route', () => {
    const withoutBlogTemplate = sitemap.replace(
      / {2}<url>\n {4}<loc>https:\/\/tempo\.xyz\/developers\/blog\/\[slug\]<\/loc>\n {4}<lastmod>2026-07-18<\/lastmod>\n {2}<\/url>\n/,
      '',
    )
    const result = finalizeSitemap(withoutBlogTemplate, ['t6'])

    expect(result).toContain('<loc>https://tempo.xyz/developers/blog/t6</loc>')
  })
})

describe('shouldIncludeInSitemap', () => {
  it('keeps concrete routes and excludes dynamic route templates', () => {
    expect(shouldIncludeInSitemap('/blog/t7-network-upgrade')).toBe(true)
    expect(shouldIncludeInSitemap('/docs/guide/payments')).toBe(true)
    expect(shouldIncludeInSitemap('/blog/[slug]')).toBe(false)
    expect(shouldIncludeInSitemap('/examples/[id]/details')).toBe(false)
  })
})
