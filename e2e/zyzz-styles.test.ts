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
  const guides = page.locator('.tempo-docs-home-guide-grid')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(guides).toHaveCSS('display', 'grid')
  await expect(page.locator('[data-v-gutter-right]')).toBeHidden()
  await expect
    .poll(() =>
      page
        .locator('.tempo-docs-home h1')
        .evaluate((heading) => heading.getBoundingClientRect().top),
    )
    .toBeGreaterThanOrEqual(109)
  const desktopColumns = await guides.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns,
  )
  expect(desktopColumns.split(' ')).toHaveLength(3)
  await page.setViewportSize({ width: 390, height: 1000 })
  await expect
    .poll(() =>
      guides.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
    )
    .toBe(1)
  await expect(page.locator('.tempo-docs-home h1')).toHaveCSS('font-weight', '500')
})

test('component recipes preserve badges and keyboard-accessible docs buttons', async ({ page }) => {
  await page.goto('/docs/protocol/tip20/spec')
  const badge = page.locator('.docs-specification-meta span').first()
  // Inline flex is blockified inside the specification's flex link.
  await expect(badge).toHaveCSS('display', 'flex')
  await expect(badge).toHaveCSS('border-radius', '8px')

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

test('closed mobile navigation stays outside the viewport and restores focus on dismissal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/docs/guide/issuance/create-a-stablecoin')
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  // Include the closed dialog: an ARIA-hidden element can still cover the page visually.
  const panel = page.getByRole('dialog', {
    name: 'Documentation',
    exact: true,
    includeHidden: true,
  })
  const rightEdge = () => panel.evaluate((element) => element.getBoundingClientRect().right)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(rightEdge).toBeLessThanOrEqual(0)
  await trigger.click()
  await expect(panel).toBeInViewport()
  await expect(panel).toHaveAttribute('aria-modal', 'true')
  await page.keyboard.press('Escape')
  await expect.poll(rightEdge).toBeLessThanOrEqual(0)
  await expect(trigger).toBeFocused()
})

test('terminal controls share compiled hover and keyboard focus styling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/docs/guide/machine-payments')
  const restart = page.getByRole('button', { name: 'Restart demo', exact: true })
  await restart.scrollIntoViewIfNeeded()
  const idleColor = await restart.evaluate((element) => getComputedStyle(element).color)
  await restart.focus()
  await expect(restart).not.toHaveCSS('color', idleColor)
  const activeColor = await restart.evaluate((element) => getComputedStyle(element).color)
  await restart.evaluate((element) => element.blur())
  await expect(restart).toHaveCSS('color', idleColor)
  await restart.hover()
  await expect(restart).toHaveCSS('color', activeColor)
})

test('compiled diagram states support playback, skip, replay, and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/docs/guide/payments/virtual-addresses')
  const diagram = page.locator('.mermaid-diagram').first()
  const svg = diagram.locator('div > svg').first()
  await svg.scrollIntoViewIfNeeded()
  const firstLine = svg.locator('[data-step]').first()
  await expect(firstLine).toHaveCSS('opacity', '1')
  await expect(firstLine).toHaveCSS('stroke-dashoffset', '0px')
  await diagram.getByRole('button', { name: 'Skip to end', exact: true }).click()
  await expect
    .poll(() =>
      svg.locator('[data-step-state]').evaluateAll((elements) =>
        elements.every((element) => {
          const style = getComputedStyle(element)
          return style.opacity === '1' && style.strokeDashoffset === '0px'
        }),
      ),
    )
    .toBe(true)
  await diagram.getByRole('button', { name: 'Replay animation', exact: true }).click()
  await expect(svg.locator('[data-step-state="pending"]').first()).toHaveCSS('opacity', '0')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(diagram.getByRole('button', { name: 'Replay animation', exact: true })).toBeVisible()
  await expect(firstLine).toHaveCSS('opacity', '1')
  await expect(firstLine).toHaveCSS('stroke-dashoffset', '0px')
})

test('generated diagrams fit their containers on mobile and desktop', async ({ page }) => {
  await page.goto('/docs/guide/node/validator-status')
  const svg = page.locator('.mermaid-diagram div > svg').first()
  await expect(svg).toBeVisible()
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect(svg).toHaveCSS('display', 'block')
    await expect
      .poll(() =>
        svg.evaluate((element) => {
          const container = element.parentElement
          return !!container && element.getBoundingClientRect().width <= container.clientWidth + 1
        }),
      )
      .toBe(true)
  }
})
