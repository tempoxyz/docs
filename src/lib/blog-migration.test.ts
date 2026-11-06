import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import vocsConfig from '../../vocs.config'
import { blogMigrationRedirects, engineeringBlogUrl, migratedBlogSlugs } from './blog-migration'

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as {
  redirects: { source: string; destination: string; permanent: boolean; has?: unknown[] }[]
  rewrites: { source: string; destination: string }[]
}

describe('engineering blog retirement', () => {
  it('covers every original published post without deleting its source', () => {
    const sources = fs.readdirSync('blogs').filter((file) => /^[a-z].*\.md$/.test(file))
    expect(sources.sort()).toEqual(migratedBlogSlugs.map((slug) => `${slug}.md`).sort())
  })

  it.each(
    blogMigrationRedirects,
  )('redirects $source directly to $destination in both mounts', (route) => {
    expect(vocsConfig.redirects).toContainEqual({ ...route, status: 301 })
    for (const prefix of ['', '/developers']) {
      const matches = vercel.redirects.filter(({ source }) => source === `${prefix}${route.source}`)
      expect(matches).toEqual([
        { source: `${prefix}${route.source}`, destination: route.destination, permanent: true },
      ])
      const index = vercel.redirects.indexOf(matches[0])
      const firstHostRedirect = vercel.redirects.findIndex(({ has }) => has?.length)
      expect(index).toBeLessThan(firstHostRedirect)
      expect(new URL(route.destination).origin).toBe('https://tempo.xyz')
      expect(new URL(route.destination).pathname).not.toMatch(/^\/developers(?:\/|$)/)
      expect(new URL(route.destination).pathname.endsWith('.md')).toBe(
        /\.md\/?$/.test(route.source),
      )
    }
  })

  it('keeps incoming category and tracking query parameters available to the website', () => {
    // Vercel retains incoming query keys unless the destination sets that key.
    // The website accepts the source category slugs, so do not overwrite category.
    for (const source of ['/blog', '/blog/']) {
      const route = blogMigrationRedirects.find((redirect) => redirect.source === source)
      expect(route?.destination).toBe(engineeringBlogUrl)
      if (!route) throw new Error(`Missing redirect for ${source}`)
      expect(new URL(route.destination).searchParams.get('channel')).toBe('engineering')
      expect(new URL(route.destination).searchParams.has('category')).toBe(false)
    }
  })

  it.each(
    ['/blog.md', '/blog/index.md', '/assets/md/blog.md', '/assets/md/blog/index.md'].flatMap(
      (source) => [source, `${source}/`],
    ),
  )('preserves Markdown for the legacy index %s', (source) => {
    expect(blogMigrationRedirects.find((redirect) => redirect.source === source)?.destination).toBe(
      'https://tempo.xyz/blog.md',
    )
  })

  it.each([
    ...migratedBlogSlugs.map((slug) => [slug, slug] as const),
    ['inside-tempo-zones', 'privacy-with-tempo-zones'] as const,
  ])('preserves HTML and Markdown representations for %s', (sourceSlug, destinationSlug) => {
    for (const suffix of ['', '/']) {
      expect(
        blogMigrationRedirects.find(
          (redirect) => redirect.source === `/blog/${sourceSlug}${suffix}`,
        )?.destination,
      ).toBe(`https://tempo.xyz/blog/${destinationSlug}/`)
      for (const prefix of ['/blog', '/assets/md/blog']) {
        expect(
          blogMigrationRedirects.find(
            (redirect) => redirect.source === `${prefix}/${sourceSlug}.md${suffix}`,
          )?.destination,
        ).toBe(`https://tempo.xyz/blog/${destinationSlug}.md`)
      }
    }
  })

  it('keeps media reachable and never redirects the entire blog subtree', () => {
    const assets = fs
      .readdirSync('public/blog', { recursive: true })
      .filter((file) => fs.statSync(path.join('public/blog', String(file))).isFile())
    expect(assets.length).toBeGreaterThan(0)
    for (const asset of assets) {
      for (const prefix of ['', '/developers']) {
        expect(
          vercel.redirects.some(({ source, has }) => !has && source === `${prefix}/blog/${asset}`),
        ).toBe(false)
      }
    }
    expect(
      vercel.redirects
        .filter(({ source }) => /^\/(?:developers\/)?blog/.test(source))
        .every(({ source }) => !source.includes(':') && !source.includes('*')),
    ).toBe(true)
    expect(vercel.rewrites).toContainEqual({
      source: '/developers/blog/:path*',
      destination: '/blog/:path*',
    })
  })

  it('uses an external engineering link in both docs navigation surfaces', () => {
    expect(vocsConfig.topNav).toContainEqual({ text: 'Blog', link: engineeringBlogUrl })
    for (const file of ['DocsHeader.tsx', 'DocsSectionNav.tsx']) {
      const source = fs.readFileSync(`src/components/${file}`, 'utf8')
      expect(source).toMatch(/<a\s+href=\{engineeringBlogUrl\}/)
      expect(source).not.toContain('to="/blog"')
    }
  })

  it('removes blog page rendering and indexing without removing archived posts', () => {
    expect(fs.existsSync('src/pages/blog.tsx')).toBe(false)
    expect(fs.existsSync('src/pages/blog/[slug].tsx')).toBe(false)
    expect(fs.readFileSync('vite.config.ts', 'utf8')).not.toContain('blogPostsPlugin()')
    expect(fs.readFileSync('src/marketing/search.ts', 'utf8')).not.toContain(
      'virtual:blog-search-documents',
    )
    expect(fs.readFileSync('scripts/finalize-sitemap.ts', 'utf8')).not.toContain('getBlogPostSlugs')
  })
})
