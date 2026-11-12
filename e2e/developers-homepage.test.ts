import { expect, test } from '@playwright/test'
import { developerSurfaceRedirects } from '../src/lib/docs-routing'
import { getDemoStep } from './helpers'

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
  await expect(
    page.getByRole('heading', { level: 1, name: 'Build stablecoin payments on Tempo' }),
  ).toBeVisible()
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
  await expect(sidebar.getByRole('link', { name: 'Build on Tempo', exact: true })).toHaveAttribute(
    'href',
    '/get-started',
  )
})

// CI always tests the E2E build; set VITE_E2E=true to test one locally.
const e2eBuild = Boolean(process.env.CI) || process.env.VITE_E2E === 'true'

for (const entry of ['direct', 'client navigation'] as const) {
  test(`opens the inline account example via ${entry}`, async ({ page, context, baseURL }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.setViewportSize({ width: 1440, height: 1000 })

    // Exercise the real wallet connector without authenticating a real account.
    if (!baseURL) throw new Error('The wallet example test requires a docs baseURL')
    const docsOrigin = new URL(baseURL).origin
    await context.route('https://wallet.tempo.xyz/embed**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><title>Tempo Wallet</title>
          <h1>Tempo Wallet</h1><output aria-label="Connection request"></output>
          <script>
            const docsOrigin = ${JSON.stringify(docsOrigin)};
            const host = window.opener || window.parent;
            addEventListener('message', (event) => {
              if (event.origin !== docsOrigin || event.data.topic !== 'rpc-requests') return;
              const { chainId, requests } = event.data.payload;
              document.querySelector('output').textContent =
                requests.map(({ request }) => request.method).join(',') + ':' + chainId;
            });
            host.postMessage({ id: 'ready', topic: 'ready', payload: {
              trustedHosts: [new URL(docsOrigin).hostname]
            } }, docsOrigin);
          </script>`,
      }),
    )

    if (entry === 'direct') {
      await page.goto('/get-started/quickstart#try-a-payment')
    } else {
      await page.goto('/docs/accounts')
      await page
        .locator('.docs-section-nav')
        .getByRole('navigation', { name: 'Docs sections', exact: true })
        .getByRole('link', { name: 'Get started', exact: true })
        .click()
      await page
        .locator('article[data-v-content]')
        .getByRole('link', { name: 'Send your first payment', exact: true })
        .click()
    }

    await expect(page).toHaveURL((url) => url.pathname === '/get-started/quickstart')
    await expect(page.locator('#try-a-payment')).toBeAttached()
    await expect(page.locator('h2#try-a-payment')).toBeVisible()
    // One Copy page split button beside the H1; its menu links the page's Markdown.
    const pageActions = page.locator('.docs-page-actions')
    await expect(pageActions).toHaveCount(1)
    await expect(pageActions.getByRole('button', { name: 'Copy page', exact: true })).toBeVisible()
    await pageActions.getByRole('button', { name: 'More page options', exact: true }).click()
    const pageMenu = pageActions.getByRole('menu', { name: 'Page options', exact: true })
    await expect(
      pageMenu.getByRole('menuitem', { name: 'View as Markdown', exact: true }),
    ).toHaveAttribute('href', '/assets/md/get-started/quickstart.md')
    await page.keyboard.press('Escape')
    await expect(pageMenu).toHaveCount(0)
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
      // The E2E build deliberately uses local WebAuthn instead of Tempo Wallet.
      const cdp = await context.newCDPSession(page)
      await cdp.send('WebAuthn.enable')
      await cdp.send('WebAuthn.addVirtualAuthenticator', {
        options: {
          protocol: 'ctap2',
          transport: 'internal',
          hasResidentKey: true,
          hasUserVerification: true,
          isUserVerified: true,
        },
      })
      await signIn.click()
      await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
      await expect(addFunds).toBeEnabled()
    } else if (new URL(page.url()).protocol === 'http:') {
      const popupPromise = page.waitForEvent('popup')
      await signIn.click()
      const wallet = await popupPromise
      await expect(wallet).toHaveURL((url) => url.origin === 'https://wallet.tempo.xyz')
      await expect(wallet.getByLabel('Connection request')).toHaveText('wallet_connect:42431')
      await wallet.close()
    } else {
      await signIn.click()
      const dialog = page.getByRole('dialog', { name: 'Tempo Wallet', exact: true })
      await expect(dialog).toBeVisible()
      await expect(dialog.frameLocator('iframe').getByLabel('Connection request')).toHaveText(
        'wallet_connect:42431',
      )
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
    const tabs = page
      .getByRole('navigation', { name: 'Developer navigation' })
      .getByRole('navigation', { name: 'Documentation areas', exact: true })
    const sections = page
      .locator('.docs-section-nav')
      .getByRole('navigation', { name: 'Docs sections', exact: true })

    if (entry === 'direct') {
      expect((await request.get('/get-started/quickstart', { maxRedirects: 0 })).status()).toBe(200)
      await page.goto('/get-started/quickstart')
    } else {
      await page.goto('/docs/accounts')
      // The Docs tab opens its first section, Get started.
      await tabs.getByRole('link', { name: 'Docs', exact: true }).click()
      await expect(page).toHaveURL(/\/get-started\/?$/)
      await sidebar.getByRole('link', { name: 'Quickstart', exact: true }).click()
    }

    await expect(page).toHaveURL(/\/get-started\/quickstart\/?$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Quickstart', exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Developer navigation' })).toBeVisible()
    await expect(tabs.locator('[aria-current="page"]')).toHaveText('Docs')
    await expect(tabs.getByRole('link', { name: 'Docs', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(sections).toBeVisible()
    await expect(sections.locator('[aria-current="page"]')).toHaveText('Get started')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.locator('a[data-active]')).toHaveAttribute(
      'href',
      '/get-started/quickstart',
    )

    await sidebar.getByRole('link', { name: 'Build on Tempo', exact: true }).click()
    await expect(page).toHaveURL(/\/get-started\/?$/)
    await expect(sections).toBeVisible()
    await expect(sidebar.locator('a[data-active]')).toHaveAttribute('href', '/get-started')
  })
}
