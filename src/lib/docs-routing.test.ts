import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import vocsConfig from '../../vocs.config'
import {
  canonicalDevelopersOrigin,
  developerSurfaceRedirects,
  docsRouteDestination,
  legacyDocsHostRoutes,
  proxiedLegacyDocsRoutes,
} from './docs-routing'

type Redirect = {
  source: string
  destination: string
  permanent?: boolean
  has?: unknown
}

type VocsRedirect = {
  source: string
  destination: string
}

const vercelConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8'),
) as { redirects: Redirect[]; trailingSlash?: boolean }

const redirects = vercelConfig.redirects.filter((redirect) => !redirect.has)
const hostRedirects = vercelConfig.redirects.filter((redirect) => redirect.has)
const vocsRedirects = vocsConfig.redirects as VocsRedirect[]
const legacySectionPathSource =
  '/:section(api|guide|quickstart|protocol|sdk|cli|wallet|tools|ecosystem|developer-tools)/:path*'

function findRedirect(source: string) {
  return redirects.find((redirect) => redirect.source === source)
}

function matchesHostCondition(redirect: Redirect, host: string) {
  return (
    Array.isArray(redirect.has) &&
    redirect.has.some((condition) => {
      if (
        typeof condition !== 'object' ||
        condition === null ||
        !('type' in condition) ||
        !('value' in condition) ||
        condition.type !== 'host' ||
        typeof condition.value !== 'string'
      ) {
        return false
      }

      return new RegExp(condition.value).test(host)
    })
  )
}

function findHostRedirect(source: string, host: string) {
  return hostRedirects.find(
    (redirect) => redirect.source === source && matchesHostCondition(redirect, host),
  )
}

function findHostRedirectIndex(source: string, host: string) {
  return vercelConfig.redirects.findIndex(
    (redirect) => redirect.source === source && matchesHostCondition(redirect, host),
  )
}

function developersProxyDestination(destination: string) {
  if (URL.canParse(destination)) return destination
  return `/developers${destination === '/' ? '' : destination}`
}

