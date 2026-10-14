import { expect, type Locator, type Page, test } from '@playwright/test'

const depositPage = '/docs/earn/integrate#try-a-deposit'
const directoryEndpoint = 'https://api.tempo.xyz/v1/earn/vaults/verified?**'
const corsHeaders = { 'access-control-allow-origin': '*' }
const deployment = {
  id: '0x20147491b5701dea880263241c335caca9be326d',
  verified: true,
  assetToken: { address: '0x20c0000000000000000000000000000000000000' },
  shareToken: { address: '0x20c0000000000000000000006ac30cbdea0747fa' },
  engine: { address: '0x49c4600ba4f39c11006cb2269c371e8a19f26a26' },
  access: { status: 'open' },
  capabilities: { deposit: true, redeem: true },
  state: { depositsPaused: false },
}

async function blockAndTrackWrites(page: Page) {
  const writes: string[] = []
  await page.route(/^https:\/\/(?:rpc|sponsor)(?:\.[\w-]+)?\.tempo\.xyz(?:\/|$)/, async (route) => {
    const payload = route.request().postDataJSON()
    for (const request of Array.isArray(payload) ? payload : [payload]) {
      if (typeof request?.method === 'string' && /send|fund|sign/i.test(request.method))
        writes.push(request.method)
    }
    // Fail-closed UI tests need neither live RPC reads nor a funded account.
    await route.abort()
  })
  return writes
}

async function expectActionsDisabled(demo: Locator) {
  for (const name of ['Create test account', 'Approve 1 pathUSD', 'Deposit 1 pathUSD'])
    await expect(demo.getByRole('button', { name, exact: true })).toBeDisabled()
  await expect(demo.getByRole('button', { name: 'Get test funds', exact: true })).toHaveCount(0)
  await expect(demo.getByRole('button', { name: 'Withdraw test position' })).toHaveCount(0)
  await expect(demo.getByRole('link', { name: /View (deposit|withdrawal) receipt/ })).toHaveCount(0)
}

test('shows a directory failure and retries without enabling actions or sending transactions', async ({
  page,
}) => {
  const writes = await blockAndTrackWrites(page)
  const requests: { method: string; url: URL }[] = []
  let retry = false
  let releaseRetry: (() => void) | undefined
  const retryResponse = new Promise<void>((resolve) => {
    releaseRetry = resolve
  })
  await page.route(directoryEndpoint, async (route) => {
    requests.push({ method: route.request().method(), url: new URL(route.request().url()) })
    if (retry) {
      await retryResponse
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ data: [] }),
      })
      return
    }
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify({ error: { message: 'Directory temporarily unavailable.' } }),
    })
  })
  await page.goto(depositPage)
  const demo = page.getByTestId('earn-deposit-demo')
  await expect(demo).toBeVisible()
  await expect(demo.getByRole('alert')).toContainText('Could not verify the testnet vault')
  await expectActionsDisabled(demo)
  await expect(demo.getByRole('button', { name: 'Check again', exact: true })).toBeEnabled()
  const initialRequests = requests.length
  retry = true
  try {
    await demo.getByRole('button', { name: 'Check again', exact: true }).click()
    await expect.poll(() => requests.length).toBeGreaterThan(initialRequests)
    await expect(demo.getByRole('button', { name: 'Checking test vault…' })).toBeDisabled()
    await expect(demo.getByRole('alert')).toHaveCount(0)
    await expectActionsDisabled(demo)
  } finally {
    releaseRetry?.()
  }
  await expect(demo.getByRole('alert')).toContainText('not currently available')
  await expect(demo.getByRole('button', { name: 'Check again', exact: true })).toBeEnabled()
  await expectActionsDisabled(demo)
  await expect(demo.getByRole('link', { name: 'Contact Tempo', exact: true })).toHaveAttribute(
    'href',
    'https://tempo.xyz/contact',
  )
  for (const request of requests) {
    expect(request.method).toBe('GET')
    expect(request.url.searchParams.get('chainId')).toBe('testnet')
  }
  expect(writes).toEqual([])
})

