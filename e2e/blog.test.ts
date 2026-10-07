import { expect, test } from '@playwright/test'

test('filters posts with the keyboard and preserves author credits when opening an article', async ({
  page,
}) => {
  await page.goto('/blog')
  const filters = page.getByRole('group', { name: 'Filter posts by category' })
  const events = filters.getByRole('button', { name: 'Events', exact: true })
  await events.focus()
  await page.keyboard.press('Enter')
  await expect(events).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status')).toHaveText(
    'No posts in this category yet. Choose another category or view all posts.',
  )

  await filters.getByRole('button', { name: 'Technical posts', exact: true }).click()
  await expect(page.getByRole('status')).toHaveCount(0)
  const post = page.getByRole('link').filter({
    has: page.getByRole('heading', { name: 'Privacy with Tempo Zones', level: 2 }),
  })
  await expect(post.getByText('By Liam & Varun', { exact: true })).toBeVisible()
  await post.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/blog\/privacy-with-tempo-zones$/)
  const article = page.getByRole('article')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Privacy with Tempo Zones')
  await expect(article.getByText('By Liam & Varun', { exact: true })).toBeVisible()
  await article.getByRole('link', { name: '← Blog', exact: true }).click()
  await expect(page).toHaveURL(/\/blog$/)
  await expect(filters.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

for (const width of [320, 390, 768, 1024, 1280, 1440]) {
  test(`keeps the blog readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/blog')
    const featured = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 1 }) })
    await expect(featured.locator('img')).toBeVisible()
    await expect(featured.getByText(/^By /)).toBeVisible()
    await expect(featured.locator('img')).toHaveJSProperty('complete', true)
    await expect
      .poll(() => featured.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    await page.evaluate(() => document.fonts.ready)

    const thumbnail = page.locator('section ul li img').first()
    if (width < 768) await expect(thumbnail).toBeHidden()
    else await expect(thumbnail).toBeVisible()

    if (width >= 768) {
      const cards = page.locator('section ul li a')
      const alignedCards = width >= 1024 ? cards.or(featured) : cards
      for (const card of await alignedCards.all()) {
        const bounds = await card.evaluate((element) => {
          const image = element.querySelector('img')?.getBoundingClientRect()
          const content = element.querySelector(':scope > div:last-child')
          const first = content?.firstElementChild?.getBoundingClientRect()
          const last = content?.lastElementChild?.getBoundingClientRect()
          if (!image || !first || !last) throw new Error('Expected an image and card content')
          return {
            featured: !!content?.querySelector('h1'),
            title: content?.querySelector('h1, h2')?.textContent,
            imageTop: image.top,
            imageBottom: image.bottom,
            textTop: first.top,
            textBottom: last.bottom,
          }
        })
        expect(bounds.textTop, bounds.title ?? '').toBeGreaterThanOrEqual(bounds.imageTop - 1)
        expect(bounds.textBottom, bounds.title ?? '').toBeLessThanOrEqual(bounds.imageBottom + 1)
        if (!bounds.featured) {
          expect(
            Math.abs(bounds.imageTop - bounds.textTop),
            bounds.title ?? '',
          ).toBeLessThanOrEqual(1)
          expect(
            Math.abs(bounds.imageBottom - bounds.textBottom),
            bounds.title ?? '',
          ).toBeLessThanOrEqual(1)
        }
      }
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
    const filters = page.getByRole('group', { name: 'Filter posts by category' })
    for (const button of await filters.getByRole('button').all()) {
      expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    }
  })
}
