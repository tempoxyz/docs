import { expect, test } from '@playwright/test'

test('outline links align headings below the sticky header, including repeated clicks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/docs/partners/wallets')
  const outline = page.locator('[data-v-outline]:not([data-v-outline-mobile])')

  for (const name of ['Privy', 'Turnkey', 'Self-Custodial']) {
    const link = outline.getByRole('link', { name, exact: true })
    await link.click()
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const heading = document.getElementById(decodeURIComponent(location.hash.slice(1)))
          if (!heading) return Infinity
          const padding =
            Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
          const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
          return Math.abs(heading.getBoundingClientRect().top - padding - margin)
        }),
      )
      .toBeLessThan(2)

    await page.evaluate(() => window.scrollBy(0, 600))
    await link.click()
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const heading = document.getElementById(decodeURIComponent(location.hash.slice(1)))
          if (!heading) return Infinity
          const padding =
            Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
          const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
          return Math.abs(heading.getBoundingClientRect().top - padding - margin)
        }),
      )
      .toBeLessThan(2)
  }
})

test('links to a heading on another page align it after client-side navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/docs/accounts')
  await page.locator('article a[href$="/create#create-a-configurable-account"]').first().click()
  await expect(page).toHaveURL(/\/docs\/accounts\/create#create-a-configurable-account$/)
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const heading = document.getElementById('create-a-configurable-account')
          if (!heading || window.scrollY === 0) return Infinity
          const padding =
            Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
          const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
          return Math.abs(heading.getBoundingClientRect().top - padding - margin)
        }),
      { timeout: 10_000 },
    )
    .toBeLessThan(2)
})
