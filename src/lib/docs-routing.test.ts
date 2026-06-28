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
const hostRedirects = vercelConfig.redirects.filter((redirect) =>
  Array.isArray(redirect.has)
    ? redirect.has.some(
        (condition) =>
          typeof condition === 'object' &&
          condition !== null &&
          'type' in condition &&
          'value' in condition &&
          condition.type === 'host' &&
          condition.value === 'docs.tempo.xyz',
      )
    : false,
)

function findRedirect(source: string) {
  return redirects.find((redirect) => redirect.source === source)
}

describe('docs routing redirects', () => {
  it.each([
    ['/', 'https://tempo.xyz/developers'],
    ['/developers', 'https://tempo.xyz/developers'],
    ['/developers/:path*', 'https://tempo.xyz/developers/:path*'],
    ['/:path*', 'https://tempo.xyz/developers/:path*'],
  ])('redirects docs.tempo.xyz%s to %s', (source, destination) => {
    expect(hostRedirects).toContainEqual(
      expect.objectContaining({
        source,
        destination,
        permanent: true,
      }),
    )
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
    ['/api/json-rpc', '/docs/api/json-rpc'],
    ['/api/pagination', '/docs/api/pagination'],
    ['/api/rate-limits', '/docs/api/rate-limits'],
    ['/api/transactions', '/docs/api/transactions'],
    ['/api/transactions-and-transfers', '/docs/api/transactions-and-transfers'],
    ['/api/transfers', '/docs/api/transfers'],
    ['/api/versioning-policy', '/docs/api/versioning-policy'],
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
