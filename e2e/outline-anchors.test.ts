import { expect, test } from '@playwright/test'

test('outline links align headings below the sticky header, including repeated clicks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/docs/resources/guides/embedded-wallets')
  const outline = page.locator('[data-v-outline]:not([data-v-outline-mobile])')

  for (const name of [
    'Privy: customer wallets and payments',
    'Turnkey: policy-controlled signing',
    'Fireblocks: vaults and transaction approvals',
  ]) {
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
