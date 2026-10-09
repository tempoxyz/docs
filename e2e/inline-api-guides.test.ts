import { expect, test } from '@playwright/test'

const guides = [
  {
    page: '/docs/accounts/balances',
    anchor: 'read-balances',
    title: 'Balances and activity',
    operation: 'List address balances',
    endpoint: '/v1/addresses/',
    requestPath: /^\/v1\/addresses\/0x[0-9a-fA-F]{40}\/balances$/,
  },
  {
    page: '/docs/earn/balances',
    anchor: 'read-a-position',
    title: 'Balances and earnings',
    operation: 'Get account position',
    endpoint: '/v1/earn/vaults/',
    requestPath: /^\/v1\/earn\/vaults\/0x[0-9a-fA-F]{40}\/positions\/0x[0-9a-fA-F]{40}$/,
  },
  {
    page: '/docs/routes/networks',
    anchor: 'read-the-route-directory',
    title: 'Supported routes',
    operation: 'List routes',
    endpoint: '/v1/routes',
    requestPath: /^\/v1\/routes$/,
  },
] as const

test.use({ viewport: { width: 1440, height: 1000 } })

for (const guide of guides) {
  test(`${guide.page} runs its embedded read request without leaving the guide`, async ({
    page,
  }) => {
    const responseMarker = 'inline-guide-e2e-next-page'
    const requests: { method: string; pathname: string; chainId: string | null }[] = []

    // Exercise the real client without depending on live balances, routes,
    // credentials, or public rate limits. Empty data is a valid list response.
    await page.route('https://api.tempo.xyz/v1/**', async (route) => {
      const request = route.request()
      const headers = {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': '*',
      }
      if (request.method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers })
        return
      }

      const pathname = new URL(request.url()).pathname
      requests.push({
        method: request.method(),
        pathname,
        chainId: new URL(request.url()).searchParams.get('chainId'),
      })
      if (request.method() !== 'GET' || !guide.requestPath.test(pathname)) {
        await route.abort()
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({ data: [], nextCursor: responseMarker }),
      })
    })

    await page.goto(`${guide.page}#${guide.anchor}`)
    const article = page.locator('article[data-v-content]')
    await expect(
      article.getByRole('heading', { level: 1, name: guide.title, exact: true }),
    ).toBeVisible()
    await expect(article).not.toContainText(
      /No matching operation|No OpenAPI spec|Multiple OpenAPI specs/,
    )

    const playground = article
      .locator('[data-v-openapi]')
      .filter({
        has: page.locator('[data-v-openapi-sample-request-body]', { hasText: guide.endpoint }),
      })
      .first()
    await expect(playground).toHaveCount(1)
    await expect(playground).not.toContainText(/deelusd/i)
    await expect(playground.locator('[data-v-openapi-sample-request-body]')).toContainText(
      guide.endpoint,
    )
    const tryButton = playground.getByRole('button', { name: 'Try', exact: true })
    await expect(tryButton).toBeEnabled()
    await tryButton.click()

    const client = page.getByRole('dialog', { name: 'API Client', exact: true })
    await expect(client).toBeVisible()
    await expect(client.locator(`[aria-label="Request: ${guide.operation}"]`)).toBeVisible()
    // Count only the playground's request; the page may read the same API on load.
    requests.length = 0
    await client.getByRole('button', { name: /^Send Request/ }).click()

    // A unique cursor from the mocked response distinguishes the actual result
    // from the schema's static response example shown before clicking Try.
    await expect(client).toContainText(responseMarker)
    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe('GET')
    expect(requests[0].pathname).toMatch(guide.requestPath)
    if (guide.page === '/docs/accounts/balances') {
      expect(requests[0].chainId).toBe('42431')
    }
    if (guide.page === '/docs/earn/balances') {
      expect(requests[0].chainId).toBe('testnet')
      expect(requests[0].pathname).toContain('/vaults/0x20147491b5701dea880263241c335caca9be326d/')
    }

    await page.keyboard.press('Escape')
    await expect(client).toBeHidden()
    expect(new URL(page.url()).pathname).toBe(guide.page)
    await expect(
      article.getByRole('heading', { level: 1, name: guide.title, exact: true }),
    ).toBeVisible()
    const active = page.locator('[data-v-gutter-left] nav[data-v-sidebar] a[data-active]')
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', guide.page)
    await expect(active).toHaveAttribute('aria-current', 'page')
  })
}
