import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { migratedBlogSlugs } from '../src/lib/blog-migration'

const engineeringBlogUrl = 'https://tempo.xyz/blog/?channel=engineering'
const posts = [
  ...migratedBlogSlugs.map((slug) => [slug, slug] as const),
  ['inside-tempo-zones', 'privacy-with-tempo-zones'],
] as const

// The website owns blog rendering, filters, and author credits. Docs owns
// permanent HTML redirects; never follow them to the live website in this suite.
// Markdown representations are covered by src/lib/blog-migration.test.ts.
for (const suffix of ['', '/']) {
  test(`permanently redirects the legacy blog index /blog${suffix}`, async ({ request }) => {
    const response = await request.get(`/blog${suffix}?category=technical&utm_source=docs`, {
      headers: { Accept: 'text/html' },
      maxRedirects: 0,
    })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe(
      `${engineeringBlogUrl}&category=technical&utm_source=docs`,
    )
  })

  for (const [source, destination] of posts) {
    test(`permanently redirects the legacy article /blog/${source}${suffix}`, async ({
      request,
    }) => {
      const response = await request.get(`/blog/${source}${suffix}?utm_source=docs`, {
        headers: { Accept: 'text/html' },
        maxRedirects: 0,
      })
      expect(response.status()).toBe(301)
      expect(response.headers().location).toBe(
        `https://tempo.xyz/blog/${destination}/?utm_source=docs`,
      )
    })
  }
}

for (const width of [390, 1440]) {
  test(`does not offer a blog section in docs navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: 'Search documentation', exact: true }),
    ).toBeEnabled()
    await expect(
      page.locator('header').getByRole('link', { name: 'Blog', exact: true, includeHidden: true }),
    ).toHaveCount(0)
    await expect(page.locator('#blog, .tempo-blog')).toHaveCount(0)
    if (width < 1200) {
      await page.getByRole('button', { name: 'Open menu', exact: true }).click()
      const menu = page.getByRole('dialog', { name: 'Tempo Developers menu', exact: true })
      await expect(menu).toBeVisible()
      await expect(
        menu.getByRole('link', { name: 'Blog', exact: true, includeHidden: true }),
      ).toHaveCount(0)
      await expect(menu.getByRole('link', { name: 'Get started', exact: true })).toBeVisible()
    } else {
      const products = page
        .locator('header.docs-site-header')
        .getByRole('navigation', { name: 'Products', exact: true })
      await expect(products).toBeVisible()
      await expect(products.getByRole('link')).toHaveText([
        'Get started',
        'Accounts',
        'Earn',
        'Routes',
        'Zones',
        'Machine Payments',
        'Network',
      ])
      // Resources, the bar's only menu, opens outside the header.
      await products.getByRole('button', { name: 'Resources', exact: true }).click()
      await expect(
        page.getByRole('menu', { name: 'Resources', exact: true }).getByRole('menuitem'),
      ).toHaveText(['Guides', 'Partners', 'SDKs & CLI'])
    }
  })
}

const mediaDirectory = fileURLToPath(new URL('../public/blog/', import.meta.url))
const mediaFiles = readdirSync(mediaDirectory, { recursive: true })
  .map(String)
  .filter((file) => statSync(join(mediaDirectory, file)).isFile())

test('keeps every archived blog image, video, and data file directly reachable', async ({
  request,
}) => {
  expect(mediaFiles.length).toBeGreaterThan(0)
  for (const file of mediaFiles) {
    await test.step(`/blog/${file}`, async () => {
      const response = await request.head(`/blog/${file}`, { maxRedirects: 0 })
      expect(response.status()).toBe(200)
      expect(response.headers().location).toBeUndefined()
      expect(response.headers()['content-type']).not.toContain('text/html')
      expect(Number(response.headers()['content-length'])).toBe(
        statSync(join(mediaDirectory, file)).size,
      )
    })
  }
})
