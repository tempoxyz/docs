import { expect, test } from '@playwright/test'
import { productionDocsUrl, proxyProductionMount } from './production-mount'

// Build with VERCEL=1 VERCEL_ENV=production, then start the production adapter:
// PORT=5175 VERCEL_ENV=production node scripts/serve-production-audit.mjs
// TEMPO_E2E_PRODUCTION_ORIGIN=http://127.0.0.1:5175 pnpm exec playwright test --config playwright.production.config.ts
// Ordinary local/CI builds do not use the production /developers mount.
const upstream = process.env.TEMPO_E2E_PRODUCTION_ORIGIN ?? ''
test.skip(!upstream, 'Requires a production build and server mounted behind /developers.')

for (const javaScriptEnabled of [false, true]) {
  test(`homepage links preserve the production mount with JavaScript ${javaScriptEnabled}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled })
    const audit = await proxyProductionMount(context, upstream)
    const page = await context.newPage()
    for (const [name, path, title] of [
      ['Find your starting point', '/get-started', 'Build on Tempo'],
      ['Send your first payment', '/get-started/quickstart', 'Quickstart'],
      ['Stablecoins on Tempo', '/get-started/stablecoins', 'Stablecoins on Tempo'],
    ]) {
      await page.goto(`${productionDocsUrl}/`)
      const escapedLinks = await page.locator('.tempo-docs-home a[href]').evaluateAll((links) =>
        links
          .map((link) => new URL(link.getAttribute('href') ?? '', location.href))
          .filter(
            (url) => url.origin === location.origin && !url.pathname.startsWith('/developers'),
          )
          .map((url) => url.href),
      )
      expect(escapedLinks).toEqual([])
      const navigationResponse = javaScriptEnabled
        ? undefined
        : page.waitForResponse(
            (response) =>
              response.request().isNavigationRequest() &&
              response.url() === `${productionDocsUrl}${path}`,
          )
      await page.getByRole('link', { name, exact: false }).click()
      await expect(page).toHaveURL(`${productionDocsUrl}${path}`)
      if (navigationResponse) expect((await navigationResponse).status()).toBe(200)
      // The interactive quickstart renders its provider content after hydration.
      if (javaScriptEnabled || path !== '/get-started/quickstart')
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    }
    expect(audit.errors).toEqual([])
    expect(audit.failedRequests).toEqual([])
    await context.close()
  })
}

test('production navigation preserves the mount through history and page tools', async ({
  context,
}) => {
  const audit = await proxyProductionMount(context, upstream)
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`${productionDocsUrl}/get-started/quickstart`)
  const sections = page.getByRole('navigation', { name: 'Documentation sections', exact: true })
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  await expect(sections.locator('[aria-current]')).toHaveText('Get Started')
  await sections.getByRole('link', { name: 'Accounts', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/docs/accounts`)
  await sidebar.getByRole('button', { name: 'Account setup', exact: true }).click()
  await sidebar.locator('a[href$="/docs/accounts/create"]').click()
  await expect(page).toHaveURL(`${productionDocsUrl}/docs/accounts/create`)
  await expect(sidebar.locator('a[data-active]')).toHaveAttribute(
    'href',
    '/developers/docs/accounts/create',
  )
  await page.goBack()
  await expect(page).toHaveURL(`${productionDocsUrl}/docs/accounts`)
  await expect(sidebar.locator('a[data-active]')).toHaveAttribute(
    'href',
    '/developers/docs/accounts',
  )
  await page.goForward()
  await expect(page).toHaveURL(`${productionDocsUrl}/docs/accounts/create`)
  await expect(sidebar.locator('a[data-active]')).toHaveAttribute(
    'href',
    '/developers/docs/accounts/create',
  )
  const tools = page.getByRole('navigation', { name: 'Page tools' })
  await expect(tools).toHaveCount(1)
  await expect(tools.getByRole('link', { name: 'View Markdown' })).toHaveAttribute(
    'href',
    '/developers/assets/md/docs/accounts/create.md',
  )
  expect(audit.errors).toEqual([])
  expect(audit.failedRequests).toEqual([])
})

test('production blog search opens a new account guide with its interactive demo', async ({
  context,
}) => {
  const audit = await proxyProductionMount(context, upstream)
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`${productionDocsUrl}/blog`)
  await page.getByRole('button', { name: 'Search documentation', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search documentation', exact: true })
  await dialog.getByRole('combobox').fill('admin keys')
  const result = dialog.locator(
    'a[href="/developers/docs/accounts/admin-keys#authorize-an-admin-key"]',
  )
  await expect(result).toBeVisible()
  await result.click()
  await expect(page).toHaveURL(
    `${productionDocsUrl}/docs/accounts/admin-keys#authorize-an-admin-key`,
  )
  await expect(dialog).toBeHidden()
  await expect(page.locator('.docs-section-nav a[aria-current]')).toHaveText('Tempo EVM')
  await expect(page.getByTestId('admin-key-demo')).toBeVisible()
  await expect(
    page.getByTestId('admin-key-demo').getByRole('button', { name: 'Create test account' }),
  ).toBeEnabled()
  expect(audit.errors).toEqual([])
  expect(audit.failedRequests).toEqual([])
})

test('production mobile menus keep the docs mount and current sidebar selection', async ({
  context,
}) => {
  const audit = await proxyProductionMount(context, upstream)
  const page = await context.newPage()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${productionDocsUrl}/blog/privacy-with-tempo-zones`)
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await menu.getByRole('link', { name: 'Get Started', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/get-started`)
  await expect(menu).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  await trigger.click()
  await drawer.getByRole('link', { name: 'Quickstart', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/get-started/quickstart`)
  await expect(drawer).toBeHidden()
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute(
    'href',
    '/developers/get-started/quickstart',
  )
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(audit.errors).toEqual([])
  expect(audit.failedRequests).toEqual([])
})
