import { readFile } from 'node:fs/promises'

const canonicalSpecUrl = 'https://api.tempo.xyz/openapi.json'
// The verified Moderato deployment also used by the interactive Earn deposit demo.
const earnVaultExample = '0x20147491b5701dea880263241c335caca9be326d'
const earnReadPaths = new Set([
  '/v1/earn/vaults',
  '/v1/earn/vaults/verified',
  '/v1/earn/vaults/{vaultId}',
  '/v1/earn/vaults/{vaultId}/share-prices',
  '/v1/earn/vaults/{vaultId}/positions/{address}',
  '/v1/earn/vaults/{vaultId}/earnings/{address}',
  '/v1/earn/addresses/{address}/positions',
])
const vaultExampleFields: Record<string, string> = {
  label: 'Example vault',
  slug: 'example-vault',
  description: 'Stablecoins deposited into an Earn vault.',
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rewriteExample(value: unknown, field?: string): unknown {
  if (Array.isArray(value)) return value.map((item) => rewriteExample(item, field))
  if (isObject(value))
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteExample(item, key)]),
    )
  if (typeof value === 'string' && field && Object.hasOwn(vaultExampleFields, field))
    return vaultExampleFields[field]
  return value
}

function rewriteSchemaExamples(value: unknown, field?: string) {
  if (Array.isArray(value)) {
    for (const item of value) rewriteSchemaExamples(item, field)
  } else if (isObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'example' || key === 'examples') value[key] = rewriteExample(item, field)
      else if (key === 'properties' && isObject(item)) {
        for (const [property, schema] of Object.entries(item))
          rewriteSchemaExamples(schema, property)
      } else rewriteSchemaExamples(item, field)
    }
  }
}

function prepareEarnRequestExamples(pathname: string, path: Record<string, unknown>) {
  // Transaction status reads require a destination Zone chain ID, not Moderato.
  if (!earnReadPaths.has(pathname) || !isObject(path.get)) return
  const operation = path.get
  if (!Array.isArray(operation.parameters)) return
  path.get = {
    ...operation,
    parameters: operation.parameters.map((parameter) => {
      if (!isObject(parameter) || !isObject(parameter.schema)) return parameter
      const example =
        parameter.in === 'query' && parameter.name === 'chainId'
          ? 'testnet'
          : parameter.in === 'path' && parameter.name === 'vaultId'
            ? earnVaultExample
            : undefined
      if (example === undefined) return parameter

      // Vocs reads schema examples; Scalar also needs its optional query row
      // enabled. These are editable request examples, not API defaults.
      const prepared: Record<string, unknown> = {
        ...parameter,
        example,
        schema: {
          ...parameter.schema,
          examples: [example],
          ...(Object.hasOwn(parameter.schema, 'example') ? { example } : {}),
        },
      }
      if (parameter.in === 'query') {
        delete prepared.example
        prepared.examples = { default: { value: example, 'x-disabled': false } }
      }
      return prepared
    }),
  }
}

/** Prepare documentation routes and editable samples without changing the API contract. */
export function prepareTempoOpenApi(
  source: Record<string, unknown>,
  sourceUrl = canonicalSpecUrl,
): Record<string, unknown> {
  const spec = structuredClone(source)
  // API-key/MPP authentication is an authored guide at /docs/api/authentication.
  // Keep the Console's sign-in operations on their own reference page so Vocs
  // does not append them to the guide or replace its Markdown export.
  if (Array.isArray(spec.tags)) {
    for (const tag of spec.tags) {
      if (isObject(tag) && tag.name === 'Authentication') {
        tag['x-displayName'] = 'Console authentication'
        tag['x-pagePath'] = 'console/authentication'
      }
    }
  }
  const schemas = isObject(spec.components) ? spec.components.schemas : undefined
  if (isObject(schemas)) {
    for (const [name, schema] of Object.entries(schemas)) {
      if (/^(Verified)?EarnVault(Detail|List)?$/.test(name)) {
        schemas[name] = structuredClone(schema)
        rewriteSchemaExamples(schemas[name])
      }
    }
  }

  // An inline spec has no source URL for Vocs to resolve relative servers against.
  // Resolve them here so the Try client continues to call the API host.
  if (Array.isArray(spec.servers)) {
    for (const server of spec.servers) {
      if (isObject(server) && typeof server.url === 'string')
        server.url = new URL(server.url, sourceUrl).href.replace(/\/$/, '')
    }
  }
  if (isObject(spec.paths)) {
    for (const [pathname, path] of Object.entries(spec.paths)) {
      if (!isObject(path)) continue
      prepareEarnRequestExamples(pathname, path)
      for (const operation of Object.values(path)) {
        if (!isObject(operation)) continue
        const openRpc = operation['x-openrpc']
        if (typeof openRpc === 'string' && !openRpc.trimStart().startsWith('{'))
          operation['x-openrpc'] = new URL(openRpc, sourceUrl).href
      }
    }
  }
  return spec
}

export async function loadTempoOpenApi(source = canonicalSpecUrl) {
  const remote = /^https?:\/\//.test(source)
  let spec: Record<string, unknown>
  if (remote) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`Failed to fetch Tempo OpenAPI: ${response.status}`)
    spec = await response.json()
  } else spec = JSON.parse(await readFile(source, 'utf8'))
  return prepareTempoOpenApi(spec, remote ? source : canonicalSpecUrl)
}
