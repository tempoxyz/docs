import { expect, test } from '@playwright/test'

const transfer = '/docs/routes/transfers'
const deposits = '/docs/routes/deposits'

test('desktop sidebar keeps the current task active through nested steps and client navigation', async ({
  page,
}) => {
  await page.goto(transfer)
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  const active = sidebar.locator('a[data-active]')

  // Nested headings describe steps within the task. Scrolling through them must
  // not switch the sidebar selection back to the product overview.
  for (const heading of [
    'quote-the-transfer',
    'track-destination-delivery',
    'sign-and-submit-the-source-calls',
  ]) {
    await page
      .locator(`[id="${heading}"]`)
      .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', transfer)
    await expect(active).toHaveAttribute('aria-current', 'page')
    await expect(page).toHaveURL(new RegExp(`${transfer}/?$`))
  }

  await sidebar.locator(`a[href="${deposits}"]`).click()
  await expect(page).toHaveURL(new RegExp(`${deposits}/?$`))
  await page
    .locator('[id="track-each-deposit"]')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', deposits)
  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`${transfer}/?$`))
  await expect(active).toHaveAttribute('href', transfer)
  await sidebar.locator('a[href="/docs/routes"]').click()
  await expect(active).toHaveAttribute('href', '/docs/routes')

  await page
    .getByRole('navigation', { name: 'Documentation sections', exact: true })
    .getByRole('link', { name: 'Accounts', exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/accounts\/?$/)
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', '/docs/accounts')
})

test('direct nested headings and legacy overview anchors retain the current page selection', async ({
  page,
}) => {
  const active = page.locator('[data-v-gutter-left] nav[data-v-sidebar] a[data-active]')
  for (const [path, expected] of [
    [`${transfer}#track-destination-delivery`, transfer],
    ['/docs/routes#transfer-from-a-connected-wallet', '/docs/routes'],
    ['/docs/routes#accept-deposits-from-external-wallets', '/docs/routes'],
  ]) {
    await page.goto(path)
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', expected)
    await expect(active).toHaveAttribute('aria-current', 'page')
    await page.reload()
    await expect(active).toHaveAttribute('href', expected)
  }
})

test('a hash belonging to another page does not steal the current guide highlight', async ({
  page,
}) => {
  // A fragment from another task must never deactivate Receive payments.
  const guide = '/docs/guide/payments/accept-a-payment'
  await page.goto(`${guide}#batch-payment-transactions`)
  const active = page.locator('[data-v-gutter-left] nav[data-v-sidebar] a[data-active]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', guide)
  await expect(active).toHaveAttribute('aria-current', 'page')
  await page
    .locator('article[data-v-content] h2')
    .first()
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', guide)
})

test('payment sections keep the current task selected while scrolling', async ({ page }) => {
  const guide = '/docs/guide/payments/send-a-payment'
  const batch = `${guide}#batch-payment-transactions`
  await page.goto(batch)
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  const active = sidebar.locator('a[data-active]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', guide)
  await expect(active).toHaveAttribute('aria-current', 'page')
  await page.locator('[id="batch-payment-transactions"]').evaluate((element) => {
    element.nextElementSibling?.scrollIntoView({ behavior: 'instant' })
  })
  await expect(active).toHaveAttribute('href', guide)
  await page
    .locator('[id="send-payment-implementation-steps"]')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', guide)
  await expect(active).toHaveAttribute('aria-current', 'page')
})

test('mobile drawer retains the current task after scrolling and follows task navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${transfer}#track-destination-delivery`)
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveCount(1)
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('href', transfer)
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('aria-current', 'page')
  await drawer.locator(`a[href="${deposits}"]`).click()
  await expect(drawer).toBeHidden()
  await expect(page).toHaveURL(new RegExp(`${deposits}/?$`))
  await page
    .locator('[id="track-each-deposit"]')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveCount(1)
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('href', deposits)
  await drawer.locator('a[href="/docs/routes"]').click()
  await expect(drawer).toBeHidden()
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('href', '/docs/routes')
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('aria-current', 'page')
})

test('OpenAPI endpoints retain their own active state after client navigation from a task', async ({
  page,
}) => {
  await page.goto(transfer)
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  await page
    .locator('article[data-v-content]')
    .getByRole('link', { name: 'EVM or Tron action format', exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/api\/routes\/transfers\/?$/)
  const operations = sidebar.locator('a[href^="/docs/api/routes/transfers#"]')
  await expect(operations.first()).toBeVisible()
  for (const index of [0, 1, 0]) {
    const operation = operations.nth(index)
    const href = await operation.getAttribute('href')
    if (!href) throw new Error('Endpoint has no link')
    await operation.click()
    await expect(sidebar.locator('a[data-active]')).toHaveCount(1)
    await expect(sidebar.locator('a[data-active]')).toHaveAttribute('href', href)
  }
  await page
    .getByRole('navigation', { name: 'Documentation sections', exact: true })
    .getByRole('link', { name: 'Routes', exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/routes\/?$/)
  await expect(sidebar.locator('a[data-active]')).toHaveCount(1)
  await expect(sidebar.locator('a[data-active]')).toHaveAttribute('href', '/docs/routes')
})
