import { expect, test } from '@playwright/test'

const cors = { 'access-control-allow-origin': '*' }
const chain = (id: string, name: string, addressFormat = 'hex') => ({ id, name, addressFormat })
const token = (tokenKey: string, symbol: string) => ({ tokenKey, symbol, decimals: 6 })
const tempo = chain('eip155:4217', 'Tempo')
const routes = [
  {
    id: 'base-usdc-tempo-usdce',
    sourceChain: chain('eip155:8453', 'Base'),
    sourceToken: token('base/usdc', 'USDC'),
    destinationChain: tempo,
    destinationToken: token('tempo/usdce', 'USDC.e'),
    capabilities: { depositAddress: true, transfer: { modes: ['exactSource'] } },
    subsidies: { depositAddress: true, transfer: true },
  },
  {
    id: 'tempo-usdt0-tron-usdt',
    sourceChain: tempo,
    sourceToken: token('tempo/usdt0', 'USDT0'),
    destinationChain: chain('tron:0x2b6653dc', 'Tron', 'base58check'),
    destinationToken: token('tron/usdt', 'USDT'),
    capabilities: { transfer: { modes: ['exactSource'] } },
    subsidies: { transfer: false },
  },
  {
    id: 'tempo-usdce-tempo-usdy',
    sourceChain: tempo,
    sourceToken: token('tempo/usdce', 'USDC.e'),
    destinationChain: tempo,
    destinationToken: token('tempo/usdy', 'USDY'),
    capabilities: { transfer: { modes: ['exactSource'] } },
    subsidies: { transfer: false },
  },
]

test('lists every route with funding methods and fee coverage, and filters them', async ({
  page,
}) => {
  await page.route('https://api.tempo.xyz/v1/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname !== '/v1/routes') return route.abort()
    await route.fulfill({
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify({ data: routes, nextCursor: null }),
    })
  })
  await page.goto('/docs/routes/networks')
  const table = page.getByTestId('supported-routes')
  // The directory loads on hydration, which can be slow on a cold server.
  await expect(table).toContainText('3 routes', { timeout: 30_000 })
  await expect(table.locator('tbody tr')).toHaveCount(3)

  const base = table.locator('tbody tr').filter({ hasText: 'Base' })
  await expect(base).toContainText('Transfer · Deposit address')
  await expect(base).toContainText('Available')
  await expect(table.locator('tbody tr').filter({ hasText: 'Tron' })).toContainText('Not available')

  await table.getByLabel('Network').selectOption({ label: 'Tron' })
  await expect(table.locator('tbody tr')).toHaveCount(1)
  await expect(table).toContainText('1 of 3 routes')
  await table.getByLabel('Network').selectOption({ label: 'All networks' })
  await table.getByLabel('Destination').selectOption({ label: 'USDY · Tempo' })
  await expect(table.locator('tbody tr')).toHaveCount(1)
  await expect(table.locator('tbody tr')).toContainText('USDC.e')
})
