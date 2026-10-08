import { expect, test } from '@playwright/test'

const transfer = '/docs/routes#transfer-from-a-connected-wallet'
const deposits = '/docs/routes#accept-deposits-from-external-wallets'

test('desktop sidebar keeps the containing section active through nested steps in both directions', async ({
  page,
}) => {
  await page.goto('/docs/routes')
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  const active = sidebar.locator('a[data-active]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', '/docs/routes')

  // Jumping over the section heading is the regression: a nested H3 used to
  // steal the active anchor and incorrectly reactivate the page's Overview.
  for (const [heading, expected] of [
    ['transfer-from-a-connected-wallet', transfer],
    ['track-destination-delivery', transfer],
    ['accept-deposits-from-external-wallets', deposits],
    ['track-each-deposit', deposits],
    ['sign-and-submit-the-source-calls', transfer],
  ]) {
    await page
      .locator(`[id="${heading}"]`)
      .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', expected)
    await expect(active).toHaveAttribute('aria-current', 'location')
    // Scrolling updates the highlight without rewriting browser history.
    await expect(page).toHaveURL(/\/docs\/routes\/?$/)
  }

  await page
    .locator('article[data-v-content] h1')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(active).toHaveAttribute('href', '/docs/routes')
  await expect(active).toHaveAttribute('aria-current', 'page')

  await sidebar.locator(`a[href="${deposits}"]`).click()
  await expect(page).toHaveURL(new RegExp(`${deposits}$`))
  await expect(active).toHaveAttribute('href', deposits)
  await sidebar.locator(`a[href="${transfer}"]`).click()
  await expect(page).toHaveURL(new RegExp(`${transfer}$`))
  await expect(active).toHaveAttribute('href', transfer)
  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`${deposits}$`))
  await expect(active).toHaveAttribute('href', deposits)

  await page
    .getByRole('navigation', { name: 'Documentation sections', exact: true })
    .getByRole('link', { name: 'Accounts', exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/accounts\/?$/)
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', '/docs/accounts')
})

test('a direct nested-heading URL selects its parent section', async ({ page }) => {
  await page.goto('/docs/routes#track-destination-delivery')
  const active = page.locator('[data-v-gutter-left] nav[data-v-sidebar] a[data-active]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', transfer)
  await page.reload()
  await expect(active).toHaveAttribute('href', transfer)
})

test('a hash belonging to another page does not steal the current guide highlight', async ({
  page,
}) => {
  const guide = '/docs/guide/stablecoin-dex'
  // This fragment is a sidebar destination on Routes, but not on this guide.
  // A stale or manually edited fragment must not deactivate the guide itself.
  await page.goto(`${guide}#transfer-from-a-connected-wallet`)
  const active = page.locator('[data-v-gutter-left] nav[data-v-sidebar] a[data-active]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', guide)
  await expect(active).toHaveAttribute('aria-current', 'page')
  await page
    .locator('article[data-v-content] h2')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', guide)
})

test('mobile drawer shares the scrolled section and follows anchor navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/routes#track-destination-delivery')
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveCount(1)
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('href', transfer)
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('aria-current', 'location')
  await drawer.locator(`a[href="${deposits}"]`).click()
  await expect(drawer).toBeHidden()
  await expect(page).toHaveURL(new RegExp(`${deposits}$`))
  await page
    .locator('[id="track-each-deposit"]')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  // The drawer locks page scrolling; open it after the requested reading
  // position is reached, rather than interrupting an in-flight anchor scroll.
  await expect
    .poll(async () =>
      page
        .locator('[id="track-each-deposit"]')
        .evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeLessThan(260)
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveCount(1)
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('href', deposits)
  await page.keyboard.press('Escape')
  await page
    .locator('article[data-v-content] h1')
    .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }))
  await trigger.click()
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('href', '/docs/routes')
  await expect(drawer.locator('a[aria-current]')).toHaveAttribute('aria-current', 'page')
})

test('OpenAPI endpoints retain their own active state after client navigation from a product guide', async ({
  page,
}) => {
  await page.goto('/docs/routes#track-destination-delivery')
  const sidebar = page.locator('[data-v-gutter-left] nav[data-v-sidebar]')
  await sidebar.getByRole('link', { name: 'Transfer API', exact: true }).click()
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
