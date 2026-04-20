#!/usr/bin/env node
/**
 * Bundle size analysis and diff tool for the docs site (Vocs/Waku)
 *
 * Scans built JS files in dist/public/assets/ and measures raw + brotli sizes.
 * Groups chunks into: framework, heavy-deps, app.
 *
 * Usage:
 *   node --experimental-strip-types scripts/bundle-diff.ts
 *   node --experimental-strip-types scripts/bundle-diff.ts --save
 *   node --experimental-strip-types scripts/bundle-diff.ts --ci
 *
 * CLI flags:
 *   --ci                                - Output markdown for GitHub PR comments
 *   --save                              - Save current sizes as baseline
 *   --baseline <file>                   - Read baseline from specific file path
 *   --output <file>                     - Write current stats to file (for caching)
 *   --skip-build                        - Skip build step (use existing dist/)
 */

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { brotliCompressSync, constants } from 'node:zlib'

const ASSETS_DIR = 'dist/public/assets'
const BASELINE_FILE = '.bundle-baseline.json'

const BROTLI_WARNING_KB = 10
const BROTLI_STRONG_WARNING_KB = 25

const HEAVY_DEPS_PATTERNS = [
  /^wagmi/i,
  /^viem/i,
  /^mermaid/i,
  /^monaco/i,
  /^cytoscape/i,
  /^katex/i,
  /^accounts/i,
  /^tanstack/i,
  /^treemap/i,
  /^sql-formatter/i,
  /^QueryClientProvider/,
  /^useQuery/,
  // mermaid sub-diagram chunks
  /Diagram-/,
  /^dagre-/,
  /^cose-bilkent/,
  /^elk-/,
  /^arc-/,
]

const FRAMEWORK_PATTERNS = [
  /^Link-/,
  /^_layout-/,
  /^_mdx-wrapper-/,
  /^client-/,
  /^context-/,
  /^module-/,
  /^facade_vocs/,
  /^Head-/,
  /^layout-/,
  /^MdxPageContext-/,
]

interface CIOptions {
  ci: boolean
  baselinePath: string | null
  outputPath: string | null
  skipBuild: boolean
  save: boolean
}

function parseArgs(args: string[]): CIOptions {
  const options: CIOptions = {
    ci: false,
    baselinePath: null,
    outputPath: null,
    skipBuild: false,
    save: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--ci') {
      options.ci = true
    } else if (arg === '--baseline' && args[i + 1]) {
      options.baselinePath = args[++i]
    } else if (arg === '--output' && args[i + 1]) {
      options.outputPath = args[++i]
    } else if (arg === '--skip-build') {
      options.skipBuild = true
    } else if (arg === '--save') {
      options.save = true
    }
  }

  return options
}

interface ChunkInfo {
  label: string
  size: number
  brotliSize: number
  group: string
}

interface SizeAggregate {
  size: number
  brotli: number
}

interface GroupStats {
  label: string
  aggregate: SizeAggregate
}

interface BundleStats {
  timestamp: string
  total: SizeAggregate
  groups: GroupStats[]
  chunks: ChunkInfo[]
}

function formatBytes(
  bytes: number,
  signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'auto',
): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  const value = bytes / k ** i
  const formatted = new Intl.NumberFormat('en', {
    signDisplay,
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)
  return `${formatted} ${sizes[i]}`
}

function formatDelta(current: number, baseline: number): string {
  return formatBytes(current - baseline, 'exceptZero')
}

function categorize(filename: string): string {
  if (HEAVY_DEPS_PATTERNS.some((p) => p.test(filename))) return 'heavy-deps'
  if (FRAMEWORK_PATTERNS.some((p) => p.test(filename))) return 'framework'
  return 'app'
}

