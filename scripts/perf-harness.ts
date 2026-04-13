#!/usr/bin/env node
/**
 * Route-level performance harness for the docs site.
 *
 * Builds and previews the site by default, runs Lighthouse multiple times per
 * route, captures the median metrics, and records a no-interaction network
 * profile with Playwright to spot eager off-route fetches.
 *
 * Usage:
 *   pnpm perf:harness
 *   pnpm perf:harness --pages /,/quickstart/faucet --runs 5
 *   pnpm perf:harness --save perf-baseline.json
 *   pnpm perf:harness --compare perf-baseline.json
 *   pnpm perf:harness --url http://localhost:3001 --skip-build
 */

import { type ChildProcess, execSync, spawn } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { brotliCompressSync, constants } from 'node:zlib'
import { chromium } from '@playwright/test'

const DEFAULT_BASE_URL = 'http://localhost:3001'
const DEFAULT_PAGES = [
  '/',
  '/quickstart/faucet',
  '/guide/payments/send-a-payment',
  '/guide/stablecoin-dex/providing-liquidity',
]
const LIGHTHOUSE_OUTPUT = '/tmp/docs-perf-harness-lighthouse.json'
const ASSETS_DIR = 'dist/public/assets'
const STARTUP_TIMEOUT_MS = 120_000

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

interface Flags {
  url: string
  pages: string[]
  mobile: boolean
  runs: number
  compare: string
  save: string
  skipBuild: boolean
  skipBundle: boolean
}

interface LighthouseMetrics {
  performance: number
  fcp: number
  lcp: number
  tbt: number
  cls: number
  tti: number
}

interface LighthouseAudit {
  numericValue?: number | undefined
}

interface LighthouseReport {
  audits?: Record<string, LighthouseAudit> | undefined
  categories?:
    | {
        performance?:
          | {
              score?: number | null | undefined
            }
          | undefined
      }
    | undefined
  runtimeError?:
    | {
        code?: string | undefined
      }
    | undefined
}

interface NetworkEntry {
  bytes: number
  category: string
  contentType: string
  url: string
}

interface NetworkAggregate {
  bytes: number
  category: string
  requests: number
}

interface NetworkSummary {
  byCategory: NetworkAggregate[]
  offRouteBytes: number
  offRouteRequests: number
  topOffRouteRequests: Array<{ bytes: number; contentType: string; url: string }>
  totalBytes: number
  totalRequests: number
}

interface NavigationTarget {
  href: string
  text: string
}

interface NavigationMetrics {
  coldClick: number
  intentClick: number
  target?: NavigationTarget | undefined
}

interface RouteResult {
  lighthouse: LighthouseMetrics
  navigation?: NavigationMetrics | undefined
  network: NetworkSummary
  page: string
}

interface BundleChunk {
  bytes: number
  group: 'app' | 'framework' | 'heavy-deps'
  label: string
}

interface BundleSummary {
  byGroup: Array<{ bytes: number; group: 'app' | 'framework' | 'heavy-deps' }>
  totalBytes: number
  topChunks: BundleChunk[]
}

interface Report {
  baseUrl: string
  bundle?: BundleSummary | undefined
  createdAt: string
  mobile: boolean
  routes: RouteResult[]
  runs: number
}

