import { expect, test } from '@playwright/test'

const route = '/docs/partners/payment-routes'

test('serves provider research without JavaScript and separates API support', async ({
  page,
  request,
}) => {
  const response = await request.get(route)
  expect(response.status()).toBe(200)
  const html = (await response.text()).replaceAll(/<!--.*?-->/g, '')
  expect(html).toContain('<table')
  expect(html.includes('Reviewed October 6, 2026')).toBe(true)
  expect(html).toContain('Provider documentation snapshots')

  await page.goto(route, { waitUntil: 'networkidle' })
  await expect(page.getByRole('status').filter({ hasText: 'provider entries' })).toHaveText(
    '582 provider entries',
  )
  await expect(page.getByRole('combobox', { name: 'Catalog', exact: true })).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Supported routes', exact: true }).first(),
  ).toHaveAttribute('href', '/docs/routes/networks')
  await page.getByRole('combobox', { name: 'Provider', exact: true }).selectOption('Bridge')
  await page
    .getByRole('combobox', { name: 'Source rail or chain', exact: true })
    .selectOption('ACH')
  await page.getByRole('combobox', { name: 'Source currency', exact: true }).selectOption('USD')
  await expect(page.getByRole('status').filter({ hasText: 'provider entries' })).toHaveText(
    '5 provider entries',
  )
  await expect(page.locator('tbody tr')).toHaveCount(5)
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'provider entries' })).toHaveText(
    '582 provider entries',
  )
  await expect(page.locator('tbody tr')).toHaveCount(100)
  await page.getByRole('button', { name: 'Show more' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(200)
})

test('supports empty filters and preserves the old explorer URL', async ({ page, request }) => {
  const response = await request.get('/docs/ecosystem/payment-routes', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers().location).toContain('/docs/partners/payment-routes')
  await page.goto(route, { waitUntil: 'networkidle' })
  await page.getByRole('combobox', { name: 'Provider', exact: true }).selectOption('Kraken')
  await page.getByRole('combobox', { name: 'Source currency', exact: true }).selectOption('BRL')
  await expect(page.getByRole('status').filter({ hasText: 'provider entries' })).toHaveText(
    '0 provider entries',
  )
  await expect(
    page.getByText('No provider entries match these filters. Reset to try another pair.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'provider entries' })).toHaveText(
    '582 provider entries',
  )
})

test('keeps provider research and corridor planning usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(route, { waitUntil: 'networkidle' })
  await expect(page.getByRole('combobox', { name: 'Provider', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.goto('/docs/partners/payment-corridors', { waitUntil: 'networkidle' })
  await expect(
    page.getByRole('heading', { name: 'Plan a payment corridor', level: 1 }),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
