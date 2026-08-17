import { expect, test } from '@playwright/test'

test.skip(!process.env.CI, 'requires the production build output')

async function structuredData(request: import('@playwright/test').APIRequestContext, path: string) {
  const response = await request.get(path)
  expect(response.status(), `${path} should be served`).toBe(200)
  const html = await response.text()
  const scripts = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ]

  return scripts.flatMap(([, json]) => {
    const schema = JSON.parse(json ?? '') as Record<string, unknown>
    return Array.isArray(schema['@graph'])
      ? (schema['@graph'] as Record<string, unknown>[])
      : [schema]
  })
}

function nodesByType(nodes: Record<string, unknown>[], type: string) {
  return nodes.filter((entry) => {
    const entryType = entry['@type']
    return entryType === type || (Array.isArray(entryType) && entryType.includes(type))
  })
}

test('renders authored docs metadata and breadcrumbs into JSON-LD', async ({ request }) => {
  const nodes = await structuredData(request, '/docs/guide/payments/send-a-payment')
  const articles = nodesByType(nodes, 'TechArticle')
  const breadcrumbs = nodesByType(nodes, 'BreadcrumbList')

  expect(articles).toHaveLength(1)
  expect(articles[0]).toMatchObject({
    name: 'How to send a stablecoin payment on Tempo',
    headline: 'How to send a stablecoin payment on Tempo',
    description:
      'Send stablecoin payments between accounts on Tempo. Include optional memos for reconciliation and tracking with TypeScript, Rust, or Solidity.',
  })
  expect(breadcrumbs).toHaveLength(1)
  expect(breadcrumbs[0]?.itemListElement).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'Tempo Docs' }),
      expect.objectContaining({ name: 'How to send a stablecoin payment on Tempo' }),
    ]),
  )
})

test('keeps audited OpenAPI browser and structured-data titles separate', async ({ request }) => {
  const nodes = await structuredData(request, '/docs/api/console')
  const articles = nodesByType(nodes, 'TechArticle')

  expect(articles).toHaveLength(1)
  expect(articles[0]).toMatchObject({
    name: 'Using the Tempo API Console',
    headline: 'Using the Tempo API Console',
    description:
      'Use Tempo API Console to create projects and API keys, switch environments, monitor usage, configure billing, and manage organization access in one place.',
  })
})

test('renders authored OpenAPI guide metadata into JSON-LD', async ({ request }) => {
  const nodes = await structuredData(request, '/docs/api/authentication')
  const articles = nodesByType(nodes, 'TechArticle')

  expect(articles).toHaveLength(1)
  expect(articles[0]).toMatchObject({
    name: 'Authentication',
    headline: 'Authentication',
    description:
      'Authenticate requests to the Tempo blockchain API with public access, production or sandbox API keys, or MPP pay-per-request credentials.',
  })
})

test('renders generated OpenAPI page semantics into JSON-LD', async ({ request }) => {
  const nodes = await structuredData(request, '/docs/api/activities')
  const articles = nodesByType(nodes, 'TechArticle')

  expect(articles).toHaveLength(1)
  expect(articles[0]).toMatchObject({
    name: 'Activities · Tempo API',
    headline: 'Activities · Tempo API',
    description: 'A readable feed of what an account did onchain.',
  })
  expect(nodesByType(nodes, 'BreadcrumbList')).toHaveLength(1)
})