for (const fixture of [
  { name: 'malformed directory data', body: { data: {} } },
  {
    name: 'a different asset token',
    body: {
      data: [
        { ...deployment, assetToken: { address: '0x20c0000000000000000000000000000000000001' } },
      ],
    },
  },
  {
    name: 'a different vault engine',
    body: {
      data: [{ ...deployment, engine: { address: '0x0000000000000000000000000000000000000001' } }],
    },
  },
]) {
  test(`fails closed for ${fixture.name}`, async ({ page }) => {
    const writes = await blockAndTrackWrites(page)
    await page.route(directoryEndpoint, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(fixture.body),
      }),
    )
    await page.goto(depositPage)
    const demo = page.getByTestId('earn-deposit-demo')
    await expect(demo.getByRole('alert')).toContainText(
      /vault.*(?:unavailable|not currently available)/,
    )
    await expectActionsDisabled(demo)
    await expect(demo.getByRole('button', { name: 'Check again', exact: true })).toBeEnabled()
    expect(writes).toEqual([])
  })
}

test('keeps the failure message and retry controls usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const writes = await blockAndTrackWrites(page)
  await page.route(directoryEndpoint, (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify({ error: { message: 'Directory temporarily unavailable.' } }),
    }),
  )
  await page.goto(depositPage)
  const demo = page.getByTestId('earn-deposit-demo')
  await expect(demo.getByRole('alert')).toBeVisible()
  await expect(demo).toContainText('Moderato testnet')
  await expect(demo).toContainText('Test tokens only')
  await expectActionsDisabled(demo)
  await demo.getByRole('button', { name: 'Check again', exact: true }).click()
  await expect(demo.getByRole('alert')).toContainText('Could not verify the testnet vault')
  await expect(demo.getByRole('button', { name: 'Check again', exact: true })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const viewportWidth = page.viewportSize()?.width
  expect(viewportWidth).toBe(390)
  for (const control of await demo.getByRole('button').all()) {
    const bounds = await control.boundingBox()
    expect(bounds).not.toBeNull()
    if (bounds) {
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
    }
  }
  expect(writes).toEqual([])
})

test('starts with one pathUSD and validates edited deposit amounts', async ({ page }) => {
  const writes = await blockAndTrackWrites(page)
  await page.route(directoryEndpoint, (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      headers: corsHeaders,
      body: '{}',
    }),
  )
  await page.goto(depositPage)
  const demo = page.getByTestId('earn-deposit-demo')
  await expect(demo.getByRole('alert')).toBeVisible()
  const amount = demo.getByLabel('Deposit amount (pathUSD)')
  await expect(amount).toHaveValue('1')
  await amount.fill('2.5')
  await expect(
    demo.getByRole('button', { name: 'Approve 2.5 pathUSD', exact: true }),
  ).toBeDisabled()
  await expect(
    demo.getByRole('button', { name: 'Deposit 2.5 pathUSD', exact: true }),
  ).toBeDisabled()
  await amount.fill('0.0000001')
  await expect(amount).toHaveAttribute('aria-invalid', 'true')
  await expect(demo).toContainText('Enter a positive amount with up to 6 decimal places.')
  expect(writes).toEqual([])
})

test('withdrawal demo explains the shared test account and never fabricates a position', async ({
  page,
}) => {
  const writes = await blockAndTrackWrites(page)
  await page.route(directoryEndpoint, (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      headers: corsHeaders,
      body: '{}',
    }),
  )
  await page.goto('/docs/earn/withdraw#try-a-withdrawal')
  const demo = page.getByTestId('earn-withdraw-demo')
  await expect(demo).toBeVisible()
  await expect(demo.getByRole('button', { name: 'Withdraw test position' })).toBeDisabled()
  await expect(demo.getByRole('link', { name: 'Make a test deposit' })).toHaveAttribute(
    'href',
    '/docs/earn/integrate#try-a-deposit',
  )
  await expect(demo).toContainText('restores that account and selects all its shares')
  await expect(demo.getByRole('button', { name: 'Create test account' })).toHaveCount(0)
  expect(writes).toEqual([])
})
