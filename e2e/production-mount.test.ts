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
  await page.goto(`${productionDocsUrl}/get-started/quickstart`)
  const tabs = page
    .getByRole('navigation', { name: 'Developer navigation' })
    .getByRole('navigation', { name: 'Documentation areas', exact: true })
  const sections = page
    .locator('.docs-section-nav')
    .getByRole('navigation', { name: 'Docs sections', exact: true })
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  await expect(tabs.locator('[aria-current]')).toHaveText('Docs')
  await expect(tabs.getByRole('link', { name: 'Docs', exact: true })).toHaveAttribute(
    'href',
    '/developers/get-started',
  )
  await expect(sections.locator('[aria-current]')).toHaveText('Get started')
  // Wait for the header to hydrate (search enables) so the tab is a client navigation.
  await expect(
    page.getByRole('button', { name: 'Search documentation', exact: true }),
  ).toBeEnabled()
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
  // One Copy page split button; its menu links the page's Markdown inside the mount.
  const actions = page.locator('.docs-page-actions')
  await expect(actions).toHaveCount(1)
  await actions.getByRole('button', { name: 'More page options', exact: true }).click()
  await expect(
    actions
      .getByRole('menu', { name: 'Page options', exact: true })
      .getByRole('menuitem', { name: 'View as Markdown', exact: true }),
  ).toHaveAttribute('href', '/developers/assets/md/docs/accounts/create.md')
  expect(audit.errors).toEqual([])
  expect(audit.failedRequests).toEqual([])
})

test('production docs search opens the passkey guide with its interactive demo', async ({
  context,
}) => {
  const audit = await proxyProductionMount(context, upstream)
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`${productionDocsUrl}/`)
  await page.getByRole('button', { name: 'Search documentation', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search documentation', exact: true })
  await dialog.getByRole('combobox').fill('passkeys')
  const result = dialog.locator(
    'a[href="/developers/docs/accounts/authentication/passkeys#create-a-passkey"]',
  )
  await expect(result).toBeVisible()
  await result.click()
  await expect(page).toHaveURL(
    `${productionDocsUrl}/docs/accounts/authentication/passkeys#create-a-passkey`,
  )
  await expect(dialog).toBeHidden()
  await expect(page.locator('.docs-section-nav a[aria-current]')).toHaveText('Accounts')
  const demo = page.getByTestId('passkey-account-demo')
  await expect(demo).toBeVisible()
  await expect(
    demo.getByRole('button', { name: 'Create a passkey account', exact: true }),
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
  await page.goto(`${productionDocsUrl}/docs/accounts`)
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await menu.getByRole('link', { name: 'Get started', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/get-started`)
  await expect(menu).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  // The drawer is named after the current tab and lists its sections above the sidebar.
  const drawer = page.getByRole('dialog', { name: 'Docs', exact: true })
  await trigger.click()
  await drawer.getByRole('link', { name: 'Quickstart', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/get-started/quickstart`)
  await expect(drawer).toBeHidden()
  await expect(trigger).toHaveText(/^Get started\s*\/\s*Quickstart$/)
  await trigger.click()
  await expect(
    drawer
      .getByRole('navigation', { name: 'Docs sections', exact: true })
      .locator('a[aria-current="page"]'),
  ).toHaveAttribute('href', '/developers/get-started')
  await expect(
    drawer.locator('a[aria-current]:not(nav[aria-label$=" sections"] a)'),
  ).toHaveAttribute('href', '/developers/get-started/quickstart')
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(audit.errors).toEqual([])
  expect(audit.failedRequests).toEqual([])
})
