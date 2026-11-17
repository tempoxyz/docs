import { expect, test } from '@playwright/test'
import { developerSurfaceRedirects } from '../src/lib/docs-routing'
import { getDemoStep } from './helpers'
import { seedTempoIdSession } from './tempo-id'

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
    page.getByRole('heading', { level: 1, name: 'Build on Tempo', exact: true }),
  ).toBeVisible()
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(sidebar).toBeVisible()
  await expect(sidebar.getByRole('link', { name: 'Start building', exact: true })).toHaveAttribute(
    'href',
    '/get-started',
  )
})

// CI always tests the E2E build; set VITE_E2E=true to test one locally.
const e2eBuild = Boolean(process.env.CI) || process.env.VITE_E2E === 'true'

/** The chain ID in the access key that Tempo ID's sign-in URL carries. */
function signInChainId(url: string) {
  const keyAuthorization = new URL(url).searchParams.get('key_authorization') ?? ''
  const { chainId } = JSON.parse(Buffer.from(keyAuthorization, 'base64url').toString())
  return Number(chainId)
}

for (const entry of ['direct', 'client navigation'] as const) {
  test(`opens the inline account example via ${entry}`, async ({ page, context }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.setViewportSize({ width: 1440, height: 1000 })

    // An E2E build signs in with a seeded session. Otherwise exercise the real Tempo ID connector
    // without authenticating a real account.
    if (e2eBuild)
      await seedTempoIdSession(context, { baseURL: test.info().project.use.baseURL ?? '' })
    const signIns: string[] = []
    await context.route('https://id.tempo.xyz/**', (route) => {
      signIns.push(route.request().url())
      return route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>Tempo</title>',
      })
    })

    if (entry === 'direct') {
      await page.goto('/get-started/quickstart#try-a-payment')
    } else {
      await page.goto('/docs/accounts')
      await page
        .getByRole('navigation', { name: 'Documentation sections' })
        .getByRole('link', { name: 'Get Started', exact: true })
        .click()
      await page
        .locator('article[data-v-content]')
        .getByRole('link', { name: 'interactive quickstart', exact: true })
        .click()
    }

    await expect(page).toHaveURL((url) => url.pathname === '/get-started/quickstart')
    await expect(page.locator('#try-a-payment')).toBeAttached()
    await expect(page.locator('h2#try-a-payment')).toBeVisible()
    const pageTools = page.getByRole('navigation', { name: 'Page tools' })
    await expect(pageTools).toHaveCount(1)
    await expect(pageTools.getByRole('link', { name: 'View Markdown' })).toHaveAttribute(
      'href',
      '/assets/md/get-started/quickstart.md',
    )
    const signIn = getDemoStep(page, 'Create an account, or use an existing one.').getByRole(
      'button',
      { name: 'Sign in', exact: true },
    )
    await expect(signIn).toBeEnabled()
    const addFunds = getDemoStep(page, 'Add testnet funds to your account.').getByRole('button', {
      name: 'Add funds',
      exact: true,
    })
    await expect(addFunds).toBeDisabled()
    await expect(
      getDemoStep(page, 'Send 100 AlphaUSD to a recipient.').getByRole('button', {
        name: 'Enter details',
        exact: true,
      }),
    ).toBeDisabled()

    if (e2eBuild) {
      // The E2E build signs in to Tempo ID with a seeded session, since a test can't use its dialog.
      await signIn.click()
      await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
      await expect(addFunds).toBeEnabled()
    } else {
      await signIn.click()
      // Over HTTP, the sign-in opens in a popup. Over HTTPS, it frames Tempo ID's embed page.
      await expect.poll(() => signIns.length).toBeGreaterThan(0)
      const authorize = signIns.find((url) => new URL(url).pathname === '/oauth2/authorize')
      if (authorize) expect(signInChainId(authorize)).toBe(42431)
      else expect(new URL(signIns[0] ?? '').pathname).toBe('/embed')
    }

    if (!e2eBuild) await expect(addFunds).toBeDisabled()
    expect(pageErrors).toEqual([])
  })
}

for (const entry of ['direct', 'client navigation'] as const) {
  test(`keeps the docs header and sidebar on nested getting-started pages via ${entry}`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
    const sections = page.getByRole('navigation', { name: 'Documentation sections' })

    if (entry === 'direct') {
      expect((await request.get('/get-started/quickstart', { maxRedirects: 0 })).status()).toBe(200)
      await page.goto('/get-started/quickstart')
    } else {
      await page.goto('/docs/accounts')
      await sections.getByRole('link', { name: 'Get Started', exact: true }).click()
      await sidebar.getByRole('link', { name: 'Quickstart', exact: true }).click()
    }

    await expect(page).toHaveURL(/\/get-started\/quickstart\/?$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Quickstart', exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Developer navigation' })).toBeVisible()
    await expect(sections).toBeVisible()
    await expect(sections.locator('[aria-current="page"]')).toHaveText('Get Started')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.locator('a[data-active]')).toHaveAttribute(
      'href',
      '/get-started/quickstart',
    )

    await sidebar.getByRole('link', { name: 'Start building', exact: true }).click()
    await expect(page).toHaveURL(/\/get-started\/?$/)
    await expect(sections).toBeVisible()
    await expect(sidebar.locator('a[data-active]')).toHaveAttribute('href', '/get-started')
  })
}
