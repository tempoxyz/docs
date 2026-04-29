/**
 * OG image coverage probe.
 *
 * Walks every route file under `src/pages/`, replicates the `ogImageUrl`
 * logic from `vocs.config.ts` to derive each route's (section, subsection),
 * collapses to the unique buckets, then probes each bucket against a
 * running server and verifies it returns a valid image response.
 *
 * Two layers of validation:
 *   1. Mapping coverage — fails if any route hits the auto-uppercase
 *      fallback path instead of an explicit map entry.
 *   2. Runtime — every static landing image, every dynamic bucket, and a
 *      handful of title edge cases must return 2xx with image/* content-type.
 *
 * Usage (against a `pnpm dev` server):
 *   VITE_USE_HTTP=true pnpm dev --port 5181
 *   PREVIEW_URL=http://localhost:5181 pnpm og:probe
 *
 * Keep the maps below in sync with vocs.config.ts.
 */

import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const PREVIEW = process.env.PREVIEW_URL ?? 'https://tempo-docs-k6tznt1fw-tempoxyz.vercel.app'
const PAGES_DIR = 'src/pages'

const sectionMap: Record<string, string> = {
  quickstart: 'INTEGRATE',
  guide: 'BUILD',
  protocol: 'PROTOCOL',
  sdk: 'SDKs',
  cli: 'CLI',
  ecosystem: 'ECOSYSTEM',
  learn: 'LEARN',
  wallet: 'WALLET',
  accounts: 'ACCOUNTS',
}

const subsectionMap: Record<string, string> = {
  'use-accounts': 'ACCOUNTS',
  payments: 'PAYMENTS',
  issuance: 'ISSUANCE',
  'stablecoin-dex': 'EXCHANGE',
  'machine-payments': 'MACHINE PAY',
  'tempo-transaction': 'TRANSACTIONS',
  tip20: 'TIP-20',
  'tip20-rewards': 'REWARDS',
  tip403: 'TIP-403',
  fees: 'FEES',
  transactions: 'TRANSACTIONS',
  blockspace: 'BLOCKSPACE',
  exchange: 'DEX',
  tips: 'TIPS',
  node: 'NODE',
  typescript: 'TYPESCRIPT',
  go: 'GO',
  foundry: 'FOUNDRY',
  python: 'PYTHON',
  rust: 'RUST',
  stablecoins: 'STABLECOINS',
  'use-cases': 'USE CASES',
  tempo: 'TEMPO',
  zones: 'ZONES',
  'private-zones': 'PRIVATE ZONES',
  upgrades: 'UPGRADES',
  api: 'API',
  guides: 'GUIDES',
  rpc: 'RPC',
  server: 'SERVER',
  wagmi: 'WAGMI',
}

const LANDING = new Set(['/', '/learn', '/changelog'])

function deriveOgParams(path: string) {
  if (LANDING.has(path)) return { kind: 'static' as const, url: '/og-docs.png' }
  const segments = path.split('/').filter(Boolean)
  const firstSeg = segments[0] || ''
  const secondSeg = segments[1] || ''
  const sectionMapped = firstSeg in sectionMap
  const section = sectionMap[firstSeg] || firstSeg.toUpperCase().replace(/-/g, ' ')
  const subsectionMapped = segments.length >= 3 && secondSeg in subsectionMap
  const subsection =
    segments.length >= 3 && subsectionMap[secondSeg]
      ? subsectionMap[secondSeg]
      : segments.length >= 3
        ? secondSeg.toUpperCase().replace(/-/g, ' ')
        : ''
  return {
    kind: 'dynamic' as const,
    section,
    subsection,
    sectionMapped,
    subsectionMapped,
    firstSeg,
    secondSeg,
    hasSubsection: segments.length >= 3,
  }
}

function fileToRoute(filePath: string) {
  const rel = relative(PAGES_DIR, filePath).replace(/\.(mdx|md|tsx)$/, '')
  if (rel.startsWith('_')) return null
  if (rel.includes('/_')) return null
  if (rel === 'index') return '/'
  if (rel.endsWith('/index')) return `/${rel.slice(0, -'/index'.length)}`
  return `/${rel}`
}

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) out.push(...walk(full))
    else if (/\.(mdx|md|tsx)$/.test(entry)) out.push(full)
  }
  return out
}

const allFiles = walk(PAGES_DIR)
const routes = allFiles
  .map(fileToRoute)
  .filter((r): r is string => !!r)
  .filter((r) => !r.startsWith('/_api/'))

const buckets = new Map<string, { route: string; section: string; subsection: string }>()
const fallbackSections = new Map<string, string[]>()
const fallbackSubsections = new Map<string, string[]>()
let staticCount = 0
for (const route of routes) {
  const og = deriveOgParams(route)
  if (og.kind === 'static') {
    staticCount++
    continue
  }
  const key = `${og.section}::${og.subsection}`
  if (!buckets.has(key)) {
    buckets.set(key, { route, section: og.section, subsection: og.subsection })
  }
  if (!og.sectionMapped) {
    if (!fallbackSections.has(og.firstSeg)) fallbackSections.set(og.firstSeg, [])
    fallbackSections.get(og.firstSeg)?.push(route)
  }
  if (og.hasSubsection && !og.subsectionMapped) {
    if (!fallbackSubsections.has(og.secondSeg)) fallbackSubsections.set(og.secondSeg, [])
    fallbackSubsections.get(og.secondSeg)?.push(route)
  }
}

