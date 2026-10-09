import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { prepareTempoOpenApi } from './tempo-openapi'

describe('Tempo authentication documentation routes', () => {
  it('keeps Console operations separate from the API-key guide in routes and agent exports', async () => {
    const { parse } = await import('../../node_modules/vocs/dist/internal/openapi/parser.js')
    const { fromIr } = await import('../../node_modules/vocs/dist/internal/openapi/markdown.js')
    const { toSidebar } = await import('../../node_modules/vocs/dist/internal/openapi/sidebar.js')
    const { toSearchDocuments } = await import(
      '../../node_modules/vocs/dist/internal/openapi/search.js'
    )
    const operations = [
      ['createSiweChallenge', '/v1/auth/siwe/challenge'],
      ['verifySiwe', '/v1/auth/siwe'],
      ['verifyIdentity', '/v1/auth/identity'],
      ['logout', '/v1/auth/logout'],
    ]
    const source = {
      openapi: '3.1.0',
      info: { title: 'Tempo API', version: '1.0.0' },
      tags: [{ name: 'Authentication', description: 'Authenticate into the Tempo Platform.' }],
      'x-tagGroups': [{ name: 'Platform API', tags: ['Authentication'] }],
      paths: Object.fromEntries(
        operations.map(([operationId, path]) => [
          path,
          {
            post: {
              operationId,
              tags: ['Authentication'],
              responses: { '200': { description: 'Success' } },
            },
          },
        ]),
      ),
    }
    const prepared = prepareTempoOpenApi(source)
    const parsed = await parse({ path: '/docs/api', spec: () => prepared })
    expect(prepared.paths).toEqual(source.paths)
    expect(source.tags[0]).not.toHaveProperty('x-pagePath')
    expect(parsed.groups[0]).toMatchObject({
      id: 'authentication',
      name: 'Console authentication',
      pagePath: 'console/authentication',
    })

    const generatedPages = fromIr(parsed)
    expect(generatedPages.map((page) => page.path)).toEqual([
      '/docs/api',
      '/docs/api/console/authentication',
    ])
    const sidebar = JSON.stringify(toSidebar(parsed))
    const search = await toSearchDocuments(parsed)
    const guide = readFileSync('src/pages/docs/api/authentication.mdx', 'utf8')
    for (const [operationId] of operations) {
      const anchor = operationId.toLowerCase()
      const destination = `/docs/api/console/authentication#${anchor}`
      expect(generatedPages[0].content).toContain(`](${destination})`)
      expect(sidebar).toContain(destination)
      expect(search.some((result) => result.href === destination)).toBe(true)
      // Existing endpoint hashes still land on a link to the new reference.
      expect(guide).toContain(`<span id="${anchor}" />`)
      expect(guide).toContain(`](${destination})`)
    }
    expect(guide).toContain('## API keys')
    expect(guide).toContain('## Pay per request with MPP')
  })
})

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

  const vaultReadPaths = [
    '/v1/earn/vaults',
    '/v1/earn/vaults/verified',
    '/v1/earn/vaults/{vaultId}',
    '/v1/earn/vaults/{vaultId}/share-prices',
    '/v1/earn/vaults/{vaultId}/positions/{address}',
    '/v1/earn/vaults/{vaultId}/earnings/{address}',
    '/v1/earn/addresses/{address}/positions',
  ]
  const vaultId = '0x20147491b5701dea880263241c335caca9be326d'
  const chainParameter = {
    in: 'query',
    name: 'chainId',
    description: 'Defaults to mainnet when omitted.',
    schema: {
      anyOf: [{ type: 'string', enum: ['mainnet', 'testnet'] }, { type: 'number' }],
      default: 'mainnet',
      examples: [4217],
    },
  }
  const vaultParameter = {
    in: 'path',
    name: 'vaultId',
    required: true,
    schema: { type: 'string', pattern: '^0x[0-9a-fA-F]{40}$', example: '0x123' },
  }
  const includeParameter = {
    in: 'query',
    name: 'include',
    schema: {
      type: 'array',
      items: { type: 'string', enum: ['access', 'apy', 'capabilities'] },
      examples: [['apy']],
    },
  }
  const accountParameter = {
    in: 'path',
    name: 'address',
    required: true,
    schema: { type: 'string', examples: ['0xbe058e1c4df8a4366a387bf595b284246a93039e'] },
  }

  it.each(vaultReadPaths)('prefills only editable request examples for GET %s', (path) => {
    const parameters = [
      chainParameter,
      ...(path.includes('{vaultId}') ? [vaultParameter] : []),
      ...(path.includes('{address}') ? [accountParameter] : []),
      includeParameter,
      { in: 'query', name: 'cursor', schema: { type: 'string', examples: ['existing-cursor'] } },
      { in: 'query', name: 'asset', schema: { type: 'string', examples: ['existing-asset'] } },
    ]
    const operation = { parameters, responses: { '200': { description: 'Success' } } }
    const source = { paths: { [path]: { get: operation, post: operation } } }
    const snapshot = structuredClone(source)
    const result = prepareTempoOpenApi(source) as typeof source
    const expectedParameters = parameters.map((parameter) => {
      const example =
        parameter.name === 'chainId'
          ? 'testnet'
          : parameter.name === 'vaultId'
            ? vaultId
            : undefined
      if (example === undefined) return parameter
      return {
        ...parameter,
        ...(parameter.name === 'chainId'
          ? { examples: { default: { value: 'testnet', 'x-disabled': false } } }
          : { example }),
        schema: {
          ...parameter.schema,
          examples: [example],
          ...(Object.hasOwn(parameter.schema, 'example') ? { example } : {}),
        },
      }
    })

    expect(result).toEqual({
      paths: { [path]: { get: { ...operation, parameters: expectedParameters }, post: operation } },
    })
    expect(source).toEqual(snapshot)
  })

  it('preserves Zone transaction IDs, other APIs, and unrelated parameter locations', () => {
    const operation = { parameters: [chainParameter, vaultParameter, accountParameter] }
    const source = {
      paths: {
        '/v1/earn/transactions/{senderTag}': {
          get: {
            parameters: [{ ...chainParameter, required: true, schema: { examples: [1424310003] } }],
          },
        },
        '/v1/addresses/{address}/balances': { get: operation },
        '/v1/routes': { get: operation },
        '/v1/earn/vaults/{vaultId}': {
          get: {
            parameters: [
              { ...chainParameter, in: 'header' },
              { ...vaultParameter, in: 'query' },
              accountParameter,
            ],
          },
        },
      },
      components: { schemas: { ChainId: chainParameter.schema } },
    }
    expect(prepareTempoOpenApi(source)).toEqual(source)
  })

  it('uses the same testnet inputs in Vocs samples and the editable Scalar Try client', async () => {
    const { parse } = await import('../../node_modules/vocs/dist/internal/openapi/parser.js')
    const { codeSamples } = await import('../../node_modules/vocs/dist/internal/openapi/sample.js')
    const requireFromVocs = createRequire(import.meta.resolve('vocs'))
    const requestExamplesUrl = pathToFileURL(
      requireFromVocs.resolve('@scalar/workspace-store/request-example'),
    )
    const { getExample } = await import(requestExamplesUrl.href)
    const { buildRequestParameters } = await import(
      new URL('./builder/header/build-request-parameters.js', requestExamplesUrl).href
    )
    const path = '/v1/earn/vaults/{vaultId}'
    const spec = prepareTempoOpenApi({
      openapi: '3.1.0',
      info: { title: 'Tempo API', version: '1.0.0' },
      servers: [{ url: 'https://api.tempo.xyz' }],
      paths: {
        [path]: {
          get: {
            operationId: 'getEarnVault',
            parameters: [
              { ...chainParameter, example: 'mainnet' },
              vaultParameter,
              includeParameter,
            ],
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    })
    const parsed = await parse({ path: '/docs/api', spec })
    const operation = parsed.groups.flatMap((group) => group.operations)[0]
    const samples = codeSamples(operation, parsed.servers[0]?.url)
    expect(samples.length).toBeGreaterThan(0)
    for (const sample of samples) {
      expect(sample.code).toContain(`/v1/earn/vaults/${vaultId}`)
      expect(sample.code).toContain('chainId=testnet')
      expect(sample.code).toContain('include=apy')
    }
    expect(parsed.client).toHaveProperty('content')
    if (!('content' in parsed.client)) throw new Error('Try must receive the prepared inline spec')
    const paths = parsed.client.content.paths as Record<
      string,
      { get: { parameters: { name: string; schema: Record<string, unknown> }[] } }
    >
    const parameters = paths[path].get.parameters
    expect(getExample(parameters.find((parameter) => parameter.name === 'chainId'))).toEqual({
      value: 'testnet',
      'x-disabled': false,
    })
    expect(getExample(parameters.find((parameter) => parameter.name === 'vaultId'))).toEqual({
      value: vaultId,
    })
    expect(getExample(parameters.find((parameter) => parameter.name === 'include'))).toEqual({
      value: ['apy'],
    })
    const chain = parameters.find((parameter) => parameter.name === 'chainId')
    expect(chain).not.toHaveProperty('example')
    expect(chain).not.toHaveProperty('required')
    expect(chain?.schema.default).toBe('mainnet')
    const request = buildRequestParameters(parameters)
    expect(request.urlParams.toString()).toBe('chainId=testnet')
    expect(request.pathVariables.vaultId).toBe(vaultId)

    // Users can still change the network or uncheck the optional query row.
    const edited = { ...chain, examples: { default: { value: 'mainnet', 'x-disabled': false } } }
    expect(buildRequestParameters([edited]).urlParams.toString()).toBe('chainId=mainnet')
    edited.examples.default['x-disabled'] = true
    expect(buildRequestParameters([edited]).urlParams.has('chainId')).toBe(false)
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
