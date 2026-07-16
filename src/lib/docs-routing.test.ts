import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

type Redirect = {
  source: string
  destination: string
  permanent?: boolean
  has?: unknown
}

const vercelConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8'),
) as { redirects: Redirect[] }

const redirects = vercelConfig.redirects.filter((redirect) => !redirect.has)
const hostRedirects = vercelConfig.redirects.filter((redirect) => redirect.has)

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

describe('docs routing redirects', () => {
  describe.each(['docs.tempo.xyz', 'next.docs.tempo.xyz'])('canonical redirects for %s', (host) => {
    it.each([
      ['/', 'https://tempo.xyz/developers'],
      ['/developers', 'https://tempo.xyz/developers'],
      ['/developers/:path*', 'https://tempo.xyz/developers/:path*'],
      ['/:path*', 'https://tempo.xyz/developers/:path*'],
    ])('redirects %s to %s', (source, destination) => {
      expect(findHostRedirect(source, host)).toMatchObject({
        source,
        destination,
        permanent: true,
      })
    })

    it.each([
      ['/guide/bridge-usdc-stargate', 'https://tempo.xyz/developers/docs/guide/bridge-layerzero'],
      ['/guide/bridge-usdc-relay', 'https://tempo.xyz/developers/docs/guide/bridge-relay'],
      [
        '/guide/node/validator-config-v2',
        'https://tempo.xyz/developers/docs/guide/node/network-upgrades',
      ],
      [
        '/AccountKeychain',
        'https://tempo.xyz/developers/docs/protocol/transactions/AccountKeychain',
      ],
      ['/developer-tools', 'https://tempo.xyz/developers/docs/ecosystem'],
      ['/developer-tools/fee-payer', 'https://tempo.xyz/developers/docs/api/fee-payer'],
      ['/developer-tools/indexer', 'https://tempo.xyz/developers/docs/api/indexer-api'],
      ['/hosted-services', 'https://tempo.xyz/developers/docs/api'],
      ['/hosted-services/:path*', 'https://tempo.xyz/developers/docs/api'],
      ['/learn/partners', 'https://tempo.xyz/developers/docs/partners'],
      ['/docs/learn/partners', 'https://tempo.xyz/developers/docs/partners'],
      ['/docs/guide/using-tempo-with-ai/partners', 'https://tempo.xyz/developers/docs/partners'],
      ['/build/partners', 'https://tempo.xyz/developers/docs/partners'],
      ['/network-upgrades', 'https://tempo.xyz/developers/docs/guide/node/network-upgrades'],
      [
        '/:section(api|guide|quickstart|protocol|sdk|cli|wallet|tools|ecosystem|changelog|partners)',
        'https://tempo.xyz/developers/docs/:section',
      ],
      [
        '/:section(api|guide|quickstart|protocol|sdk|cli|wallet|tools|ecosystem|developer-tools)/:path*',
        'https://tempo.xyz/developers/docs/:section/:path*',
      ],
    ])('redirects legacy route %s to %s before the host catch-all', (source, destination) => {
      expect(findHostRedirect(source, host)).toMatchObject({
        source,
        destination,
        permanent: true,
      })

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
    ['/developers/docs/developer-tools/fee-payer/', '/developers/docs/api/fee-payer'],
    ['/developers/docs/developer-tools/indexer/', '/developers/docs/api/indexer-api'],
    ['/developers/docs/hosted-services/', '/developers/docs/api'],
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
