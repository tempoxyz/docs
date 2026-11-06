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
  test(`opens the external engineering blog from docs navigation at ${width}px`, async ({
    page,
  }) => {
    // Fulfill the destination locally: exercise real anchor navigation without
    // making CI depend on the website's release state or network availability.
    await page.route('https://tempo.xyz/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<h1>Blog destination</h1>' }),
    )
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    const navigation =
      width < 1080
        ? page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
        : page.locator('.docs-section-utilities')
    if (width < 1080) await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    const blog = navigation.getByRole('link', { name: 'Blog', exact: true })
    await expect(blog).toHaveAttribute('href', engineeringBlogUrl)
    await blog.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(engineeringBlogUrl)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog destination')
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
