import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { docsStructuredDataHead } from '../lib/docs-structured-data'
import { OG_IMAGE_VERSION } from '../lib/og-sections'
import PageHead from './PageHead'

const mocks = vi.hoisted(() => ({
  config: {} as Record<string, unknown>,
  path: '/blog/inside-tempo-zones',
}))

vi.mock('waku', () => ({
  useRouter: () => ({ path: mocks.path }),
}))

vi.mock('virtual:vocs/config', () => ({
  get config() {
    return mocks.config
  },
}))

// Exercise the installed Vocs head and context without importing unrelated UI.
vi.mock('vocs', async () => {
  const { Head } = await import('../../node_modules/vocs/dist/react/Head.js')
  const { Provider } = await import('../../node_modules/vocs/dist/react/MdxPageContext.js')
  return { Head, MdxPageContextProvider: Provider }
})

beforeEach(() => {
  mocks.path = '/blog/inside-tempo-zones'
  mocks.config = {
    basePath: '/',
    colorScheme: 'light dark',
    head: docsStructuredDataHead,
    jsonLd: false,
    ogImageUrl: `/api/og?title=%title&section=BLOG&v=${OG_IMAGE_VERSION}`,
    renderStrategy: 'dynamic',
    title: 'Tempo',
  }
})

function imageMeta(html: string, name: string): string[] {
  return [...html.matchAll(/<meta\b[^>]*>/g)].flatMap(([tag]) => {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]),
    )
    return attributes.name === name || attributes.property === name
      ? [attributes.content.replaceAll('&amp;', '&')]
      : []
  })
}

describe('PageHead blog images', () => {
  test.each([
    ['production', 'https://tempo.xyz/developers'],
    ['preview', ''],
  ])('emits one custom OG and X image in %s', (_environment, base) => {
    mocks.config.baseUrl = base || undefined
    const image = `${base}/blog/inside-tempo-zones-og.png`
    const html = renderToStaticMarkup(
      <PageHead
        title="Inside Tempo Zones"
        description="Private execution environments connected to Tempo Mainnet."
        ogImage={image}
      />,
    )

    expect(imageMeta(html, 'og:type')).toEqual(['article'])
    expect(imageMeta(html, 'og:image')).toEqual([image])
    expect(imageMeta(html, 'twitter:image')).toEqual([image])
  })

  test('retains the generated image for another post without a custom image', () => {
    mocks.path = '/blog/t7-network-upgrade'
    const html = renderToStaticMarkup(
      <PageHead title="T7 network upgrade" description="Lower fees on Tempo." />,
    )
    const expected = `/api/og?title=T7%20network%20upgrade&section=BLOG&v=${OG_IMAGE_VERSION}`

    expect(imageMeta(html, 'og:type')).toEqual(['article'])
    expect(imageMeta(html, 'og:image')).toEqual([expected])
    expect(imageMeta(html, 'twitter:image')).toEqual([expected])
  })
})