console.log(
  `Discovered ${routes.length} routes, ${staticCount} landing (static), ${buckets.size} unique dynamic OG buckets.\n`,
)

console.log('=== Mapping coverage check ===')
if (fallbackSections.size === 0 && fallbackSubsections.size === 0) {
  console.log('  100% coverage: every section and subsection has an explicit map entry.\n')
} else {
  if (fallbackSections.size > 0) {
    console.log('  Sections falling through to auto-uppercase:')
    for (const [seg, paths] of fallbackSections) {
      console.log(
        `    ${seg.padEnd(20)} → "${seg.toUpperCase().replace(/-/g, ' ')}" (${paths.length} routes, e.g. ${paths[0]})`,
      )
    }
  }
  if (fallbackSubsections.size > 0) {
    console.log('  Subsections falling through to auto-uppercase:')
    for (const [seg, paths] of fallbackSubsections) {
      console.log(
        `    ${seg.padEnd(20)} → "${seg.toUpperCase().replace(/-/g, ' ')}" (${paths.length} routes, e.g. ${paths[0]})`,
      )
    }
  }
  console.log('')
}

type ProbeResult = {
  label: string
  url: string
  status: number
  ct: string
  bytes: number
  ms: number
  error?: string
}

async function probe(label: string, url: string): Promise<ProbeResult> {
  const t0 = Date.now()
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow' })
    const ct = r.headers.get('content-type') ?? ''
    const buf = await r.arrayBuffer()
    const ms = Date.now() - t0
    return { label, url, status: r.status, ct, bytes: buf.byteLength, ms }
  } catch (e) {
    return { label, url, status: -1, ct: '', bytes: 0, ms: Date.now() - t0, error: String(e) }
  }
}

type AnnotatedResult = ProbeResult & {
  kind: 'static' | 'bucket' | 'edge'
  section?: string
  subsection?: string
  sampleRoute?: string
  desc?: string
}

const results: AnnotatedResult[] = []

console.log('=== Static landing OG ===')
for (const path of ['/og-docs.png']) {
  const r = await probe('static og-docs.png', `${PREVIEW}${path}`)
  results.push({ kind: 'static', ...r })
  console.log(`  ${r.status} ${r.ct.padEnd(20)} ${r.bytes} bytes  ${r.ms}ms  ${r.url}`)
}

console.log('\n=== Dynamic OG (one per (section,subsection) bucket) ===')
const sample = Array.from(buckets.values())
let i = 0
for (const b of sample) {
  i++
  const params = new URLSearchParams({
    title: 'Sample Title For OG Verification',
    description: 'Probe',
    section: b.section,
    ...(b.subsection ? { subsection: b.subsection } : {}),
  })
  const url = `${PREVIEW}/api/og?${params.toString()}`
  const r = await probe(`bucket ${b.section}/${b.subsection || '-'} (${b.route})`, url)
  results.push({
    kind: 'bucket',
    section: b.section,
    subsection: b.subsection,
    sampleRoute: b.route,
    ...r,
  })
  console.log(
    `  [${String(i).padStart(2)}/${sample.length}] ${r.status} ${r.ct.padEnd(20)} ${String(r.bytes).padStart(7)}B ${String(r.ms).padStart(5)}ms  ${b.section}${b.subsection ? `/${b.subsection}` : ''}`,
  )
}

console.log('\n=== Title edge cases ===')
const edge = [
  { title: 'X', desc: 'one-char' },
  { title: 'API', desc: 'short three-letter' },
  {
    title:
      'A truly absurdly long page title that will exercise the balanceLines path with three lines and possible wrapping',
    desc: 'very long',
  },
  { title: 'Émoji & “smart quotes” — café', desc: 'unicode' },
  { title: 'tip-1017: account abstraction', desc: 'mixed case + colon' },
  { title: '<script>alert(1)</script>', desc: 'html-ish' },
]
for (const e of edge) {
  const params = new URLSearchParams({
    title: e.title,
    description: 'edge',
    section: 'PROTOCOL',
    subsection: 'TIPS',
  })
  const url = `${PREVIEW}/api/og?${params.toString()}`
  const r = await probe(`edge:${e.desc}`, url)
  results.push({ kind: 'edge', desc: e.desc, ...r })
  console.log(
    `  ${r.status} ${r.ct.padEnd(20)} ${String(r.bytes).padStart(7)}B ${String(r.ms).padStart(5)}ms  ${e.desc}`,
  )
}

const failed = results.filter((r) => r.status !== 200 || !r.ct.startsWith('image/'))
console.log(`\n=== Summary ===`)
console.log(`Total probes: ${results.length}`)
console.log(`Failed:       ${failed.length}`)
if (failed.length) {
  console.log('\nFailures:')
  for (const f of failed) console.log(`  ${f.kind} ${f.status} ${f.ct} ${f.url}`)
}

writeFileSync(
  'og-probe-results.json',
  JSON.stringify(
    { preview: PREVIEW, totalRoutes: routes.length, buckets: buckets.size, results },
    null,
    2,
  ),
)
console.log('\nFull results written to og-probe-results.json')
process.exit(failed.length ? 1 : 0)
