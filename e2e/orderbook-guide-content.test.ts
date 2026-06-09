import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('orderbook guide uses post-T5 flipped order state', () => {
  const guide = readFileSync(
    join(__dirname, '..', 'src', 'pages', 'guide', 'stablecoin-dex', 'view-the-orderbook.mdx'),
    'utf-8',
  )

  expect(guide).not.toContain('Coming with T5')
  expect(guide).not.toContain('pre-T5 examples')
  expect(guide).not.toContain('Until T5 activates')

  expect(guide).toContain(':::info[Changed with T5]')
  expect(guide).toContain('FROM orderflipped')
  expect(guide).toContain('latest_order_state')

  const indexSupplyQueries = guide.match(/<IndexSupplyQuery[\s\S]*?\/>/g) ?? []
  expect(indexSupplyQueries.length).toBeGreaterThan(0)

  const activeBookQueries = indexSupplyQueries.filter((query) => query.includes('latest_order_state'))
  expect(activeBookQueries).toHaveLength(3)
  for (const query of activeBookQueries) {
    expect(query).toContain('FROM orderflipped')
    expect(query).toContain('"OrderFlipped"')
    expect(query).toContain('orderfilled.block_num > latest_order_state.block_num')
  }

  const recentTradesQuery = indexSupplyQueries.find((query) =>
    query.includes("title={'Recent Trade Prices for USDC.e'}"),
  )
  expect(recentTradesQuery).toBeDefined()
  expect(recentTradesQuery).toContain('FROM orderflipped')
  expect(recentTradesQuery).toContain('"OrderFlipped"')
})
