import { readdirSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicOutputRoot = join(repositoryRoot, 'dist/public')

// The production build is the route source of truth, including generated OpenAPI pages.
// Keep local dev runs light; CI builds the artifact before Playwright starts.
const publicRoutes = process.env.CI ? discoverPublicRoutes(publicOutputRoot) : []

test.skip(!process.env.CI, 'requires the production build output')

for (const route of publicRoutes) {
  test(`single title and H1 for ${route}`, async ({ page, request }) => {
    const response = await request.get(route)
    expect(response.status(), `${route} should be served`).toBe(200)

    const html = await response.text()
    const rawHead = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]
    expect(rawHead, `${route} should have a prerendered head`).toBeDefined()
    expect(
      rawHead?.match(/<title(?:\s[^>]*)?>[\s\S]*?<\/title>/gi) ?? [],
      `${route} should have one prerendered document title`,
    ).toHaveLength(1)

    await page.goto(route, { waitUntil: 'networkidle' })

    // Scope document titles to the head. SVG <title> nodes in the body provide
    // accessible names and are valid, unrelated markup.
    await expect(page.locator('head > title'), `${route} document title`).toHaveCount(1)
    await expect(page.locator('h1'), `${route} primary heading`).toHaveCount(1)
    await expect(
      page.locator('head > meta[name="description"]'),
      `${route} description`,
    ).toHaveCount(1)
    await expect(
      page.locator('head > meta[property="og:title"]'),
      `${route} Open Graph title`,
    ).toHaveCount(1)
    // E2E builds intentionally omit baseUrl, so canonical may be absent. It must never duplicate.
    expect(
      await page.locator('head > link[rel="canonical"]').count(),
      `${route} canonical URL`,
    ).toBeLessThanOrEqual(1)
  })
}

test('keeps one route title through docs and OpenAPI client navigation', async ({ page }) => {
  await page.goto('/docs/quickstart/integrate-tempo', { waitUntil: 'networkidle' })
  await expectSingleTitle(page, 'How to Integrate Tempo | Tempo Docs')

  await page.locator('a[href="/docs/api"]:visible').first().click()
  await page.waitForURL(/\/docs\/api\/?$/)
  await expectSingleTitle(page, 'Start with the Tempo API | Tempo Docs')

  await page.locator('a[href="/docs/api/transactions"]:visible').first().click()
  await page.waitForURL(/\/docs\/api\/transactions\/?$/)
  await expectSingleTitle(page, 'Tempo Transactions API Reference | Docs')

  await page.locator('a[href="/docs/api/transfers"]:visible').first().click()
  await page.waitForURL(/\/docs\/api\/transfers\/?$/)
  await expectSingleTitle(page, 'Stablecoin Transfers API | Tempo Docs')
})

test('gives missing pages one noindex title and one H1', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist', { waitUntil: 'networkidle' })
  expect(response?.status()).toBe(404)
  await expectSingleTitle(page, 'Page not found ⋅ Tempo Docs')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
})

async function expectSingleTitle(page: import('@playwright/test').Page, expectedTitle: string) {
  await expect(page.locator('head > title')).toHaveCount(1)
  await expect(page).toHaveTitle(expectedTitle)
}

function discoverPublicRoutes(directory: string): string[] {
  return findIndexFiles(directory)
    .map((file) => relative(directory, dirname(file)))
    .filter((route) => !route.split(sep).some((segment) => segment.endsWith('.d')))
    .map((route) => (route ? `/${route.split(sep).join('/')}` : '/'))
    .sort((a, b) => a.localeCompare(b))
}

function findIndexFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) return findIndexFiles(entryPath)
    return entry.isFile() && entry.name === 'index.html' ? [entryPath] : []
  })
}