function parseStats(assetsDir: string): BundleStats {
  const absDir = resolve(process.cwd(), assetsDir)
  const files = readdirSync(absDir).filter((f) => f.endsWith('.js'))

  const chunks: ChunkInfo[] = []

  for (const file of files) {
    const filePath = join(absDir, file)
    const raw = readFileSync(filePath)
    const rawSize = statSync(filePath).size
    const brotli = brotliCompressSync(raw, {
      params: { [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY },
    })

    chunks.push({
      label: file,
      size: rawSize,
      brotliSize: brotli.length,
      group: categorize(file),
    })
  }

  chunks.sort((a, b) => b.brotliSize - a.brotliSize)

  const aggregate = (group: string): SizeAggregate =>
    chunks
      .filter((c) => c.group === group)
      .reduce(
        (acc, chunk) => ({
          size: acc.size + chunk.size,
          brotli: acc.brotli + chunk.brotliSize,
        }),
        { size: 0, brotli: 0 },
      )

  const total: SizeAggregate = chunks.reduce(
    (acc, chunk) => ({
      size: acc.size + chunk.size,
      brotli: acc.brotli + chunk.brotliSize,
    }),
    { size: 0, brotli: 0 },
  )

  const groupLabels = ['framework', 'heavy-deps', 'app'] as const
  const groups: GroupStats[] = groupLabels.map((label) => ({
    label,
    aggregate: aggregate(label),
  }))

  return {
    timestamp: new Date().toISOString(),
    total,
    groups,
    chunks,
  }
}

function findBaselineGroup(baseline: BundleStats, label: string): SizeAggregate | null {
  return baseline.groups.find((g) => g.label === label)?.aggregate ?? null
}

function printReport(current: BundleStats, baseline: BundleStats | null, options: CIOptions): void {
  if (options.ci) {
    printMarkdownReport(current, baseline)
  } else {
    printTerminalReport(current, baseline)
  }
}

function printTerminalReport(current: BundleStats, baseline: BundleStats | null): void {
  console.log(`\n${'='.repeat(60)}`)
  console.log('Docs Bundle Size Analysis')
  console.log('='.repeat(60))

  console.log('\nAll sizes are brotli-compressed.\n')

  console.log('Current Build:')
  console.log(`  Total: ${formatBytes(current.total.brotli)}`)
  for (const { label, aggregate } of current.groups) {
    console.log(`  ${label}: ${formatBytes(aggregate.brotli)}`)
  }

  if (baseline) {
    console.log('\nBaseline:')
    console.log(`  Total: ${formatBytes(baseline.total.brotli)}`)
    for (const { label } of current.groups) {
      const bg = findBaselineGroup(baseline, label)
      console.log(`  ${label}: ${bg ? formatBytes(bg.brotli) : '—'}`)
    }

    console.log('\nDelta:')
    console.log(`  Total: ${formatDelta(current.total.brotli, baseline.total.brotli)}`)
    for (const { label, aggregate } of current.groups) {
      const bg = findBaselineGroup(baseline, label)
      console.log(`  ${label}: ${bg ? formatDelta(aggregate.brotli, bg.brotli) : '—'}`)
    }
  }

  for (const groupLabel of ['framework', 'heavy-deps', 'app'] as const) {
    const groupChunks = current.chunks.filter((c) => c.group === groupLabel)
    if (groupChunks.length === 0) continue

    console.log(`\n  ${groupLabel} chunks (${groupChunks.length}):`)
    for (const chunk of groupChunks.slice(0, 10)) {
      const name = chunk.label.padEnd(50)
      console.log(
        `    ${name} ${formatBytes(chunk.brotliSize).padStart(10)}  (raw: ${formatBytes(chunk.size)})`,
      )
    }
    if (groupChunks.length > 10) {
      console.log(`    ... and ${groupChunks.length - 10} more ${groupLabel} chunks`)
    }
  }

  if (!baseline) {
    console.log('\n  No baseline found. Run with --save to save current as baseline.')
  }

  console.log(`\n${'='.repeat(60)}\n`)
}

function printMarkdownReport(current: BundleStats, baseline: BundleStats | null): void {
  let output = ''

  output += '> All sizes are brotli-compressed.\n\n'

  if (baseline) {
    const totalDelta = current.total.brotli - baseline.total.brotli
    const emoji = totalDelta > 0 ? '📈' : totalDelta < 0 ? '📉' : '➡️'

    output += `${emoji} **Total:** ${formatBytes(current.total.brotli)} (${formatBytes(totalDelta, 'exceptZero')})\n\n`

    output += '| | Current | Baseline | Delta |\n'
    output += '|--|---------|----------|-------|\n'
    output += `| Total | ${formatBytes(current.total.brotli)} | ${formatBytes(baseline.total.brotli)} | ${formatDelta(current.total.brotli, baseline.total.brotli)} |\n`
    for (const { label, aggregate } of current.groups) {
      const bg = findBaselineGroup(baseline, label)
      if (bg) {
        output += `| ${label} | ${formatBytes(aggregate.brotli)} | ${formatBytes(bg.brotli)} | ${formatDelta(aggregate.brotli, bg.brotli)} |\n`
      } else {
        output += `| ${label} | ${formatBytes(aggregate.brotli)} | — | — |\n`
      }
    }

    const deltaKb = totalDelta / 1024
    if (deltaKb > BROTLI_STRONG_WARNING_KB) {
      output += `\n> [!WARNING]\n> Total bundle increased by ${deltaKb.toFixed(1)} KB (exceeds ${BROTLI_STRONG_WARNING_KB} KB)!\n`
    } else if (deltaKb > BROTLI_WARNING_KB) {
      output += `\n> [!NOTE]\n> Total bundle increased by ${deltaKb.toFixed(1)} KB (exceeds ${BROTLI_WARNING_KB} KB)\n`
    }
  } else {
    output += `**Total:** ${formatBytes(current.total.brotli)}\n\n`
    output += '| | Size |\n'
    output += '|--|------|\n'
    output += `| Total | ${formatBytes(current.total.brotli)} |\n`
    for (const { label, aggregate } of current.groups) {
      output += `| ${label} | ${formatBytes(aggregate.brotli)} |\n`
    }
    output += '\n*No baseline available for comparison*\n'
  }

  for (const groupLabel of ['framework', 'heavy-deps', 'app'] as const) {
    const groupChunks = current.chunks.filter((c) => c.group === groupLabel)
    if (groupChunks.length === 0) continue

    output += `\n<details>\n<summary>${groupLabel} chunks (${groupChunks.length})</summary>\n\n`
    output += '| Chunk | Size | Raw |\n'
    output += '|-------|------|-----|\n'
    for (const chunk of groupChunks) {
      const name = chunk.label.length > 45 ? `${chunk.label.slice(0, 42)}...` : chunk.label
      output += `| \`${name}\` | ${formatBytes(chunk.brotliSize)} | ${formatBytes(chunk.size)} |\n`
    }
    output += '\n</details>\n'
  }

  console.log(output)
}

async function main() {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  if (!options.skipBuild) {
    console.log('Building docs site...')
    execSync('pnpm build', { stdio: 'inherit' })
  }

  const assetsDir = resolve(process.cwd(), ASSETS_DIR)

  if (!existsSync(assetsDir)) {
    console.error(`Assets directory not found: ${assetsDir}`)
    console.error('Make sure to build first: pnpm build')
    process.exit(1)
  }

  const current = parseStats(ASSETS_DIR)

  if (options.outputPath) {
    writeFileSync(options.outputPath, JSON.stringify(current, null, 2))
    console.log(`Stats written to ${options.outputPath}`)
    return
  }

  if (options.save) {
    writeFileSync(BASELINE_FILE, JSON.stringify(current, null, 2))
    console.log(`Baseline saved to ${BASELINE_FILE}`)
    printReport(current, null, options)
    return
  }

  let baseline: BundleStats | null = null

  if (options.baselinePath && existsSync(options.baselinePath)) {
    baseline = JSON.parse(readFileSync(options.baselinePath, 'utf-8')) as BundleStats
  } else if (existsSync(BASELINE_FILE)) {
    baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf-8')) as BundleStats
  }

  printReport(current, baseline, options)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
