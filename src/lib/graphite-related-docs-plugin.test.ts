import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  docsPageRouteFromFile,
  isCompleteManifestRefresh,
  openApiDocsRoutes,
  overlayLocalDocsMetadata,
} from '../../scripts/graphite-related-docs-plugin'
import type { RelatedDocsManifest } from './graphite-related-docs'

it('refreshes cached recommendation copy from local frontmatter without changing ranking', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'related-docs-metadata-'))
  try {
    const directory = path.join(root, 'src/pages/docs/protocol/zones')
    await fs.mkdir(directory, { recursive: true })
    const file = path.join(directory, 'proving.mdx')
    await fs.writeFile(file, '---\ntitle: "Current proving"\ndescription: Current limits.\n---\n')
    const manifest: RelatedDocsManifest = {
      '/docs/protocol/zones': [
        {
          href: '/docs/protocol/zones/proving#deployment-modes',
          title: 'Planned proving',
          description: 'Outdated guarantees.',
          type: 'related',
        },
        { href: '/docs/removed', title: 'Retired documentation', type: 'random' },
        { href: '/docs/api/routes/transfers', title: 'Transfers', type: 'related' },
        { href: '/docs/api/routes/quotes', title: 'Retired quotes', type: 'related' },
      ],
    }
    const first = await overlayLocalDocsMetadata(root, manifest, ['/docs/api/routes/transfers'])
    expect(first['/docs/protocol/zones']).toEqual([
      {
        ...manifest['/docs/protocol/zones'][0],
        title: 'Current proving',
        description: 'Current limits.',
      },
      manifest['/docs/protocol/zones'][2],
    ])

    await fs.writeFile(file, "---\ntitle: 'Updated proving'\n---\n")
    const second = await overlayLocalDocsMetadata(root, manifest)
    expect(second['/docs/protocol/zones'][0]).toMatchObject({
      title: 'Updated proving',
      description: 'Outdated guarantees.',
    })
    expect(manifest['/docs/protocol/zones'][0]?.title).toBe('Planned proving')
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})

it('discovers generated API routes from the configured spec instead of stale production links', async () => {
  const routes = await openApiDocsRoutes({
    rootDir: process.cwd(),
    openapi: [
      {
        path: '/docs/api',
        spec: {
          openapi: '3.1.0',
          info: { title: 'Tempo API', version: '1' },
          tags: [{ name: 'Routes transfers', 'x-pagePath': 'routes/transfers' }],
          paths: {
            '/v1/routes/transfers/quote': {
              get: {
                operationId: 'quoteTransfer',
                tags: ['Routes transfers'],
                responses: { '200': { description: 'Quote' } },
              },
            },
          },
        },
      },
    ],
  })
  expect(routes).toContain('/docs/api')
  expect(routes).toContain('/docs/api/routes/transfers')
  expect(routes).not.toContain('/docs/api/routes/quotes')
})

describe('docsPageRouteFromFile', () => {
  it.each([
    ['src/pages/docs/index.mdx', '/docs'],
    ['src/pages/docs/tools.mdx', '/docs/tools'],
    ['src/pages/docs/guide/payments/index.mdx', '/docs/guide/payments'],
    ['src/pages/docs/guide/payments/send-a-payment.mdx', '/docs/guide/payments/send-a-payment'],
    ['src/pages/docs/changelog.md', '/docs/changelog'],
  ])('maps %s to %s', (filePath, expected) => {
    expect(docsPageRouteFromFile(filePath)).toBe(expected)
  })

  it.each([
    'src/pages/docs/_layout.tsx',
    'src/pages/index.tsx',
    'src/pages/docs/not-markdown.txt',
  ])('ignores %s', (filePath) => {
    expect(docsPageRouteFromFile(filePath)).toBeUndefined()
  })
})

describe('isCompleteManifestRefresh', () => {
  it('persists only a complete non-empty refresh', () => {
    expect(isCompleteManifestRefresh(221, 221)).toBe(true)
    expect(isCompleteManifestRefresh(220, 221)).toBe(false)
    expect(isCompleteManifestRefresh(0, 0)).toBe(false)
  })
})
