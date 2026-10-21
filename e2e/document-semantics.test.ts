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

// This sweep checks rendered document metadata, not chain state. Keep background
// demo queries from competing with the dedicated live-transaction tests.
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(rpc|sponsor)\.(moderato\.)?tempo\.xyz(?:\/|$)/, (route) =>
    route.abort(),
  )
  await page.routeWebSocket(/^wss?:\/\/rpc\.(moderato\.)?tempo\.xyz(?:\/|$)/, (socket) =>
    socket.close(),
  )
})

// Every route's prerendered document is checked in one request sweep. Full
// browser loads, which also catch tags added during hydration, cover each
// section's landing page and its deepest page rather than all routes.
test('every prerendered route has one title, H1, description, and Open Graph title', async ({
  request,
}) => {
  const failures: string[] = []
  await forEachConcurrently(publicRoutes, 8, async (route) => {
    const response = await request.get(route)
    if (response.status() !== 200) return void failures.push(`${route}: ${response.status()}`)
    const html = await response.text()
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]
    if (head === undefined) return void failures.push(`${route}: no prerendered head`)
    // Scripts carry serialized markup; SVG <title> nodes name icons in the body.
    const body = html
      .slice(html.indexOf('</head>'))
      .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, '')
    const counts = {
      title: head.match(/<title(?:\s[^>]*)?>/gi)?.length ?? 0,
      h1: body.match(/<h1(?:\s[^>]*)?>/gi)?.length ?? 0,
      description: head.match(/<meta\b[^>]*\bname="description"/gi)?.length ?? 0,
      'og:title': head.match(/<meta\b[^>]*\bproperty="og:title"/gi)?.length ?? 0,
    }
    for (const [name, count] of Object.entries(counts))
      if (count !== 1) failures.push(`${route}: ${count} ${name}`)
    // E2E builds intentionally omit baseUrl, so canonical may be absent. It must never duplicate.
    const canonical = head.match(/<link\b[^>]*\brel="canonical"/gi)?.length ?? 0
    if (canonical > 1) failures.push(`${route}: ${canonical} canonical`)
  })
  expect(failures.sort()).toEqual([])
})

for (const route of sampleBySection(publicRoutes)) {
  test(`single title and H1 after hydrating ${route}`, async ({ page }) => {
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
    expect(
      await page.locator('head > link[rel="canonical"]').count(),
      `${route} canonical URL`,
    ).toBeLessThanOrEqual(1)
  })
}

test('keeps one route title through docs and OpenAPI client navigation', async ({ page }) => {
  await page.goto('/docs/quickstart/integrate-tempo', { waitUntil: 'networkidle' })
  await expectSingleTitle(page, 'Integrate Tempo with Apps, Wallets, and Services | Tempo Docs')

  await page
    .getByRole('navigation', { name: 'Documentation sections', exact: true })
    .getByRole('link', { name: 'Tempo EVM', exact: true })
    .click()
  await page.waitForURL(/\/docs\/development\/?$/)
  await expectSingleTitle(page, 'Tempo EVM | Tempo Docs')

  await page
    .locator('.docs-section-utilities')
    .getByRole('link', { name: 'API reference', exact: true })
    .click()
  await page.waitForURL(/\/docs\/api\/?$/)
  await expectSingleTitle(page, 'Tempo API reference | Tempo Docs')

  await page.locator('a[href="/docs/api/transactions"]:visible').first().click()
  await page.waitForURL(/\/docs\/api\/transactions\/?$/)
  await expectSingleTitle(page, 'Tempo Transactions API Reference | Docs')

  await page.locator('a[href="/docs/api/transfers"]:visible').first().click()
  await page.waitForURL(/\/docs\/api\/transfers\/?$/)
  await expectSingleTitle(page, 'Read Token Transfers with the Tempo API | Tempo Docs')
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

/** Each docs section's (or top-level area's) landing page and its deepest page. */
function sampleBySection(routes: readonly string[]): string[] {
  const sections = new Map<string, string[]>()
  for (const route of routes) {
    const segments = route.split('/').filter(Boolean)
    const key = segments[0] === 'docs' ? segments.slice(0, 2).join('/') : (segments[0] ?? '')
    sections.set(key, [...(sections.get(key) ?? []), route])
  }
  return [...sections.values()].flatMap((section) => {
    const byDepth = [...section].sort(
      (a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b),
    )
    return [...new Set([byDepth[0], byDepth.at(-1)])].filter((route) => route !== undefined)
  })
}

async function forEachConcurrently<T>(
  items: readonly T[],
  concurrency: number,
  run: (item: T) => Promise<void>,
) {
  let next = 0
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      for (let item = items[next++]; item !== undefined; item = items[next++]) await run(item)
    }),
  )
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