describe('docs routing redirects', () => {
  describe('developer site entry points', () => {
    it.each(developerSurfaceRedirects)('redirects $source to $destination in both mounts', ({
      source,
      destination,
    }) => {
      expect(vocsRedirects).toContainEqual(
        expect.objectContaining({
          source,
          destination: docsRouteDestination(destination),
          status: 301,
        }),
      )
      expect(findRedirect(`/developers${source}`)).toMatchObject({
        destination: developersProxyDestination(destination),
        permanent: true,
      })
    })

    it('serves the docs landing and getting-started page without a redirect', () => {
      expect(vocsRedirects.some(({ source }) => source === '/' || source === '/get-started')).toBe(
        false,
      )
      expect(findRedirect('/developers')).toBeUndefined()
      expect(fs.existsSync(path.join(process.cwd(), 'src/pages/index.mdx'))).toBe(true)
      expect(fs.existsSync(path.join(process.cwd(), 'src/pages/get-started.mdx'))).toBe(true)
    })

    it('removes marketing pages from the file-based route tree', () => {
      for (const page of [
        'index.tsx',
        'build/index.tsx',
        'build/tip20-tokens.tsx',
        'build/tempo-transactions.tsx',
        'performance.tsx',
      ]) {
        expect(fs.existsSync(path.join(process.cwd(), 'src/pages', page))).toBe(false)
      }
    })
  })

  it('keeps proxied route destinations inside the public mount in production', () => {
    expect(docsRouteDestination('/', 'production')).toBe(canonicalDevelopersOrigin)
    expect(docsRouteDestination('/', 'preview')).toBe('/')
    expect(docsRouteDestination('/docs/api', 'production')).toBe(
      `${canonicalDevelopersOrigin}/docs/api`,
    )
    expect(docsRouteDestination('/docs/api', 'preview')).toBe('/docs/api')
    expect(docsRouteDestination('https://tempo.xyz/learn/stablecoin-payroll/', 'production')).toBe(
      'https://tempo.xyz/learn/stablecoin-payroll/',
    )
  })

  it('keeps every retired documentation redirect inside the production mount', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.resetModules()
    try {
      const { default: productionConfig } = await import('../../vocs.config')
      const productionRedirects = productionConfig.redirects as Array<
        VocsRedirect & { status: number }
      >
      expect(productionRedirects).toHaveLength(vocsRedirects.length)
      for (const redirect of productionRedirects) {
        expect(redirect.status, redirect.source).toBe(301)
        expect(URL.canParse(redirect.destination), redirect.source).toBe(true)
        const target = new URL(redirect.destination)
        if (target.origin === 'https://tempo.xyz' && !target.pathname.startsWith('/learn/')) {
          expect(target.pathname, redirect.source).toMatch(/^\/developers(?:\/|$)/)
          expect(target.pathname, redirect.source).not.toContain('/developers/developers')
        }
      }
      expect(productionRedirects).toContainEqual({
        source: '/docs/guide',
        destination: `${canonicalDevelopersOrigin}/docs/quickstart/integrate-tempo`,
        status: 301,
      })
      expect(productionRedirects).toContainEqual({
        source: '/docs/protocol/tip20-rewards',
        destination: `${canonicalDevelopersOrigin}/docs/protocol/upgrades/t7#deprecate-tip-20-rewards`,
        status: 301,
      })
    } finally {
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })

  it.each(vocsRedirects)('mirrors every retired URL at the public mount: $source', ({
    source,
    destination,
  }) => {
    const target = destination.startsWith(canonicalDevelopersOrigin)
      ? destination.slice(canonicalDevelopersOrigin.length) || '/'
      : destination
    expect(findRedirect(`/developers${source}`)).toMatchObject({
      destination: developersProxyDestination(target),
      permanent: true,
    })
  })

  it('keeps the developer tools compatibility page and its provider anchors reachable', () => {
    expect(findRedirect('/developers/docs/quickstart/developer-tools')).toBeUndefined()
  })

  it('redirects old asset directories directly to Stablecoins', () => {
    for (const prefix of ['', '/developers']) {
      for (const source of ['/docs/ecosystem/assets', '/docs/partners/assets']) {
        expect(findRedirect(`${prefix}${source}`)).toMatchObject({
          destination: `${prefix}/docs/partners/stablecoins`,
          permanent: true,
        })
      }
    }
  })

  it('normalizes trailing slashes before static route handling', () => {
    expect(vercelConfig.trailingSlash).toBe(false)
  })

  describe('TIP index', () => {
    it.each([
      '/developers/docs/protocol/tips',
      '/docs/protocol/tips',
      '/protocol/tips',
    ])('redirects %s to tips.sh at the edge', (source) => {
      expect(findRedirect(source)).toMatchObject({
        source,
        destination: 'https://tips.sh/',
        permanent: true,
      })
    })

    it('does not generate a static meta-refresh page', () => {
      expect(
        fs.existsSync(path.join(process.cwd(), 'src/pages/docs/protocol/tips/index.mdx')),
      ).toBe(false)
    })

    it('evaluates the exact redirects before legacy docs-host catch-alls', () => {
      const firstTipRedirect = vercelConfig.redirects.findIndex(
        (redirect) => redirect.source === '/developers/docs/protocol/tips' && !redirect.has,
      )

      for (const host of ['docs.tempo.xyz', 'next.docs.tempo.xyz']) {
        expect(firstTipRedirect).toBeLessThan(findHostRedirectIndex('/developers/:path*', host))
        expect(firstTipRedirect).toBeLessThan(findHostRedirectIndex('/:path*', host))
      }
    })
  })

  describe('proxied legacy documentation routes', () => {
    it.each(proxiedLegacyDocsRoutes)('mirrors $source at the /developers mount', ({
      source,
      destination,
    }) => {
      const proxySource = `/developers${source}`
      const matchingProxyRedirects = redirects.filter((redirect) => redirect.source === proxySource)

      expect(
        vocsRedirects.some(
          (redirect) =>
            redirect.source === source &&
            redirect.destination === docsRouteDestination(destination),
        ),
      ).toBe(true)
      expect(matchingProxyRedirects).toEqual([
        expect.objectContaining({
          source: proxySource,
          destination: developersProxyDestination(destination),
          permanent: true,
        }),
      ])
    })

    it('uses canonical no-slash proxy sources and destinations', () => {
      for (const { source, destination } of proxiedLegacyDocsRoutes) {
        const redirect = findRedirect(`/developers${source}`)

        expect(redirect?.source).not.toMatch(/\/$/)
        expect(redirect?.destination).toBe(developersProxyDestination(destination))
        if (!URL.canParse(destination)) expect(redirect?.destination).not.toMatch(/\/$/)
      }
    })
  })

  describe.each(['docs.tempo.xyz', 'next.docs.tempo.xyz'])('canonical redirects for %s', (host) => {
    it.each([
      ['/', 'https://tempo.xyz/developers'],
      ['/developers', 'https://tempo.xyz/developers'],
      ['/docs', 'https://tempo.xyz/developers'],
      ['/developers/docs', 'https://tempo.xyz/developers'],
      ['/developers/:path*', 'https://tempo.xyz/developers/:path*'],
      ['/:path*', 'https://tempo.xyz/developers/:path*'],
    ])('redirects %s to %s', (source, destination) => {
      expect(findHostRedirect(source, host)).toMatchObject({
        source,
        destination,
        permanent: true,
      })
    })

    it.each(legacyDocsHostRoutes)('redirects $source to $destination before broad host rules', ({
      source,
      destination,
    }) => {
      expect(findHostRedirect(source, host)).toMatchObject({
        source,
        destination,
        permanent: true,
      })

      expect(findHostRedirectIndex(source, host)).toBeLessThan(
        findHostRedirectIndex(legacySectionPathSource, host),
      )
      expect(findHostRedirectIndex(source, host)).toBeLessThan(
        findHostRedirectIndex('/:path*', host),
      )
    })

    it.each([
      [
        '/:section(api|guide|quickstart|protocol|sdk|cli|wallet|tools|ecosystem|changelog|partners)',
        `${canonicalDevelopersOrigin}/docs/:section`,
      ],
      [
        '/:section(api|guide|quickstart|protocol|sdk|cli|wallet|tools|ecosystem|developer-tools)/:path*',
        `${canonicalDevelopersOrigin}/docs/:section/:path*`,
      ],
    ])('redirects legacy section %s to %s before the host catch-all', (source, destination) => {
      expect(findHostRedirect(source, host)).toMatchObject({ source, destination, permanent: true })
      expect(findHostRedirectIndex(source, host)).toBeLessThan(
        findHostRedirectIndex('/:path*', host),
      )
    })
  })

  it.each([
    '/',
    '/developers',
    '/developers/:path*',
    '/:path*',
  ])('does not redirect developers.tempo.xyz%s to avoid proxy loops', (source) => {
    expect(findHostRedirect(source, 'developers.tempo.xyz')).toBeUndefined()
  })

  it.each([
    ['/tools', '/docs/tools'],
    ['/tools/:path*', '/docs/tools/:path*'],
    ['/partners', '/docs/partners'],
    ['/docs/ecosystem', '/docs/partners'],
    ['/docs/ecosystem/node-infrastructure', '/docs/partners/rpc-and-nodes'],
    [
      '/developers/docs/ecosystem/smart-contract-libraries',
      '/developers/docs/partners/smart-accounts',
    ],
    ['/api', '/docs/api'],
    ['/api/authentication', '/docs/api/authentication'],
    ['/api/conventions', '/docs/api/conventions'],
    ['/api/errors', '/docs/api/errors'],
    ['/api/indexer', '/docs/api/indexer'],
    ['/api/indexer-api', '/docs/api/indexer-api'],
    ['/api/fee-payer', '/docs/api/fee-payer'],
    ['/api/json-rpc', '/docs/api/json-rpc'],
    ['/api/pagination', '/docs/api/pagination'],
    ['/api/rate-limits', '/docs/api/rate-limits'],
    ['/api/transactions', '/docs/api/transactions'],
    ['/api/transactions-and-transfers', '/docs/api/transactions-and-transfers'],
    ['/api/transfers', '/docs/api/transfers'],
    ['/api/versioning-policy', '/docs/api/versioning-policy'],
    ['/developers/docs/developer-tools', '/developers/docs/partners'],
    ['/developers/docs/developer-tools/fee-payer', '/developers/docs/api/fee-payer'],
    ['/developers/docs/developer-tools/indexer', '/developers/docs/api/indexer-api'],
    ['/developers/docs/hosted-services', '/developers/docs/api'],
    ['/developers/docs/hosted-services/:path*', '/developers/docs/api'],
    ['/developer-tools/fee-payer', '/docs/api/fee-payer'],
    ['/developer-tools/indexer', '/docs/api/indexer-api'],
    ['/hosted-services', '/docs/api'],
    ['/hosted-services/:path*', '/docs/api'],
  ])('redirects %s to %s', (source, destination) => {
    expect(findRedirect(source)).toMatchObject({
      source,
      destination,
      permanent: true,
    })
  })

  it.each([
    ['/api/:path*', 'real API functions such as /api/og must stay routable'],
    ['/api/:path(.*)', 'real API functions such as /api/feedback must stay routable'],
  ])('does not add broad API docs redirect %s because %s', (source) => {
    expect(findRedirect(source)).toBeUndefined()
  })
})
