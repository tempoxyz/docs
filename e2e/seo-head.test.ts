import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

// Social-card crawlers (Slack, X, iMessage, LinkedIn) read the raw HTML head
// without executing JavaScript, so per-page title/description/og tags must
// survive Vocs' head dedupe in the *prerendered* output — not just after
// hydration. These requests use the raw HTTP response, not a browser page.
//
// Only meaningful against the built artifact (CI serves `dist/preview.js`);
// the local dev server serves the marketing SPA shell for these routes.
test.skip(!process.env.CI, 'requires the production build output')

async function fetchHead(request: import('@playwright/test').APIRequestContext, path: string) {
  const response = await request.get(path)
  expect(response.status(), `${path} should be served`).toBe(200)
  const html = await response.text()
  const headEnd = html.indexOf('</head>')
  expect(headEnd, `${path} should have a <head>`).toBeGreaterThan(0)
  return html.slice(0, headEnd)
}

function metaContent(head: string, selector: string) {
  const match = head.match(
    new RegExp(`<meta[^>]*(?:property|name)="${selector}"[^>]*content="([^"]*)"`),
  )
  const attrFirst = head.match(
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:property|name)="${selector}"`),
  )
  return match?.[1] ?? attrFirst?.[1]
}

const cases: {
  path: string
  title: string
  ogTitle: string
  descriptionIncludes: string
  ogImageIncludes: string
}[] = [
  {
    path: '/',
    title: 'Tempo',
    ogTitle: 'Tempo',
    descriptionIncludes: 'blockchain designed for payments',
    ogImageIncludes: '/og-docs.png',
  },
  {
    path: '/blog',
    title: 'Blog ⋅ Tempo',
    ogTitle: 'Blog',
    descriptionIncludes: 'Engineering deep dives',
    ogImageIncludes: 'section=BLOG',
  },
  {
    path: '/build/tempo-transactions',
    title: 'Tempo Transactions',
    ogTitle: 'Tempo Transactions',
    descriptionIncludes: 'Batch, sponsor, schedule',
    ogImageIncludes: 'section=BUILD',
  },
  {
    path: '/performance',
    title: 'Performance ⋅ Tempo',
    ogTitle: 'Performance',
    descriptionIncludes: 'Nightly benchmarks',
    ogImageIncludes: 'section=PERFORMANCE',
  },
  {
    path: '/docs/guide/payments/send-a-payment',
    title: 'Send a Payment ⋅ Tempo',
    ogTitle: 'Send a Payment',
    descriptionIncludes: 'stablecoin payments between accounts',
    ogImageIncludes: 'subsection=PAYMENTS',
  },
]

for (const c of cases) {
  test(`prerendered head for ${c.path}`, async ({ request }) => {
    const head = await fetchHead(request, c.path)

    expect(head).toContain(`<title>${c.title}</title>`)
    expect(metaContent(head, 'og:title')).toBe(c.ogTitle)
    expect(metaContent(head, 'description')).toContain(c.descriptionIncludes)
    expect(metaContent(head, 'og:description')).toContain(c.descriptionIncludes)
    expect(metaContent(head, 'og:image')).toContain(c.ogImageIncludes)
    expect(metaContent(head, 'twitter:title')).toBe(c.ogTitle)
  })
}

// Published slugs come from blogs/*.md filenames (all-caps files are repo
// docs, not posts) — same rule as src/marketing/blogPlugin.ts. Reading the
// filesystem instead of scraping the blog index means a post can't silently
// escape coverage because of a markup change.
const blogSlugs = readdirSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'blogs'))
  .filter((f) => f.endsWith('.md') && !/^[A-Z0-9_-]+\.md$/.test(f))
  .map((f) => f.replace(/\.md$/, ''))

for (const slug of blogSlugs) {
  test(`prerendered head for blog post /blog/${slug}`, async ({ request }) => {
    const head = await fetchHead(request, `/blog/${slug}`)

    const ogTitle = metaContent(head, 'og:title')
    expect(ogTitle).toBeTruthy()
    expect(ogTitle).not.toBe('Tempo') // generic site fallback means the post head lost the dedupe
    expect(metaContent(head, 'og:type')).toBe('article')
    expect(metaContent(head, 'article:published_time')).toMatch(/^\d{4}-\d{2}-\d{2}/)
    expect(metaContent(head, 'og:image')).toContain('section=BLOG')
  })
}
