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
  const products = page
    .locator('header.docs-site-header')
    .getByRole('navigation', { name: 'Products', exact: true })
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  await expect(products.locator('[aria-current]')).toHaveText('Get started')
  await expect(products.getByRole('link', { name: 'Get started', exact: true })).toHaveAttribute(
    'href',
    '/developers/get-started',
  )
  // Wait for the header to hydrate (search enables) so the product link is a client navigation.
  await expect(
    page.getByRole('button', { name: 'Search documentation', exact: true }),
  ).toBeEnabled()
  await products.getByRole('link', { name: 'Accounts', exact: true }).click()
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
    page
      .getByRole('menu', { name: 'More page options', exact: true })
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
  await expect(
    page
      .locator('header.docs-site-header')
      .getByRole('navigation', { name: 'Products', exact: true })
      .locator('a[aria-current]'),
  ).toHaveText('Accounts')
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
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true })
  // The menu drawer lists the products above the current section's pages.
  const menu = page.getByRole('dialog', { name: 'Tempo Developers menu', exact: true })
  const products = menu.getByRole('navigation', { name: 'Products', exact: true })
  const pages = menu.getByRole('navigation', { name: 'Get started pages', exact: true })
  await trigger.click()
  await products.getByRole('link', { name: 'Get started', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/get-started`)
  await expect(menu).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await trigger.click()
  await pages.getByRole('link', { name: 'Quickstart', exact: true }).click()
  await expect(page).toHaveURL(`${productionDocsUrl}/get-started/quickstart`)
  await expect(menu).toBeHidden()
  await expect(
    page
      .locator('.docs-page-header')
      .getByRole('navigation', { name: 'Breadcrumb', exact: true })
      .getByRole('listitem'),
  ).toHaveText(['Get started', 'Quickstart'])
  await trigger.click()
  await expect(products.locator('a[aria-current="page"]')).toHaveAttribute(
    'href',
    '/developers/get-started',
  )
  await expect(pages.locator('a[aria-current]')).toHaveAttribute(
    'href',
    '/developers/get-started/quickstart',
  )
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(audit.errors).toEqual([])
  expect(audit.failedRequests).toEqual([])
})
