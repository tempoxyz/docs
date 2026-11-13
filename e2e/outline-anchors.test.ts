import { expect, type Page, test } from '@playwright/test'

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

const headingOffset = (page: Page, id: string) =>
  page.evaluate((id) => {
    const heading = document.getElementById(id)
    if (!heading || window.scrollY === 0) return Infinity
    const padding =
      Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
    return Math.abs(heading.getBoundingClientRect().top - padding - margin)
  }, id)

// The router's own hash scroll misses this heading, which streams in after the route commit.
for (const { from, link, id } of [
  {
    from: '/docs/accounts',
    link: 'article a[href$="/create#create-a-configurable-account"]',
    id: 'create-a-configurable-account',
  },
]) {
  test(`links from ${from} align #${id} after client-side navigation`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(from)
    // Let React hydrate, so the click goes through the router, not a document load.
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => {
      ;(window as Window & { __clientNavigation?: boolean }).__clientNavigation = true
    })
    await page.locator(link).first().click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect.poll(() => headingOffset(page, id), { timeout: 10_000 }).toBeLessThan(2)
    // A full page load would pass through the browser's native hash scroll instead.
    expect(
      await page.evaluate(
        () => (window as Window & { __clientNavigation?: boolean }).__clientNavigation,
      ),
    ).toBe(true)
  })
}
