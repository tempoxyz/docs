import { basename, relative } from 'node:path'
import type { FullConfig, Reporter, Suite, TestCase } from '@playwright/test/reporter'

// Approximate seconds from CI, used only for scheduling (never timeouts or filtering).
// New live tests get a conservative default cost and are still included automatically.
const liveCosts: Record<string, number> = {
  'pay-with-ousd-fees.test.ts': 26,
  'use-for-fees.test.ts': 19,
  'manage-stablecoin.test.ts': 13,
  'executing-swaps.test.ts': 12,
  'mint-stablecoins.test.ts': 11,
  'create-a-stablecoin.test.ts': 11,
  'faucet.test.ts': 10,
  'providing-liquidity.test.ts': 9,
  'ousd-zone-deposit.test.ts': 8,
  'send-a-payment.test.ts': 7,
  'virtual-addresses.test.ts': 3,
}

export function partitionByCost<T>(items: readonly T[], count: number, cost: (item: T) => number) {
  if (!Number.isInteger(count) || count < 1) throw new Error('Shard count must be positive')
  const buckets = Array.from({ length: count }, () => ({ items: [] as T[], cost: 0 }))
  for (const item of [...items].sort((a, b) => cost(b) - cost(a))) {
    const bucket = buckets.reduce((best, next) =>
      next.cost < best.cost || (next.cost === best.cost && next.items.length < best.items.length)
        ? next
        : best,
    )
    bucket.items.push(item)
    bucket.cost += cost(item)
  }
  return buckets.map((bucket) => bucket.items)
}

// Balance each project independently so live-testnet work doesn't all land on
// the last shard. Start the expensive live flows while browser checks run alongside.
export default class ShardReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    const shard = Number(process.env.E2E_SHARD)
    const count = Number(process.env.E2E_SHARDS)
    if (!Number.isInteger(shard) || !Number.isInteger(count) || shard < 1 || shard > count)
      throw new Error('E2E_SHARD must be a positive integer no greater than E2E_SHARDS')

    for (const project of suite.suites) {
      const cost = (test: TestCase) => {
        if (project.title !== 'chromium-live') return 1
        if (test.expectedStatus === 'skipped') return 0
        return liveCosts[basename(test.location.file)] ?? 10
      }
      const selected = partitionByCost(project.allTests(), count, cost)[shard - 1]
      for (const test of selected) {
        const file = relative(config.rootDir, test.location.file).replaceAll('\\', '/')
        console.log([`[${project.title}]`, file, ...test.titlePath().slice(3)].join(' › '))
      }
    }
  }
}
