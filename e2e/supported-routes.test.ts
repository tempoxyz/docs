import { expect, type Page, test } from '@playwright/test'

const cors = { 'access-control-allow-origin': '*' }
const chain = (id: string, name: string, addressFormat = 'hex') => ({ id, name, addressFormat })
const token = (tokenKey: string, symbol: string) => ({ tokenKey, symbol, decimals: 6 })
const tempo = chain('eip155:4217', 'Tempo')
type Route = {
  id: string
  sourceChain: ReturnType<typeof chain>
  sourceToken: ReturnType<typeof token>
  destinationChain: ReturnType<typeof chain>
  destinationToken: ReturnType<typeof token>
  capabilities: { depositAddress?: boolean; transfer?: { modes: string[] } }
  subsidies: { depositAddress?: boolean; transfer?: boolean }
}
const routes: Route[] = [
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
  {
    id: 'polygon-usdt-tempo-usdt0',
    sourceChain: chain('eip155:137', 'Polygon'),
    sourceToken: token('polygon/usdt', 'USDT'),
    destinationChain: tempo,
    destinationToken: token('tempo/usdt0', 'USDT0'),
    capabilities: { depositAddress: true, transfer: { modes: ['exactSource'] } },
    subsidies: { depositAddress: true, transfer: false },
  },
]

const supports = (route: Route, method: string) =>
  method === 'transfer'
    ? !!route.capabilities.transfer?.modes.length
    : !!route.capabilities.depositAddress
const subsidized = (route: Route, method?: string) =>
  method === 'transfer' || method === 'depositAddress'
    ? !!route.subsidies[method]
    : !!(route.subsidies.transfer || route.subsidies.depositAddress)

/** Answers `GET /v1/routes` the way the API applies its filters, and records each query. */
async function mockDirectory(page: Page) {
  const queries: Record<string, string>[] = []
  await page.route('https://api.tempo.xyz/v1/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname !== '/v1/routes') return route.abort()
    const query = Object.fromEntries(url.searchParams)
    queries.push(query)
    const { sourceChain, sourceToken, destinationChain, destinationToken, method, subsidies } =
      query
    const data = routes.filter(
      (r) =>
        (!sourceChain || r.sourceChain.id === sourceChain) &&
        (!sourceToken || r.sourceToken.tokenKey === sourceToken) &&
        (!destinationChain || r.destinationChain.id === destinationChain) &&
        (!destinationToken || r.destinationToken.tokenKey === destinationToken) &&
        (!method || supports(r, method)) &&
        (!subsidies || subsidized(r, method) === (subsidies === 'true')),
    )
    await route.fulfill({
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify({ data, nextCursor: null }),
    })
  })
  return queries
}

async function openTable(page: Page) {
  await page.goto('/docs/routes/networks')
  const table = page.getByTestId('supported-routes')
  // The directory loads on hydration, which can be slow on a cold server.
  await expect(table).toContainText('4 routes', { timeout: 30_000 })
  const select = (name: string) => table.getByLabel(name, { exact: true })
  return {
    table,
    rows: table.locator('tbody tr'),
    select,
    options: (name: string) => select(name).locator('option').allTextContents(),
  }
}

test('lists every route with funding methods and fixed rates', async ({ page }) => {
  await mockDirectory(page)
  const { table, rows } = await openTable(page)
  await expect(rows).toHaveCount(4)
  await expect(table.locator('thead')).toContainText('Fixed rates')

  const base = rows.filter({ hasText: 'Base' })
  await expect(base).toContainText('Transfer · Deposit address')
  await expect(base).toContainText('Available')
  await expect(rows.filter({ hasText: 'Tron' })).toContainText('Not available')

  await expect(table.locator('footer')).toHaveText(
    'Fixed rates make 1:1 or 1:par execution available for stablecoin payments or asset conversion. Access from the Tempo API Console. Contact for eligibility.',
  )
  await expect(table.getByRole('link', { name: 'Tempo API Console' })).toHaveAttribute(
    'href',
    'https://console.tempo.xyz',
  )
  await expect(table.getByRole('link', { name: 'Contact' })).toHaveAttribute(
    'href',
    'https://tempo.xyz/contact',
  )
})

test('filters with the directory API, offers only choices with routes, and resets', async ({
  page,
}) => {
  const queries = await mockDirectory(page)
  const { table, rows, select, options } = await openTable(page)

  // A destination asks the API for its network and token, and narrows the other selectors.
  await select('Destination').selectOption({ label: 'USDY · Tempo' })
  await expect(table).toContainText('1 of 4 routes')
  await expect(rows).toHaveCount(1)
  expect(queries.at(-1)).toMatchObject({
    destinationChain: 'eip155:4217',
    destinationToken: 'tempo/usdy',
  })
  expect(await options('Source')).toEqual(['All sources', 'USDC.e · Tempo'])
  expect(await options('Fixed rates')).toEqual(['Any', 'Not available'])

  // Each selector clears on its own.
  await table.getByRole('button', { name: 'Clear destination filter' }).click()
  await expect(rows).toHaveCount(4)
  await expect(table).not.toContainText('of 4 routes')
  await expect(table.getByRole('button', { name: 'Clear destination filter' })).toHaveCount(0)

  // Funding and fixed rates use the API's method and subsidies filters.
  await select('Funding').selectOption({ label: 'Deposit address' })
  await expect(rows).toHaveCount(2)
  await select('Fixed rates').selectOption({ label: 'Available' })
  await expect(table).toContainText('2 of 4 routes')
  expect(queries.at(-1)).toMatchObject({ method: 'depositAddress', subsidies: 'true' })
  expect(await options('Fixed rates')).toEqual(['Any', 'Available'])

  // Reset shows every route again.
  await table.getByRole('button', { name: 'Reset' }).click()
  await expect(rows).toHaveCount(4)
  await expect(table).not.toContainText('of 4 routes')
  await expect(table.getByRole('button', { name: 'Reset' })).toHaveCount(0)
  for (const name of ['Source', 'Destination', 'Funding', 'Fixed rates'])
    await expect(select(name)).toHaveValue('')
})

test('never filters down to no routes', async ({ page }) => {
  const queries = await mockDirectory(page)
  const { table, rows, select } = await openTable(page)

  // Polygon's transfers have no fixed rates, but its deposit addresses do.
  await select('Source').selectOption({ label: 'USDT · Polygon' })
  await select('Funding').selectOption({ label: 'Transfer' })
  await select('Fixed rates').selectOption({ label: 'Not available' })
  await expect(table).toContainText('1 of 4 routes')

  // Without a funding method, "not available" would mean neither method, which leaves nothing,
  // so clearing the method clears fixed rates too.
  await table.getByRole('button', { name: 'Clear funding filter' }).click()
  await expect(select('Fixed rates')).toHaveValue('')
  await expect(rows).toHaveCount(1)
  await expect(table).toContainText('1 of 4 routes')
  expect(queries.at(-1)).toEqual({
    sourceChain: 'eip155:137',
    sourceToken: 'polygon/usdt',
    limit: '50',
  })
})
