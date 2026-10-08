import { expect, type Locator, type Route, test } from '@playwright/test'

const vaultsPage = '/docs/earn/vaults#inspect-the-selected-vault'
const endpoint = 'https://api.tempo.xyz/v1/earn/vaults/verified?**'
const headers = { 'access-control-allow-origin': '*' }

function vault(number: number, label: string, queued = false) {
  const address = `0x${number.toString(16).padStart(40, '0')}`
  const assetAddress = `0x${(number + 100).toString(16).padStart(40, '0')}`
  const asset = {
    address: assetAddress,
    currency: 'USD',
    decimals: 6,
    id: assetAddress,
    name: 'Example stablecoin',
    symbol: 'USD',
    verified: true,
  }
  return {
    id: address,
    vaultAddress: address,
    label,
    slug: `example-vault-${number}`,
    description: null,
    verified: true,
    assetToken: asset,
    shareToken: { ...asset, address, id: address, symbol: 'earnUSD' },
    engine: { address, type: 'erc4626', venue: address },
    instantLiquidity: '1000000',
    sharePrice: null,
    access: { status: queued ? 'allowlisted' : 'open' },
    capabilities: {
      asyncRedeem: queued,
      boundedRedeem: true,
      deposit: true,
      exactWithdraw: !queued,
      inKindDeposit: false,
      privateRouting: false,
      redeem: !queued,
      routerSwaps: false,
    },
    state: {
      depositsPaused: queued,
      engineShares: '1000000',
      feesActive: true,
      isAccountingAligned: true,
      openRedeemRequestCount: 0,
      totalAssets: '1000000',
      totalEarnShares: '1000000',
    },
    apy: null,
    tvl: null,
  }
}

const firstVault = vault(1, 'Example open vault')
const secondVault = vault(2, 'Example queued vault', true)
const mainnetVault = vault(3, 'Example mainnet vault')

function respond(route: Route, data: ReturnType<typeof vault>[], nextCursor: string | null = null) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers,
    body: JSON.stringify({ data, nextCursor }),
  })
}

function field(demo: Locator, name: string) {
  return demo
    .locator('dt')
    .filter({ hasText: new RegExp(`^${name}$`) })
    .locator('..')
    .locator('dd')
}

test('loads live vault data inline and updates details for the selected vault', async ({
  page,
}) => {
  const requests: { method: string; url: URL; headers: Record<string, string> }[] = []
  await page.route(endpoint, async (route) => {
    const request = route.request()
    requests.push({
      method: request.method(),
      url: new URL(request.url()),
      headers: request.headers(),
    })
    await respond(route, [firstVault, secondVault])
  })
  await page.goto(vaultsPage)
  const demo = page.getByTestId('earn-vault-demo')
  await expect(demo.getByLabel('Network', { exact: true })).toHaveValue('testnet')
  expect(requests).toHaveLength(0)
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await expect(demo.getByLabel('Vault', { exact: true })).toHaveValue('')
  await expect(demo.getByTestId('earn-vault-details')).toHaveCount(0)
  await demo.getByLabel('Vault', { exact: true }).selectOption(firstVault.id)
  await expect(field(demo, 'Vault address')).toHaveText(firstVault.vaultAddress)
  await expect(field(demo, 'Share-token access')).toContainText(/open/i)
  await expect(field(demo, 'Vault-wide liquidity')).toHaveText('1 USD')

  await demo.getByLabel('Vault', { exact: true }).selectOption(secondVault.id)
  await expect(field(demo, 'Vault address')).toHaveText(secondVault.vaultAddress)
  await expect(field(demo, 'Accepted asset')).toContainText(secondVault.assetToken.address)
  await expect(field(demo, 'Share-token access')).toContainText(/allowlist/i)
  await expect(field(demo, 'Deposits')).toContainText(/paused/i)
  await expect(field(demo, 'Immediate redemption')).toContainText(/not supported/i)
  await expect(field(demo, 'Queued redemption')).toHaveText('Supported')
  await expect(demo.getByRole('button', { name: 'Refresh vaults', exact: true })).toBeEnabled()
  await expect(page.getByRole('dialog', { name: 'API Client' })).toHaveCount(0)
  await expect(demo.locator('pre')).toHaveCount(0)
  await expect(demo).not.toContainText(/deelusd/i)
  expect(new URL(page.url()).pathname).toBe('/docs/earn/vaults')
  expect(requests).toHaveLength(1)
  expect(requests[0].method).toBe('GET')
  expect(Object.fromEntries(requests[0].url.searchParams)).toEqual({
    chainId: 'testnet',
    include: 'access,capabilities,apy,tvl',
    limit: '10',
  })
  expect(requests[0].headers.authorization).toBeUndefined()
  expect(requests[0].headers['tempo-api-key']).toBeUndefined()
})

