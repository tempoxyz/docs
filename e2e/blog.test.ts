import { expect, test } from '@playwright/test'

// Viewport cases share the preview server's WASM image renderer.
// Keep them sequential while other test files can use both workers.
test.describe.configure({ mode: 'default' })

test('filters posts with the keyboard and preserves author credits when opening an article', async ({
  page,
}) => {
  await page.goto('/blog')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
  await expect(
    page.getByRole('navigation', { name: 'Documentation sections', exact: true }),
  ).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'APIs & SDKs', exact: true })).toHaveCount(0)
  const filters = page.getByRole('group', { name: 'Filter posts by category' })
  const tabs = filters.getByRole('tablist', { name: 'Post categories' })
  const announcements = tabs.getByRole('tab', { name: 'Announcements', exact: true })
  const events = tabs.getByRole('tab', { name: 'Events', exact: true })
  await expect(events).toBeEnabled()
  // Arrow keys move focus through the tabs; Enter selects.
  await tabs.getByRole('tab', { name: 'All posts', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(announcements).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(events).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(events).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('status')).toHaveText('0 posts')
  await expect(
    page.getByText('No posts in this category yet. Choose another category or view all posts.'),
  ).toBeVisible()

  await tabs.getByRole('tab', { name: 'Technical posts', exact: true }).click()
  await expect(page.getByRole('status')).not.toHaveText('0 posts')
  const post = page.getByRole('link').filter({
    has: page.getByRole('heading', { name: 'Privacy with Tempo Zones', level: 3 }),
  })
  await expect(post.getByText('Liam Horne, Varun', { exact: true })).toBeVisible()
  await post.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/blog\/privacy-with-tempo-zones$/)
  await expect(
    page.getByRole('navigation', { name: 'Documentation sections', exact: true }),
  ).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'APIs & SDKs', exact: true })).toHaveCount(0)
  const article = page.getByRole('article')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Privacy with Tempo Zones')
  await expect(article.getByText('Liam Horne, Varun', { exact: true })).toBeVisible()
  await article.getByRole('link', { name: '← All posts', exact: true }).click()
  await expect(page).toHaveURL(/\/blog$/)
  await expect(tabs.getByRole('tab', { name: 'All posts', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

for (const width of [320, 390, 768, 1024, 1280, 1440]) {
  test(`keeps the blog readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/blog')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
    const featured = page.locator('.tempo-blog-featured')
    await expect(featured.getByRole('heading', { level: 2 })).toHaveCount(1)
    await expect(featured.locator('img')).toBeVisible()
    await expect(featured.locator('.tempo-blog-byline')).toBeVisible()
    await expect(featured.locator('img')).toHaveJSProperty('complete', true)
    await expect
      .poll(() => featured.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    await page.evaluate(() => document.fonts.ready)

    // Cards keep their image at every width: 1, 2, then 3 columns.
    await expect(page.locator('.tempo-blog-post-list img').first()).toBeVisible()
    await expect(page.locator('.tempo-blog-post-list h3').first()).toBeVisible()
    const columns = await page
      .locator('.tempo-blog-post-list')
      .evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(' ').length)
    expect(columns).toBe(width >= 1024 ? 3 : width >= 640 ? 2 : 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )

    const filters = page.getByRole('tablist', { name: 'Post categories' })
    for (const tab of await filters.getByRole('tab').all()) {
      const bounds = await tab.boundingBox()
      // TDS Platform Tab, small scale.
      expect(bounds?.height).toBeGreaterThanOrEqual(32)
      expect(bounds?.x).toBeGreaterThanOrEqual(0)
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width)
    }
    const footer = page.getByRole('navigation', { name: 'Blog footer' })
    await expect(footer.getByRole('link')).toHaveText(['Docs', 'Blog', 'tempo.xyz ↗', 'GitHub ↗'])
  })
}

test('mobile blog articles share developer navigation and return to docs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/blog/privacy-with-tempo-zones')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy with Tempo Zones')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true })
  await trigger.click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused()
  await menu.getByRole('link', { name: 'Docs', exact: true }).click()
  await expect(page).toHaveURL((url) => url.pathname === '/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Documentation')
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('article section navigation keeps headings clear of the fixed developer header', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/blog/privacy-with-tempo-zones')
  const headings = page.locator('[data-blog-content] h2')
  await expect(headings.first()).toBeVisible()
  await headings.nth(1).scrollIntoViewIfNeeded()
  const readingNav = page.getByRole('navigation', { name: 'Article navigation', exact: true })
  await expect(readingNav).toBeVisible()
  const sectionSelect = readingNav.getByRole('combobox', { name: 'Jump to article section' })
  const firstId = await headings.first().getAttribute('id')
  if (!firstId) throw new Error('Article section should have a linkable ID')
  await sectionSelect.selectOption(firstId)
  await expect
    .poll(() =>
      headings.first().evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    )
    .toBeGreaterThanOrEqual(81)
  await expect
    .poll(() =>
      headings.first().evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    )
    .toBeLessThanOrEqual(101)
  await readingNav.getByRole('button', { name: 'Back to top', exact: true }).click()
  await expect(readingNav).toBeHidden()
})
