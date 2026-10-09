import { expect, test } from '@playwright/test'

test.setTimeout(45_000)

// Exercise every top-level site surface and both authored and generated docs.
const routes = [
  '/',
  '/get-started',
  '/docs/accounts',
  '/docs/earn',
  '/docs/routes',
  '/docs/zones',
  '/docs/agents',
  '/docs/development',
  '/docs/tools',
  '/docs/partners',
  '/docs/api',
  '/docs/guide/issuance/create-a-stablecoin',
  '/blog',
  '/blog/introducing-mercator',
]

for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`${width}px ${theme}`, () => {
      test.use({ viewport: { width, height: 1000 }, colorScheme: theme })
      test.beforeEach(async ({ page }) => {
        await page.addInitScript((theme) => localStorage.setItem('vocs-theme', theme), theme)
      })
      for (const route of routes) {
        test(`delivers compiled styles at ${route}`, async ({ page }) => {
          const missingAssets: string[] = []
          page.on('response', (response) => {
            if (
              response.status() >= 400 &&
              ['script', 'stylesheet'].includes(response.request().resourceType()) &&
              new URL(response.url()).origin === new URL(page.url()).origin
            )
              missingAssets.push(response.url())
          })
          const response = await page.goto(route, { waitUntil: 'networkidle' })
          expect(response?.status()).toBe(200)
          expect(missingAssets).toEqual([])
          await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 })
          await page.evaluate(() => document.fonts.ready)
          await expect
            .poll(() =>
              page.locator('body').evaluate((body) => {
                const style = getComputedStyle(body)
                return { font: style.fontFamily.includes('Pilat'), margin: style.margin }
              }),
            )
            .toEqual({ font: true, margin: '0px' })

          // These declarations exist only in the compiled Zyzz stylesheet.
          await expect
            .poll(() =>
              page.evaluate(() =>
                getComputedStyle(document.documentElement)
                  .getPropertyValue('--tempo-docs-primary-nav-height')
                  .trim(),
              ),
            )
            .toBe('65px')
          await expect(page.locator('.docs-site-header')).toHaveCSS('position', 'fixed')
          await expect(page.locator('html')).toHaveCSS('color-scheme', theme)
          await expect
            .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
            .toBeLessThanOrEqual(width + 1)
        })
      }
    })
  }
}

test('compiled homepage layout responds without losing its brand typography', async ({ page }) => {
  await page.goto('/')
  const start = page.locator('.tempo-docs-home-start')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(start).toHaveCSS('display', 'grid')
  await expect(page.locator('[data-v-gutter-right]')).toBeHidden()
  await expect
    .poll(() =>
      page
        .locator('.tempo-docs-home h1')
        .evaluate((heading) => heading.getBoundingClientRect().top),
    )
    .toBeGreaterThanOrEqual(109)
  const desktopColumns = await start.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns,
  )
  expect(desktopColumns.split(' ')).toHaveLength(2)
  await page.setViewportSize({ width: 390, height: 1000 })
  await expect
    .poll(() =>
      start.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
    )
    .toBe(1)
  await expect(page.locator('.tempo-docs-home h1')).toHaveCSS('font-weight', '500')
})

test('component recipes preserve badges and keyboard-accessible docs buttons', async ({ page }) => {
  await page.goto('/docs/protocol/tip20/spec')
  const badge = page.locator('.docs-specification-meta span').first()
  // Inline flex is blockified inside the specification's flex link.
  await expect(badge).toHaveCSS('display', 'flex')
  await expect(badge).toHaveCSS('border-radius', '6px')

  await page.goto('/docs/guide/using-tempo-with-ai')
  await page.getByRole('tab', { name: 'Cursor', exact: true }).click()
  const install = page.getByRole('link', { name: 'Install in Cursor', exact: true })
  await expect(install).toHaveCSS('min-height', '40px')
  // The page layout recipe must override the button's default margin.
  await expect(install).toHaveCSS('margin-top', '0px')
  await page.keyboard.press('Tab')
  await install.focus()
  await expect(install).toBeFocused()
  await expect(install).toHaveCSS('outline-width', '2px')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(install).toHaveCSS('transition-duration', '0s')
})

test('scoped partner artwork resolves in both color schemes', async ({ page, request }) => {
  await page.goto('/docs/partners/wallets')
  const logo = page.locator('.partner-logo--dfns')
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.vocsTheme = theme
      document.documentElement.style.colorScheme = theme
    }, theme)
    const background = await logo.evaluate((element) => getComputedStyle(element).backgroundImage)
    expect(background).toContain(theme === 'dark' ? 'dfns-dark.svg' : 'dfns.svg')
    const url = background.match(/url\(["']?(.*?)["']?\)/)?.[1]
    expect(url).toBeTruthy()
    expect((await request.get(url ?? '')).ok()).toBeTruthy()
    await expect(logo).not.toHaveCSS('width', '0px')
  }
})

test('dynamic benchmark bars bind compiled CSS variables', async ({ page }) => {
  await page.goto('/docs/protocol/upgrades/t7')
  const section = page
    .getByRole('heading', { name: 'Base fee', exact: true })
    .locator('..')
    .locator('..')
  const tracks = section.locator('[aria-hidden="true"]')
  await expect(tracks).toHaveCount(3)
  const ratios = await tracks.evaluateAll((elements) =>
    elements.map((element) => {
      const fill = element.firstElementChild
      if (!fill) throw new Error('Benchmark track is missing its fill')
      return fill.getBoundingClientRect().width / element.getBoundingClientRect().width
    }),
  )
  expect(ratios[0]).toBeCloseTo(1, 2)
  expect(ratios[1]).toBeCloseTo(0.6, 2)
  expect(ratios[2]).toBeCloseTo(0.03, 2)
})

test('client navigation loads page-owned styles', async ({ page }) => {
  await page.goto('/docs/partners')
  await page.locator('main a[href="/docs/partners/wallets"]').first().click()
  await expect(page).toHaveURL(/\/docs\/partners\/wallets\/?$/)
  await expect(page.locator('.partner-logo--dfns')).not.toHaveCSS('background-image', 'none')
})

test('theme selection uses native checked state for both keyboard input and styling', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const group = page.getByRole('radiogroup', { name: 'Theme selection' }).first()
  const light = group.getByRole('radio', { name: 'Light theme', exact: true })
  const dark = group.getByRole('radio', { name: 'Dark theme', exact: true })
  await light.check()
  await expect(light).toBeChecked()
  await light.focus()
  await page.keyboard.press('ArrowRight')
  await expect(dark).toBeChecked()
  await expect(light).not.toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'dark')
  await expect
    .poll(() =>
      dark.evaluate((input) => getComputedStyle(input.closest('label') ?? input).backgroundColor),
    )
    .not.toBe('rgba(0, 0, 0, 0)')
  await expect
    .poll(() =>
      light.evaluate((input) => getComputedStyle(input.closest('label') ?? input).backgroundColor),
    )
    .toBe('rgba(0, 0, 0, 0)')
})
