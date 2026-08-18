import { expect, test } from '@playwright/test'

test('renders the QA-approved homepage copy and footer targets', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Tempo Developers: Build on a Payments-First Blockchain')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Build payment applications on Tempo with stablecoin-native tokens, predictable fees, fast settlement, SDKs, APIs, and open-source developer tools.',
  )
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Build on the blockchain engineered for payments',
    }),
  ).toBeVisible()

  const footer = page.locator('footer')
  await expect(footer.getByRole('link', { name: 'MPP' })).toHaveAttribute(
    'href',
    'https://mpp.dev/',
  )
  const openSourceLink = footer.getByRole('link', { name: 'Open source' })
  await expect(openSourceLink).toHaveAttribute('href', '/#open-source')

  await openSourceLink.click()
  await expect(page).toHaveURL(/\/#open-source$/)
  await expect
    .poll(() =>
      page.locator('#open-source').evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeLessThan(250)
})

test('scrolls to the lazy Open source section on direct fragment navigation', async ({ page }) => {
  await page.goto('/#open-source')

  const target = page.locator('#open-source')
  await expect(target).toBeVisible()
  await expect
    .poll(() => target.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThan(250)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})
