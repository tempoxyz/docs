import { describe, expect, it } from 'vitest'
import { aliasRoutesDepositAddressV2, annotateRoutesAvailability } from './routes-openapi'

describe('Routes reference availability', () => {
  it('labels 501-only operations and preserves future successful operations', () => {
    const spec = {
      paths: {
        '/v1/routes/transfers/vault': {
          post: {
            summary: 'Create transfer into vault',
            description: 'Original description.',
            responses: { '501': {} },
          },
        },
        '/v1/routes/transfers/zone': {
          post: { summary: 'Create transfer into zone', responses: { '200': {}, '501': {} } },
        },
      },
    }
    annotateRoutesAvailability(spec)
    expect(spec.paths['/v1/routes/transfers/vault'].post.summary).toContain('(not implemented)')
    expect(spec.paths['/v1/routes/transfers/vault'].post.description).toContain(
      'Original description.',
    )
    expect(spec.paths['/v1/routes/transfers/zone'].post.summary).toBe('Create transfer into zone')
  })
})

describe('aliasRoutesDepositAddressV2', () => {
  it('renames the v1 create operation only when the spec has no v2 operation', () => {
    const legacy = {
      paths: {
        '/v1/routes/deposit-addresses': { post: { operationId: 'createRoutesDepositAddress' } },
      },
    }
    aliasRoutesDepositAddressV2(legacy)
    expect(legacy.paths['/v1/routes/deposit-addresses'].post.operationId).toBe(
      'createRoutesDepositAddressV2',
    )

    const current = {
      paths: {
        '/v1/routes/deposit-addresses': { post: { operationId: 'createRoutesDepositAddress' } },
        '/v2/routes/deposit-addresses': { post: { operationId: 'createRoutesDepositAddressV2' } },
      },
    }
    aliasRoutesDepositAddressV2(current)
    expect(current.paths['/v1/routes/deposit-addresses'].post.operationId).toBe(
      'createRoutesDepositAddress',
    )
  })
})
