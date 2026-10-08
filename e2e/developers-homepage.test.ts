import { expect, test } from '@playwright/test'
import { developerSurfaceRedirects } from '../src/lib/docs-routing'

for (const { source, destination } of developerSurfaceRedirects) {
  test(`redirects the former ${source} entry point to documentation`, async ({ request }) => {
    const response = await request.get(`${source}?ref=legacy`, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    const target = new URL(response.headers().location, response.url())
    expect(target.pathname).toBe(destination)
    expect(target.searchParams.get('ref')).toBe('legacy')
  })
}

test('serves the docs homepage directly at the root URL', async ({ page, request }) => {
  expect((await request.get('/', { maxRedirects: 0 })).status()).toBe(200)
  await page.goto('/')
  await expect(page).toHaveURL((url) => url.pathname === '/')
  await expect(page.getByRole('heading', { level: 1, name: 'Documentation' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Developer navigation' })).toBeVisible()
})

test('keeps legacy docs queries and anchors when opening the new landing', async ({ page }) => {
  await page.goto('/docs?ref=legacy#start-here')
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === '/' &&
      url.searchParams.get('ref') === 'legacy' &&
      url.hash === '#start-here',
  )
  await expect(page.locator('#start-here')).toBeAttached()
})

test('serves getting started directly with its overview sidebar', async ({ page, request }) => {
  expect((await request.get('/get-started', { maxRedirects: 0 })).status()).toBe(200)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/get-started')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Get Started', exact: true }),
  ).toBeVisible()
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(sidebar).toBeVisible()
  await expect(sidebar.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute(
    'href',
    '/get-started',
  )
})