function parseArgs(argv: string[]): Flags {
  const args = argv.slice(2)
  const flags: Flags = {
    url: '',
    pages: DEFAULT_PAGES,
    mobile: false,
    runs: 3,
    compare: '',
    save: '',
    skipBuild: false,
    skipBundle: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        flags.url = args[++i] || ''
        break
      case '--pages':
        flags.pages = (args[++i] || '').split(',').filter(Boolean)
        break
      case '--mobile':
        flags.mobile = true
        break
      case '--runs':
        flags.runs = Math.max(1, Number(args[++i] || '1'))
        break
      case '--compare':
        flags.compare = args[++i] || ''
        break
      case '--save':
        flags.save = args[++i] || ''
        break
      case '--skip-build':
        flags.skipBuild = true
        break
      case '--skip-bundle':
        flags.skipBundle = true
        break
    }
  }

  return flags
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatCls(cls: number): string {
  return cls.toFixed(3)
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2
  return sorted[middle] || 0
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function categoryForChunk(label: string): 'app' | 'framework' | 'heavy-deps' {
  if (HEAVY_DEPS_PATTERNS.some((pattern) => pattern.test(label))) return 'heavy-deps'
  if (FRAMEWORK_PATTERNS.some((pattern) => pattern.test(label))) return 'framework'
  return 'app'
}

function bundleSummary(): BundleSummary | undefined {
  const assetsDir = resolve(process.cwd(), ASSETS_DIR)
  if (!existsSync(assetsDir)) return undefined

  const chunks = readdirSync(assetsDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => {
      const filePath = join(assetsDir, file)
      const raw = readFileSync(filePath)
      const compressed = brotliCompressSync(raw, {
        params: { [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY },
      })

      return {
        bytes: compressed.length,
        group: categoryForChunk(file),
        label: file,
      } satisfies BundleChunk
    })
    .sort((a, b) => b.bytes - a.bytes)

  return {
    byGroup: (['framework', 'heavy-deps', 'app'] as const).map((group) => ({
      bytes: chunks
        .filter((chunk) => chunk.group === group)
        .reduce((sum, chunk) => sum + chunk.bytes, 0),
      group,
    })),
    totalBytes: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
    topChunks: chunks.slice(0, 10),
  }
}

function runLighthouse(url: string, mobile: boolean): LighthouseReport | null {
  const preset = mobile ? 'perf' : 'desktop'
  const command =
    `npx lighthouse "${url}" --output=json --output-path=${LIGHTHOUSE_OUTPUT} ` +
    `--chrome-flags="--headless --no-sandbox --ignore-certificate-errors" --preset=${preset} --quiet`

  try {
    execSync(command, {
      cwd: '/tmp',
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const report = JSON.parse(readFileSync(LIGHTHOUSE_OUTPUT, 'utf-8')) as LighthouseReport
    if (report.runtimeError?.code) return null
    return report
  } catch {
    return null
  }
}

function extractLighthouseMetrics(report: LighthouseReport): LighthouseMetrics {
  const audits = report.audits ?? {}
  return {
    performance: Math.round((report.categories?.performance?.score ?? 0) * 100),
    fcp: audits['first-contentful-paint']?.numericValue ?? 0,
    lcp: audits['largest-contentful-paint']?.numericValue ?? 0,
    tbt: audits['total-blocking-time']?.numericValue ?? 0,
    cls: audits['cumulative-layout-shift']?.numericValue ?? 0,
    tti: audits.interactive?.numericValue ?? 0,
  }
}

async function getSidebarNavigationTarget(page: import('@playwright/test').Page, pagePath: string) {
  const currentPath = normalizePath(new URL(pagePath, 'http://localhost').pathname)

  return await page.evaluate((path) => {
    const normalize = (pathname: string) => {
      if (!pathname || pathname === '/') return '/'
      return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
    }

    const links = Array.from(document.querySelectorAll('a[data-v-sidebar-item]'))
      .map((element) => {
        const href = element.getAttribute('href')
        if (!href || !href.startsWith('/')) return null

        return {
          active: element.hasAttribute('data-active'),
          href,
          path: normalize(new URL(href, window.location.origin).pathname),
          text: element.textContent?.trim() || href,
        }
      })
      .filter((value): value is { active: boolean; href: string; path: string; text: string } =>
        Boolean(value),
      )

    const candidates = links.filter((link) => link.path !== path)
    if (candidates.length === 0) return undefined

    const activeIndex = links.findIndex((link) => link.active || link.path === path)
    if (activeIndex >= 0) {
      for (let i = activeIndex + 1; i < links.length; i++) {
        if (links[i]?.path !== path)
          return { href: links[i]?.href || '', text: links[i]?.text || '' }
      }
      for (let i = activeIndex - 1; i >= 0; i--) {
        if (links[i]?.path !== path)
          return { href: links[i]?.href || '', text: links[i]?.text || '' }
      }
    }

    const candidate = candidates[0]
    return candidate ? { href: candidate.href, text: candidate.text } : undefined
  }, currentPath)
}

async function waitForPathname(page: import('@playwright/test').Page, targetHref: string) {
  const targetPath = normalizePath(new URL(targetHref, 'http://localhost').pathname)

  await page.waitForFunction(
    (expectedPath) => {
      const normalize = (pathname: string) => {
        if (!pathname || pathname === '/') return '/'
        return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
      }

      return normalize(window.location.pathname) === expectedPath
    },
    targetPath,
    { timeout: 30_000 },
  )
}

async function measureNavigationScenario(options: {
  baseUrl: string
  hoverFirst: boolean
  pagePath: string
  target: NavigationTarget
}) {
  const { baseUrl, hoverFirst, pagePath, target } = options
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()

  try {
    await page.goto(new URL(pagePath, `${baseUrl}/`).toString(), { waitUntil: 'networkidle' })

    const selector = `a[data-v-sidebar-item][href="${target.href}"]`
    const targetLink = page.locator(selector).first()
    await targetLink.waitFor({ state: 'visible' })

    if (hoverFirst) {
      await targetLink.hover()
      await page.waitForTimeout(300)
    }

    const startedAt = performance.now()
    await Promise.all([waitForPathname(page, target.href), targetLink.click()])
    await page.waitForLoadState('networkidle').catch(() => {})

    return performance.now() - startedAt
  } finally {
    await context.close()
    await browser.close()
  }
}

async function captureNavigationMetrics(baseUrl: string, pagePath: string, runs: number) {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()

  try {
    await page.goto(new URL(pagePath, `${baseUrl}/`).toString(), { waitUntil: 'networkidle' })
    const target = await getSidebarNavigationTarget(page, pagePath)
    if (!target) return undefined

    const coldRuns: number[] = []
    const intentRuns: number[] = []

    for (let i = 0; i < runs; i++) {
      coldRuns.push(
        await measureNavigationScenario({ baseUrl, hoverFirst: false, pagePath, target }),
      )
      intentRuns.push(
        await measureNavigationScenario({ baseUrl, hoverFirst: true, pagePath, target }),
      )
    }

    return {
      coldClick: median(coldRuns),
      intentClick: median(intentRuns),
      target,
    } satisfies NavigationMetrics
  } finally {
    await context.close()
    await browser.close()
  }
}

async function captureNetworkSummary(baseUrl: string, pagePath: string): Promise<NetworkSummary> {
  const base = new URL(baseUrl)
  const targetUrl = new URL(pagePath, `${base.origin}/`).toString()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()
  const entries: NetworkEntry[] = []
  const pending: Promise<void>[] = []

  page.on('requestfinished', (request) => {
    pending.push(
      (async () => {
        const response = await request.response()
        if (!response) return

        const url = request.url()
        if (url.startsWith('data:')) return

        const headers = response.headers()
        const contentType = headers['content-type']?.split(';')[0] ?? ''
        const requestUrl = new URL(url)
        const isExternal = requestUrl.origin !== base.origin
        const pathname = normalizePath(requestUrl.pathname)
        const currentPage = normalizePath(new URL(pagePath, `${base.origin}/`).pathname)
        const resourceType = request.resourceType()
        const sizes = await request.sizes().catch(() => null)
        const contentLength = Number(headers['content-length'] || '0')
        const bytes =
          (sizes?.responseBodySize || 0) +
            (sizes?.responseHeadersSize || 0) +
            (sizes?.requestHeadersSize || 0) || contentLength

        const category = (() => {
          if (isExternal) return 'third-party'
          if (pathname.startsWith('/assets/') || contentType.includes('javascript')) return 'js'
          if (contentType.includes('text/css') || pathname.endsWith('.css')) return 'css'
          if (resourceType === 'font' || contentType.startsWith('font/')) return 'font'
          if (resourceType === 'image' || contentType.startsWith('image/')) return 'image'
          if (pathname.startsWith('/api/')) return 'api'
          if (pathname === currentPage) return 'current-route'
          return 'off-route'
        })()

        entries.push({ bytes, category, contentType, url })
      })(),
    )
  })

  await page.goto(targetUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await Promise.allSettled(pending)
  await context.close()
  await browser.close()

  const byCategory = Array.from(
    entries.reduce((map, entry) => {
      const aggregate = map.get(entry.category) ?? {
        bytes: 0,
        category: entry.category,
        requests: 0,
      }
      aggregate.bytes += entry.bytes
      aggregate.requests += 1
      map.set(entry.category, aggregate)
      return map
    }, new Map<string, NetworkAggregate>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.bytes - a.bytes)

  const offRoute = entries.filter((entry) => entry.category === 'off-route')

  return {
    byCategory,
    offRouteBytes: offRoute.reduce((sum, entry) => sum + entry.bytes, 0),
    offRouteRequests: offRoute.length,
    topOffRouteRequests: offRoute
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10)
      .map((entry) => ({ bytes: entry.bytes, contentType: entry.contentType, url: entry.url })),
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    totalRequests: entries.length,
  }
}

async function waitForServer(url: string): Promise<void> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500))
  }

  throw new Error(`timed out waiting for preview server at ${url}`)
}

function startPreviewServer(): ChildProcess {
  return spawn('pnpm', ['preview'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function detectPreviewUrl(child: ChildProcess): Promise<string> {
  const stdout = child.stdout
  const stderr = child.stderr
  if (!stdout || !stderr) return DEFAULT_BASE_URL

  return await new Promise((resolvePromise, reject) => {
    const timeout = setTimeout(() => {
      cleanup()
      resolvePromise(DEFAULT_BASE_URL)
    }, 5_000)

    const onStdout = (chunk: Buffer | string) => {
      const output = chunk.toString()
      const match = output.match(/Starting preview server at (https?:\/\/[^\s]+)/)
      if (!match?.[1]) return
      cleanup()
      resolvePromise(match[1])
    }

    const onStderr = (chunk: Buffer | string) => {
      const output = chunk.toString().trim()
      if (!output) return
      cleanup()
      reject(new Error(output))
    }

    const onExit = (code: number | null) => {
      cleanup()
      reject(new Error(`preview server exited early with code ${code ?? 'unknown'}`))
    }

    function cleanup() {
      clearTimeout(timeout)
      stdout.off('data', onStdout)
      stderr.off('data', onStderr)
      child.off('exit', onExit)
    }

    stdout.on('data', onStdout)
    stderr.on('data', onStderr)
    child.on('exit', onExit)
  })
}

function stopPreviewServer(child: ChildProcess | undefined) {
  if (!child || child.killed) return
  child.kill('SIGTERM')
}

function compareNumber(current: number, baseline: number, lowerIsBetter: boolean): string {
  const delta = current - baseline
  const sign = delta > 0 ? '+' : ''
  const good = lowerIsBetter ? delta < 0 : delta > 0
  const bad = lowerIsBetter ? delta > 0 : delta < 0
  const formatted = `${sign}${delta.toFixed(1)}`

  if (good) return `\x1b[32m${formatted}\x1b[0m`
  if (bad) return `\x1b[31m${formatted}\x1b[0m`
  return formatted
}

function printReport(report: Report, baseline?: Report | undefined) {
  console.log('\nDocs Performance Harness')
  console.log(`Base URL: ${report.baseUrl}`)
  console.log(`Mode: ${report.mobile ? 'mobile' : 'desktop'}`)
  console.log(`Runs per route: ${report.runs}`)

  for (const route of report.routes) {
    console.log(`\n${route.page}`)
    console.log(
      `  Lighthouse  perf ${route.lighthouse.performance}  FCP ${formatMs(route.lighthouse.fcp)}  LCP ${formatMs(route.lighthouse.lcp)}  TBT ${formatMs(route.lighthouse.tbt)}  CLS ${formatCls(route.lighthouse.cls)}`,
    )
    console.log(
      `  Network     ${route.network.totalRequests} req  ${formatBytes(route.network.totalBytes)} total  ${route.network.offRouteRequests} off-route req  ${formatBytes(route.network.offRouteBytes)} off-route`,
    )

    const topOffRoute = route.network.topOffRouteRequests.slice(0, 3)
    if (topOffRoute.length > 0) {
      for (const request of topOffRoute) {
        console.log(`    off-route ${formatBytes(request.bytes).padStart(8)}  ${request.url}`)
      }
    }

    if (route.navigation) {
      console.log(
        `  Navigate    cold ${formatMs(route.navigation.coldClick)}  intent ${formatMs(route.navigation.intentClick)}  target ${route.navigation.target?.href ?? 'n/a'}`,
      )
    }

    if (!baseline) continue
    const baselineRoute = baseline.routes.find((item) => item.page === route.page)
    if (!baselineRoute) continue

    console.log(
      `  Delta       perf ${compareNumber(route.lighthouse.performance, baselineRoute.lighthouse.performance, false)}  FCP ${compareNumber(route.lighthouse.fcp, baselineRoute.lighthouse.fcp, true)}  LCP ${compareNumber(route.lighthouse.lcp, baselineRoute.lighthouse.lcp, true)}  off-route bytes ${compareNumber(route.network.offRouteBytes, baselineRoute.network.offRouteBytes, true)}`,
    )

    if (route.navigation && baselineRoute.navigation) {
      console.log(
        `  Nav Delta   cold ${compareNumber(route.navigation.coldClick, baselineRoute.navigation.coldClick, true)}  intent ${compareNumber(route.navigation.intentClick, baselineRoute.navigation.intentClick, true)}`,
      )
    }
  }

  if (!report.bundle) return

  console.log(`\nBundle JS total (brotli): ${formatBytes(report.bundle.totalBytes)}`)
  for (const group of report.bundle.byGroup) {
    console.log(`  ${group.group}: ${formatBytes(group.bytes)}`)
  }
  for (const chunk of report.bundle.topChunks.slice(0, 5)) {
    console.log(`  top chunk ${formatBytes(chunk.bytes).padStart(8)}  ${chunk.label}`)
  }

  if (!baseline?.bundle) return
  console.log(
    `  Delta total: ${compareNumber(report.bundle.totalBytes, baseline.bundle.totalBytes, true)}`,
  )
}

async function main() {
  const flags = parseArgs(process.argv)
  let previewServer: ChildProcess | undefined
  let baseUrl = flags.url || DEFAULT_BASE_URL

  try {
    if (!flags.url) {
      if (!flags.skipBuild) execSync('pnpm build', { cwd: process.cwd(), stdio: 'inherit' })
      previewServer = startPreviewServer()
      baseUrl = await detectPreviewUrl(previewServer)
      await waitForServer(baseUrl)
    }

    const routes: RouteResult[] = []
    for (const page of flags.pages) {
      process.stdout.write(`\nMeasuring ${page} ...`)

      const lighthouseRuns: LighthouseMetrics[] = []
      for (let i = 0; i < flags.runs; i++) {
        const report = runLighthouse(new URL(page, `${baseUrl}/`).toString(), flags.mobile)
        if (report) lighthouseRuns.push(extractLighthouseMetrics(report))
      }

      if (lighthouseRuns.length === 0) {
        throw new Error(`Lighthouse failed for ${page}`)
      }

      routes.push({
        lighthouse: {
          performance: Math.round(median(lighthouseRuns.map((run) => run.performance))),
          fcp: median(lighthouseRuns.map((run) => run.fcp)),
          lcp: median(lighthouseRuns.map((run) => run.lcp)),
          tbt: median(lighthouseRuns.map((run) => run.tbt)),
          cls: median(lighthouseRuns.map((run) => run.cls)),
          tti: median(lighthouseRuns.map((run) => run.tti)),
        },
        navigation: await captureNavigationMetrics(baseUrl, page, flags.runs),
        network: await captureNetworkSummary(baseUrl, page),
        page,
      })
      process.stdout.write(' done')
    }

    const report: Report = {
      baseUrl,
      bundle: flags.skipBundle ? undefined : bundleSummary(),
      createdAt: new Date().toISOString(),
      mobile: flags.mobile,
      routes,
      runs: flags.runs,
    }
    const baseline = flags.compare
      ? (JSON.parse(readFileSync(flags.compare, 'utf-8')) as Report)
      : undefined

    printReport(report, baseline)

    if (flags.save) {
      writeFileSync(flags.save, JSON.stringify(report, null, 2))
      console.log(`\nSaved report to ${flags.save}`)
    }
  } finally {
    stopPreviewServer(previewServer)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
