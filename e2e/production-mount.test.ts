import { expect, test } from '@playwright/test'
import { productionDocsUrl, proxyProductionMount } from './production-mount'

// Build with VERCEL=1 VERCEL_ENV=production, then start the production adapter:
// PORT=5175 VERCEL_ENV=production node scripts/serve-production-audit.mjs
// TEMPO_E2E_PRODUCTION_ORIGIN=http://127.0.0.1:5175 pnpm exec playwright test --config playwright.production.config.ts
// Ordinary local/CI builds do not use the production /developers mount.
const upstream = process.env.TEMPO_E2E_PRODUCTION_ORIGIN ?? ''
test.skip(!upstream, 'Requires a production build and server mounted behind /developers.')

test('production navigation preserves the mount through history and page tools', async ({
  context,
}) => {
  const audit = await proxyProductionMount(context, upstream)
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`${productionDocsUrl}/get-started/stablecoins`)
  const sections = page.getByRole('navigation', { name: 'Documentation sections', exact: true })
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  await expect(sections.locator('[aria-current]')).toHaveText('Get Started')
  await sections.getByRole('link', { name: 'Accounts', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/docs/accounts`)
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
  await expect(page.locator('.docs-section-nav a[aria-current]')).toHaveText('Accounts')
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
  await drawer.getByRole('link', { name: 'Stablecoins on Tempo', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/get-started/stablecoins`)
  await expect(drawer).toBeHidden()
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute(
    'href',
    '/developers/get-started/stablecoins',
  )
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(audit.errors).toEqual([])
  expect(audit.failedRequests).toEqual([])
})
