#!/usr/bin/env node
/**
 * Lighthouse performance measurement for the docs site.
 *
 * Usage:
 *   # Build + preview, then run against preview server:
 *   pnpm build && pnpm preview &
 *   pnpm lighthouse --url http://localhost:4173
 *
 *   # Or against dev server (may 500 in headless Chrome):
 *   pnpm lighthouse --url https://localhost:5173
 *
 *   # Save baseline, make changes, compare:
 *   pnpm lighthouse --save baseline.json
 *   pnpm lighthouse --compare baseline.json
 *
 *   # Mobile throttling:
 *   pnpm lighthouse:mobile
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const DEFAULT_PAGES = [
  '/',
  '/guide/issuance/create-a-stablecoin',
  '/guide/payments/send-a-payment',
  '/guide/stablecoin-dex/executing-swaps',
  '/guide/stablecoin-dex/providing-liquidity',
  '/guide/machine-payments/client',
]

interface PageResult {
  page: string
  performance: number
  fcp: number
  lcp: number
  tbt: number
  cls: number
  tti: number
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2)
  const flags = {
    url: 'https://localhost:5173',
    pages: DEFAULT_PAGES,
    mobile: false,
    json: false,
    compare: '',
    save: '',
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        flags.url = args[++i]
        break
      case '--pages':
        flags.pages = args[++i].split(',')
        break
      case '--mobile':
        flags.mobile = true
        break
      case '--json':
        flags.json = true
        break
      case '--compare':
        flags.compare = args[++i]
        break
      case '--save':
        flags.save = args[++i]
        break
    }
  }

  return flags
}

const LH_OUTPUT = '/tmp/lighthouse-result.json'

function runLighthouse(url: string, mobile: boolean): any | null {
  const preset = mobile ? 'perf' : 'desktop'
  // Run npx from /tmp to avoid devEngines conflicts in the docs package.json
  // Use --output-path to avoid pipe truncation on large JSON output
  const cmd = `npx lighthouse "${url}" --output=json --output-path=${LH_OUTPUT} --chrome-flags="--headless --no-sandbox --ignore-certificate-errors" --preset=${preset} --quiet`

  try {
    execSync(cmd, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: '/tmp',
    })
    const raw = readFileSync(LH_OUTPUT, 'utf-8')
    const report = JSON.parse(raw)

    // Check for runtime errors (e.g., page returned 500)
    if (report.runtimeError?.code) {
      console.error(`  ✗ ${report.runtimeError.message.split('.')[0]}`)
      return null
    }

    return report
  } catch (err) {
    console.error(`  ✗ Lighthouse failed for ${url}`)
    if (err instanceof Error) {
      const stderr = (err as any).stderr?.toString() || ''
      const meaningful = stderr
        .split('\n')
        .filter((l: string) => !l.includes('npm warn') && l.trim())
        .slice(0, 3)
        .join('\n    ')
      if (meaningful) console.error(`    ${meaningful}`)
    }
    return null
  }
}

function extractMetrics(report: any, page: string): PageResult {
  const score = Math.round((report.categories?.performance?.score ?? 0) * 100)
  const audits = report.audits ?? {}

  return {
    page,
    performance: score,
    fcp: audits['first-contentful-paint']?.numericValue ?? 0,
    lcp: audits['largest-contentful-paint']?.numericValue ?? 0,
    tbt: audits['total-blocking-time']?.numericValue ?? 0,
    cls: audits['cumulative-layout-shift']?.numericValue ?? 0,
    tti: audits.interactive?.numericValue ?? 0,
  }
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

function formatCls(cls: number): string {
  return cls.toFixed(3)
}

function pad(str: string, len: number, right = false): string {
  if (right) return str.padStart(len)
  return str.padEnd(len)
}

function printTable(results: PageResult[]) {
  const pageWidth = Math.max(40, ...results.map((r) => r.page.length + 2))

  const header = `${pad('Page', pageWidth)}${pad('Perf', 7, true)}${pad('FCP', 9, true)}${pad('LCP', 9, true)}${pad('TBT', 9, true)}${pad('CLS', 8, true)}`
  console.log(header)
  console.log('─'.repeat(header.length))

  for (const r of results) {
    const line = `${pad(r.page, pageWidth)}${pad(String(r.performance), 7, true)}${pad(formatMs(r.fcp), 9, true)}${pad(formatMs(r.lcp), 9, true)}${pad(formatMs(r.tbt), 9, true)}${pad(formatCls(r.cls), 8, true)}`
    console.log(line)
  }
}

function colorDelta(value: number, lowerIsBetter: boolean): string {
  const sign = value > 0 ? '+' : ''
  const formatted = `${sign}${value.toFixed(1)}`

  // Green = improvement, Red = regression
  const improved = lowerIsBetter ? value < 0 : value > 0
  const regressed = lowerIsBetter ? value > 0 : value < 0

  if (improved) return `\x1b[32m${formatted}\x1b[0m`
  if (regressed) return `\x1b[31m${formatted}\x1b[0m`
  return formatted
}

function printComparison(current: PageResult[], baseline: PageResult[]) {
  const baselineMap = new Map(baseline.map((r) => [r.page, r]))
  const pageWidth = Math.max(40, ...current.map((r) => r.page.length + 2))

  const header = `${pad('Page', pageWidth)}${pad('Perf', 12, true)}${pad('FCP', 16, true)}${pad('LCP', 16, true)}${pad('TBT', 16, true)}${pad('CLS', 14, true)}`
  console.log(header)
  console.log('─'.repeat(header.length))

  for (const r of current) {
    const b = baselineMap.get(r.page)
    if (!b) {
      console.log(`${pad(r.page, pageWidth)}  (new page, no baseline)`)
      continue
    }

    const perfDelta = r.performance - b.performance
    const fcpDelta = r.fcp - b.fcp
    const lcpDelta = r.lcp - b.lcp
    const tbtDelta = r.tbt - b.tbt
    const clsDelta = r.cls - b.cls

    const line =
      `${pad(r.page, pageWidth)}` +
      `${pad(`${r.performance} (${colorDelta(perfDelta, false)})`, 12, true)}` +
      `${pad(`${formatMs(r.fcp)} (${colorDelta(fcpDelta, true)})`, 16, true)}` +
      `${pad(`${formatMs(r.lcp)} (${colorDelta(lcpDelta, true)})`, 16, true)}` +
      `${pad(`${formatMs(r.tbt)} (${colorDelta(tbtDelta, true)})`, 16, true)}` +
      `${pad(`${formatCls(r.cls)} (${colorDelta(clsDelta, true)})`, 14, true)}`

    console.log(line)
  }
}

function main() {
  const flags = parseArgs(process.argv)

  console.log(`\n🔦 Lighthouse Performance Audit`)
  console.log(`   Base URL: ${flags.url}`)
  console.log(`   Mode: ${flags.mobile ? 'mobile' : 'desktop'}`)
  console.log(`   Pages: ${flags.pages.length}\n`)

  const results: PageResult[] = []

  for (const page of flags.pages) {
    const fullUrl = `${flags.url.replace(/\/$/, '')}${page}`
    process.stdout.write(`  Testing ${page} ... `)

    const report = runLighthouse(fullUrl, flags.mobile)
    if (!report) {
      results.push({ page, performance: 0, fcp: 0, lcp: 0, tbt: 0, cls: 0, tti: 0 })
      continue
    }

    const metrics = extractMetrics(report, page)
    results.push(metrics)
    console.log(`✓ ${metrics.performance}/100`)
  }

  console.log('')

  if (flags.compare) {
    const baseline: PageResult[] = JSON.parse(readFileSync(flags.compare, 'utf-8'))
    printComparison(results, baseline)
  } else {
    printTable(results)
  }

  if (flags.save) {
    writeFileSync(flags.save, JSON.stringify(results, null, 2))
    console.log(`\n💾 Results saved to ${flags.save}`)
  }

  if (flags.json) {
    console.log(`\n${JSON.stringify(results, null, 2)}`)
  }
}

main()
