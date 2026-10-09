import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { arch, cpus, platform } from 'node:os'
import path from 'node:path'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import { chromium } from '@playwright/test'

// Build both revisions separately, then serve each production build before running:
// pnpm exec node scripts/benchmark-styles.mjs --baseline <checkout> --baseline-url <url> \
//   --candidate <checkout> --candidate-url <url> --output /tmp/zyzz-benchmark.json
const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, values) => {
    if (index % 2 === 0) pairs.push([value.replace(/^--/, ''), values[index + 1]])
    return pairs
  }, []),
)
for (const key of ['baseline', 'baseline-url', 'candidate', 'candidate-url', 'output']) {
  if (!args[key]) throw new Error(`Missing --${key}`)
}
const runs = Number(args.runs ?? 3)
if (!Number.isInteger(runs) || runs < 1) throw new Error('--runs must be a positive integer')
const routes = [
  '/',
  '/docs/accounts',
  '/docs/partners/wallets',
  '/docs/guide/issuance/create-a-stablecoin',
  '/blog',
]
const sizes = (bytes) => ({
  raw: bytes.length,
  gzip: gzipSync(bytes, { level: 9 }).length,
  brotli: brotliCompressSync(bytes, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length,
})
const add = (items) =>
  items.reduce(
    (sum, item) => ({
      raw: sum.raw + item.raw,
      gzip: sum.gzip + item.gzip,
      brotli: sum.brotli + item.brotli,
    }),
    { raw: 0, gzip: 0, brotli: 0 },
  )
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

function revision(name) {
  const root = path.resolve(args[name])
  const publicRoot = path.join(root, 'dist/public')
  const assets = new Map()
  for (const file of readdirSync(publicRoot, { recursive: true })) {
    if (!/\.(css|js)$/.test(file)) continue
    assets.set(
      `/${file.split(path.sep).join('/')}`,
      sizes(readFileSync(path.join(publicRoot, file))),
    )
  }
  const aggregate = (suffix) => {
    const files = [...assets].filter(([file]) => file.endsWith(suffix))
    return { files: files.length, ...add(files.map(([, size]) => size)) }
  }
  return {
    root,
    publicRoot,
    assets,
    url: args[`${name}-url`],
    summary: {
      commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      dirty: !!execFileSync('git', ['status', '--porcelain'], {
        cwd: root,
        encoding: 'utf8',
      }).trim(),
      css: aggregate('.css'),
      js: aggregate('.js'),
    },
  }
}
const revisions = { baseline: revision('baseline'), candidate: revision('candidate') }
const samples = []
const browser = await chromium.launch()
try {
  for (let run = 0; run < runs; run++) {
    for (const route of routes) {
      // Alternate order between runs to reduce systematic warming bias.
      for (const name of run % 2 ? ['candidate', 'baseline'] : ['baseline', 'candidate']) {
        const revision = revisions[name]
        const context = await browser.newContext({
          viewport: { width: 390, height: 844 },
          serviceWorkers: 'block',
        })
        try {
          const page = await context.newPage()
          const cdp = await context.newCDPSession(page)
          await cdp.send('Network.enable')
          await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
          await cdp.send('Network.emulateNetworkConditions', {
            offline: false,
            latency: 20,
            downloadThroughput: 10_000_000 / 8,
            uploadThroughput: 1_000_000 / 8,
          })
          await page.addInitScript(() => {
            window.__styleBenchmarkLcp = 0
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) window.__styleBenchmarkLcp = entry.startTime
            }).observe({ type: 'largest-contentful-paint', buffered: true })
          })
          const requested = new Set()
          const failures = []
          page.on('response', (response) => {
            const url = new URL(response.url())
            if (url.origin !== new URL(revision.url).origin) return
            const type = response.request().resourceType()
            if (!['script', 'stylesheet'].includes(type)) return
            if (response.status() >= 400) failures.push(`${response.status()} ${url.pathname}`)
            if (revision.assets.has(url.pathname)) requested.add(url.pathname)
            else if (/\.(css|js)$/.test(url.pathname))
              failures.push(`Asset not found in build: ${url.pathname}`)
          })
          const response = await page.goto(new URL(route, revision.url).href, {
            waitUntil: 'load',
            timeout: 90_000,
          })
          if (!response?.ok()) throw new Error(`${name} ${route}: HTTP ${response?.status()}`)
          // Fixed observation window; this is an initial-viewport lab measurement, not field CWV.
          await page.waitForTimeout(1500)
          if (failures.length) throw new Error(failures.join('\n'))
          const timing = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0]
            return { lcpMs: window.__styleBenchmarkLcp, loadMs: navigation.loadEventEnd }
          })
          const payload = (suffix) => {
            const files = [...requested].filter((file) => file.endsWith(suffix))
            return {
              requests: files.length,
              ...add(files.map((file) => revision.assets.get(file))),
            }
          }
          samples.push({
            name,
            route,
            run,
            ...timing,
            css: payload('.css'),
            js: payload('.js'),
            html: sizes(await response.body()),
          })
          console.log(`${name} ${route} run ${run + 1}: ${Math.round(timing.lcpMs)}ms LCP`)
        } finally {
          await context.close()
        }
      }
    }
  }
} finally {
  await browser.close()
}
const pages = routes.map((route) => ({
  route,
  ...Object.fromEntries(
    Object.keys(revisions).map((name) => {
      const rows = samples.filter((row) => row.name === name && row.route === route)
      return [
        name,
        {
          lcpMs: median(rows.map((row) => row.lcpMs)),
          loadMs: median(rows.map((row) => row.loadMs)),
          ...Object.fromEntries(
            ['css', 'js', 'html'].map((kind) => [
              kind,
              Object.fromEntries(
                Object.keys(rows[0][kind]).map((key) => [
                  key,
                  median(rows.map((row) => row[kind][key])),
                ]),
              ),
            ]),
          ),
        },
      ]
    }),
  ),
}))
const report = {
  methodology: {
    runs,
    viewport: '390x844',
    cpuSlowdown: 4,
    latencyMs: 20,
    downloadMbps: 10,
    cache: 'fresh context and disabled HTTP cache per navigation',
    observation: 'load + 1500ms',
    compression: 'gzip level 9 / Brotli quality 11, summed independently per requested local asset',
    caveat:
      'Local preview timing is not a CDN or field Core Web Vitals result. Total build assets are not per-page payload.',
    platform: `${platform()} ${arch()}`,
    cpu: cpus()[0]?.model,
    node: process.version,
    chromium: browser.version(),
  },
  builds: Object.fromEntries(
    Object.entries(revisions).map(([name, revision]) => [name, revision.summary]),
  ),
  pages,
  samples,
}
writeFileSync(args.output, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Saved ${args.output}`)
