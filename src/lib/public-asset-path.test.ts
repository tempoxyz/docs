import { afterEach, describe, expect, it, vi } from 'vitest'
import { publicAssetPath } from './public-asset-path'

afterEach(() => vi.unstubAllEnvs())

describe('publicAssetPath', () => {
  const markdown = '/assets/md/docs/guide/payments/send-a-payment.md'

  it('keeps local and preview assets at the origin root', () => {
    expect(publicAssetPath(markdown, '/')).toBe(markdown)
    expect(publicAssetPath('/llms.txt', '')).toBe('/llms.txt')
  })

  it('keeps Markdown and agent resources inside the public developers mount', () => {
    expect(publicAssetPath(markdown, '/developers/')).toBe(`/developers${markdown}`)
    expect(publicAssetPath('/llms.txt', '/developers/')).toBe('/developers/llms.txt')
    expect(publicAssetPath('llms-full.txt', '/developers')).toBe('/developers/llms-full.txt')
  })

  it('does not duplicate an existing mount or lose query strings and fragments', () => {
    const path = '/developers/assets/md/docs/api.md?download=1#api'
    expect(publicAssetPath(path, '/developers/')).toBe(path)
    expect(publicAssetPath('/assets/logo.svg?v=2#mark', '/reference/')).toBe(
      '/reference/assets/logo.svg?v=2#mark',
    )
  })

  it('preserves assets hosted outside this application', () => {
    expect(publicAssetPath('https://example.com/logo.svg', '/developers/')).toBe(
      'https://example.com/logo.svg',
    )
    expect(publicAssetPath('//example.com/logo.svg', '/developers/')).toBe('//example.com/logo.svg')
  })

  it('uses the runtime Waku mount by default', () => {
    vi.stubEnv('WAKU_CONFIG_BASE_PATH', '/developers/')
    expect(publicAssetPath(markdown)).toBe(`/developers${markdown}`)
    vi.stubEnv('WAKU_CONFIG_BASE_PATH', '/')
    expect(publicAssetPath(markdown)).toBe(markdown)
    vi.stubEnv('WAKU_CONFIG_BASE_PATH', undefined)
    expect(publicAssetPath('/llms.txt')).toBe('/llms.txt')
  })
})
