import { expect, test } from '@playwright/test'

const route = '/docs/ecosystem/payment-routes'

test('serves API coverage without JavaScript and filters a mainnet pair', async ({
  page,
  request,
}) => {
  const response = await request.get(route)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('<table')
  expect(html.match(/<tr(?:\s|>)/g)).toHaveLength(23)
  expect(html).toContain('OUSD')
  expect(html).toContain('Deposit address, Transfer')

  await page.goto(route)
  await expect(page.getByRole('combobox', { name: 'Catalog', exact: true })).toHaveValue('api')
  await expect(page.getByRole('status')).toHaveText('22 routes')
  await expect(page.getByRole('columnheader', { name: 'Provider', exact: true })).toHaveCount(0)
  await page.getByRole('combobox', { name: 'Source chain', exact: true }).selectOption('Base')
  await page.getByRole('combobox', { name: 'Source asset', exact: true }).selectOption('USDC')
  await page
    .getByRole('combobox', { name: 'Destination asset', exact: true })
    .selectOption('USDC.e')
  await page.getByRole('combobox', { name: 'Method', exact: true }).selectOption('Transfer')
  await expect(page.getByRole('status')).toHaveText('1 route')
  await expect(
    page.getByRole('cell', { name: 'Deposit address, Transfer', exact: true }),
  ).toHaveCount(1)
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(page.getByRole('status')).toHaveText('22 routes')
  await page.getByRole('checkbox', { name: 'Include testnet routes' }).check()
  await expect(page.getByRole('status')).toHaveText('24 routes')
  await expect(page.getByRole('cell', { name: 'alphaUSD', exact: true })).toHaveCount(2)
})

test('keeps provider coverage separate and resets filters when switching catalogs', async ({
  page,
}) => {
  await page.goto(route)
  await page.getByRole('combobox', { name: 'Source chain', exact: true }).selectOption('Base')
  await page.getByRole('combobox', { name: 'Catalog', exact: true }).selectOption('providers')
  await expect(page.getByRole('columnheader', { name: 'Provider', exact: true })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('582 routes')
  await expect(
    page.getByText('These providers offer their own products and onboarding.', { exact: false }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Show more' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(200)
  await page.getByRole('combobox', { name: 'Provider', exact: true }).selectOption('Bridge')
  await page
    .getByRole('combobox', { name: 'Source rail or chain', exact: true })
    .selectOption('ACH')
  await expect(page.getByRole('status')).toHaveText('5 routes')
  await page.getByRole('combobox', { name: 'Catalog', exact: true }).selectOption('api')
  await expect(page.getByRole('status')).toHaveText('22 routes')
})

test('keeps the mobile document within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(route)
  await expect(page.getByRole('combobox', { name: 'Catalog', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByRole('combobox', { name: 'Catalog', exact: true }).selectOption('providers')
  await expect(page.getByRole('combobox', { name: 'Provider', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
