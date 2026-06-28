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

function findRedirect(source: string) {
  return redirects.find((redirect) => redirect.source === source)
}

describe('docs routing redirects', () => {
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