test('loads another page without losing the current selection', async ({ page }) => {
  const cursors: (string | null)[] = []
  await page.route(endpoint, async (route) => {
    const cursor = new URL(route.request().url()).searchParams.get('cursor')
    cursors.push(cursor)
    await respond(route, cursor ? [secondVault] : [firstVault], cursor ? null : 'next-vaults')
  })
  await page.goto(vaultsPage)
  const demo = page.getByTestId('earn-vault-demo')
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await demo.getByLabel('Vault', { exact: true }).selectOption(firstVault.id)
  await demo.getByRole('button', { name: 'Load more', exact: true }).click()
  await expect(demo.getByLabel('Vault', { exact: true }).locator('option')).toHaveCount(3)
  await expect(demo.getByLabel('Vault', { exact: true })).toHaveValue(firstVault.id)
  await expect(demo.getByRole('button', { name: 'Load more', exact: true })).toHaveCount(0)
  await demo.getByLabel('Vault', { exact: true }).selectOption(secondVault.id)
  await expect(field(demo, 'Vault address')).toHaveText(secondVault.vaultAddress)
  expect(cursors).toEqual([null, 'next-vaults'])
})

test('clears old results and ignores an in-flight response when the network changes', async ({
  page,
}) => {
  let releaseTestnet: (() => void) | undefined
  let staleResponseReleased = false
  let testnetRequests = 0
  await page.route(endpoint, async (route) => {
    const chainId = new URL(route.request().url()).searchParams.get('chainId')
    if (chainId === 'mainnet') {
      await respond(route, [mainnetVault])
      return
    }
    testnetRequests++
    if (testnetRequests > 1) {
      await new Promise<void>((resolve) => {
        releaseTestnet = resolve
      })
      // The browser may already have aborted this request after changing networks.
      await respond(route, [secondVault]).catch(() => {})
      staleResponseReleased = true
      return
    }
    await respond(route, [firstVault])
  })
  await page.goto(vaultsPage)
  const demo = page.getByTestId('earn-vault-demo')
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await demo.getByLabel('Vault', { exact: true }).selectOption(firstVault.id)
  await expect(field(demo, 'Vault address')).toHaveText(firstVault.vaultAddress)
  await demo.getByRole('button', { name: 'Refresh vaults', exact: true }).click()
  await expect.poll(() => Boolean(releaseTestnet)).toBe(true)
  await demo.getByLabel('Network', { exact: true }).selectOption('mainnet')
  await expect(demo.getByLabel('Vault', { exact: true })).toHaveCount(0)
  await expect(demo).not.toContainText(firstVault.vaultAddress)
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await demo.getByLabel('Vault', { exact: true }).selectOption(mainnetVault.id)
  await expect(field(demo, 'Vault address')).toHaveText(mainnetVault.vaultAddress)
  releaseTestnet?.()
  await expect.poll(() => staleResponseReleased).toBe(true)
  await expect(demo.getByLabel('Network', { exact: true })).toHaveValue('mainnet')
  await expect(field(demo, 'Vault address')).toHaveText(mainnetVault.vaultAddress)
  await expect(demo).not.toContainText(secondVault.vaultAddress)
})

test('shows a request error and allows retry without requesting a payment or key', async ({
  page,
}) => {
  let attempts = 0
  await page.route(endpoint, async (route) => {
    attempts++
    if (attempts === 1) {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({
          error: { code: 'payment_required', message: 'Free quota exceeded.' },
        }),
      })
      return
    }
    await respond(route, [firstVault])
  })
  await page.goto(vaultsPage)
  const demo = page.getByTestId('earn-vault-demo')
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await expect(demo.getByRole('alert')).toBeVisible()
  await expect(demo.getByLabel('Vault', { exact: true })).toHaveCount(0)
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await demo.getByLabel('Vault', { exact: true }).selectOption(firstVault.id)
  await expect(field(demo, 'Vault address')).toHaveText(firstVault.vaultAddress)
  await expect(demo.getByRole('alert')).toHaveCount(0)
  expect(attempts).toBe(2)
})

test('shows an empty result without inventing a sample vault', async ({ page }) => {
  await page.route(endpoint, (route) => respond(route, []))
  await page.goto(vaultsPage)
  const demo = page.getByTestId('earn-vault-demo')
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await expect(demo).toContainText(/no .*vaults/i)
  await expect(demo.getByLabel('Vault', { exact: true })).toHaveCount(0)
  await expect(demo.locator('dd')).toHaveCount(0)
  await expect(demo.getByRole('button', { name: 'Refresh vaults', exact: true })).toBeEnabled()
})

test('keeps the loaded vault and controls usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route(endpoint, (route) => respond(route, [firstVault, secondVault]))
  await page.goto(vaultsPage)
  const demo = page.getByTestId('earn-vault-demo')
  await demo.getByRole('button', { name: 'Load vaults', exact: true }).click()
  await expect(demo.getByLabel('Network', { exact: true })).toBeVisible()
  await expect(demo.getByLabel('Vault', { exact: true })).toBeVisible()
  await demo.getByLabel('Vault', { exact: true }).selectOption(secondVault.id)
  await expect(field(demo, 'Vault address')).toHaveText(secondVault.vaultAddress)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
