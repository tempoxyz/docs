import { describe, expect, it } from 'vitest'
import { prepareTempoOpenApi } from './tempo-openapi'

describe('Tempo OpenAPI examples', () => {
  it('replaces provider metadata in field, object, and list samples only', () => {
    const vault = {
      label: 'Provider vault',
      slug: 'provider-vault',
      description: 'Provider strategy',
      id: '0x123',
    }
    const vaultSchema = {
      type: 'object',
      description: 'The actual schema description',
      required: ['id', 'label'],
      properties: {
        label: { type: 'string', examples: [vault.label] },
        slug: { type: 'string', example: vault.slug },
        description: {
          type: 'string',
          description: 'Vault description',
          examples: [vault.description],
        },
        id: { type: 'string', examples: [vault.id] },
      },
      examples: [vault],
    }
    const source = {
      paths: { '/v1/earn/vaults': { get: { operationId: 'getEarnVaults' } } },
      components: {
        schemas: {
          EarnVault: vaultSchema,
          EarnVaultDetail: vaultSchema,
          VerifiedEarnVault: vaultSchema,
          EarnVaultList: {
            properties: { data: { examples: [[vault]] } },
            examples: [{ data: [vault] }],
          },
          VerifiedEarnVaultList: { examples: [{ data: [vault] }] },
          UnrelatedSchema: vaultSchema,
        },
      },
    }
    const result = prepareTempoOpenApi(source) as typeof source
    const expected = {
      ...vault,
      label: 'Example vault',
      slug: 'example-vault',
      description: 'Stablecoins deposited into an Earn vault.',
    }

    for (const name of ['EarnVault', 'EarnVaultDetail', 'VerifiedEarnVault'] as const) {
      const schema = result.components.schemas[name]
      expect(schema.examples).toEqual([expected])
      expect(schema.properties.label.examples).toEqual([expected.label])
      expect(schema.properties.slug.example).toBe(expected.slug)
      expect(schema.properties.description.examples).toEqual([expected.description])
      expect(schema.properties.description.description).toBe('Vault description')
      expect(schema.properties.id).toEqual(vaultSchema.properties.id)
      expect(schema.required).toEqual(vaultSchema.required)
      expect(schema.description).toBe(vaultSchema.description)
    }
    expect(result.components.schemas.EarnVaultList.properties.data.examples).toEqual([[expected]])
    expect(result.components.schemas.EarnVaultList.examples).toEqual([{ data: [expected] }])
    expect(result.components.schemas.VerifiedEarnVaultList.examples).toEqual([{ data: [expected] }])
    expect(result.components.schemas.UnrelatedSchema).toEqual(vaultSchema)
    expect(result.paths).toEqual(source.paths)
    expect(source.components.schemas.EarnVault.examples).toEqual([vault])
  })

  it('keeps Try requests on the API host when resolving relative server URLs', () => {
    expect(prepareTempoOpenApi({ servers: [{ url: '/' }] }).servers).toEqual([
      { url: 'https://api.tempo.xyz' },
    ])
    expect(
      prepareTempoOpenApi({ servers: [{ url: '/api' }] }, 'https://example.com/openapi.json')
        .servers,
    ).toEqual([{ url: 'https://example.com/api' }])
    expect(
      prepareTempoOpenApi({ servers: [{ url: 'https://other.example/api' }] }).servers,
    ).toEqual([{ url: 'https://other.example/api' }])
  })

  it('preserves linked JSON-RPC reference generation for inline specs', () => {
    const spec = {
      paths: {
        '/rpc': { post: { 'x-openrpc': '/openrpc.json' } },
        '/inline': { post: { 'x-openrpc': '{"openrpc":"1.2.6"}' } },
      },
    }
    const result = prepareTempoOpenApi(spec) as typeof spec
    expect(result.paths['/rpc'].post['x-openrpc']).toBe('https://api.tempo.xyz/openrpc.json')
    expect(result.paths['/inline']).toEqual(spec.paths['/inline'])
  })
})
