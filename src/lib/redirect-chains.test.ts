import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { canonicalDevelopersOrigin } from './docs-routing'
import {
  applyFirstMatch,
  compileRules,
  compileSource,
  type RedirectRule,
  sampleSourcePaths,
  traceRedirects,
} from './redirect-chains'

const vercelConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8'),
) as { redirects: RedirectRule[] }

async function productionVocsRedirects() {
  vi.stubEnv('VERCEL_ENV', 'production')
  vi.resetModules()
  try {
    const { default: config } = await import('../../vocs.config')
    return config.redirects as RedirectRule[]
  } finally {
    vi.unstubAllEnvs()
    vi.resetModules()
  }
}

// Every concrete path a source pattern covers, plus the paths a wildcard forwards into
// more specific rules, so a chain through a later exact match is exercised too.
function samplePaths(rules: readonly RedirectRule[]) {
  const paths = new Set(rules.flatMap(({ source }) => sampleSourcePaths(source)))
  const exactPaths = [...paths]
  for (const { source, destination } of rules) {
    const wildcard = /^(.*)\/:([A-Za-z_]\w*)\*$/.exec(source)
    if (!wildcard) continue
    const [, sourcePrefix, key] = wildcard
    const destinationPath = destination.startsWith(canonicalDevelopersOrigin)
      ? destination.slice(canonicalDevelopersOrigin.length)
      : destination
    if (!destinationPath.endsWith(`/:${key}*`)) continue
    const destinationPrefix = destinationPath.slice(0, -`/:${key}*`.length)
    for (const exact of exactPaths) {
      if (exact.startsWith(`${destinationPrefix}/`)) {
        paths.add(`${sourcePrefix}${exact.slice(destinationPrefix.length)}`)
      }
    }
  }
  return [...paths]
}

describe('redirect chain resolver', () => {
  it('matches Vercel source patterns', () => {
    const { regex } = compileSource('/:section(api|guide)/:path*')
    expect(regex.test('/api')).toBe(true)
    expect(regex.test('/guide/a/b')).toBe(true)
    expect(regex.test('/sdk/a')).toBe(false)
    expect(
      applyFirstMatch(
        compileRules([{ source: '/guide/:path*', destination: '/docs/guide/:path*' }]),
        '/guide/x/y',
      )?.destination,
    ).toBe('/docs/guide/x/y')
  })

  it('counts a root-relative Location behind the mount as an extra hop', () => {
    const rules = compileRules([{ source: '/build', destination: '/docs/build' }])
    expect(
      traceRedirects({ path: '/build', rules, canonicalOrigin: canonicalDevelopersOrigin }).hops,
    ).toHaveLength(2)
  })
})

describe('production redirects', async () => {
  const vocsRedirects = await productionVocsRedirects()
  const edgeRedirects = vercelConfig.redirects.filter((redirect) => !redirect.has)
  const hostRedirects = vercelConfig.redirects.filter((redirect) => redirect.has)
  // Vercel evaluates vercel.json before the app; Vocs serves its own redirects after it.
  const rules = compileRules([...edgeRedirects, ...vocsRedirects])
  const traces = samplePaths([...edgeRedirects, ...vocsRedirects]).map((start) =>
    traceRedirects({ path: start, rules, canonicalOrigin: canonicalDevelopersOrigin }),
  )

  it('reaches every final URL in one hop', () => {
    const chains = traces
      .filter((trace) => trace.loop || trace.hops.length > 1)
      .map((trace) => [trace.start, ...trace.hops.map((hop) => hop.to)].join(' -> '))
    if (process.env.REDIRECT_CHAIN_REPORT) {
      console.log(`${traces.length} sampled paths, ${chains.length} chains\n${chains.join('\n')}`)
    }
    expect(chains).toEqual([])
  })

  it('sends the legacy docs hosts to final canonical URLs', () => {
    const hostConditions = [...new Set(hostRedirects.map(({ has }) => JSON.stringify(has)))]
    const chains: string[] = []
    for (const condition of hostConditions) {
      // A host-scoped request sees the unscoped rules too, in file order.
      const applicable = compileRules(
        vercelConfig.redirects.filter(({ has }) => !has || JSON.stringify(has) === condition),
      )
      for (const redirect of hostRedirects.filter(({ has }) => JSON.stringify(has) === condition)) {
        for (const start of sampleSourcePaths(redirect.source)) {
          const first = applyFirstMatch(applicable, start)
          if (first?.rule !== redirect) continue
          if (!first.destination.startsWith(canonicalDevelopersOrigin)) continue
          const next =
            first.destination.slice(canonicalDevelopersOrigin.length).split('#')[0] || '/'
          const trace = traceRedirects({
            path: next,
            rules,
            canonicalOrigin: canonicalDevelopersOrigin,
          })
          if (trace.hops.length) {
            chains.push([start, first.destination, ...trace.hops.map((hop) => hop.to)].join(' -> '))
          }
        }
      }
    }
    expect(chains).toEqual([])
  })

  it('names the public mount for every docs destination', () => {
    const relative = edgeRedirects.filter(
      ({ source, destination }) =>
        destination.startsWith('/') &&
        !(source.startsWith('/developers/') && !destination.startsWith('/developers')),
    )
    expect(relative).toEqual([])
    expect(vocsRedirects.filter(({ destination }) => destination.startsWith('/'))).toEqual([])
  })
})
