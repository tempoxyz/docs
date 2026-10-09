import { relative } from 'node:path'
import type { FullConfig, Reporter, Suite } from '@playwright/test/reporter'

// Shard each project independently so the small, slow live-testnet project
// doesn't all land on the last shard of the much larger browser suite.
export default class ShardReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    const shard = Number(process.env.E2E_SHARD)
    const count = Number(process.env.E2E_SHARDS)
    if (!Number.isInteger(shard) || !Number.isInteger(count) || shard < 1 || shard > count)
      throw new Error('E2E_SHARD must be a positive integer no greater than E2E_SHARDS')

    for (const project of suite.suites) {
      for (const [index, test] of project.allTests().entries()) {
        if (index % count !== shard - 1) continue
        const file = relative(config.rootDir, test.location.file).replaceAll('\\', '/')
        console.log([`[${project.title}]`, file, ...test.titlePath().slice(3)].join(' › '))
      }
    }
  }
}
