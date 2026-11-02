import { afterEach, describe, expect, it, vi } from 'vitest'

describe('developersPath', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses root-relative paths outside production deployments', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    const { developersPath } = await import('./developersPaths')

    expect(developersPath('/')).toBe('/')
    expect(developersPath('/#open-source')).toBe('/#open-source')
    expect(developersPath('/docs')).toBe('/docs')
    expect(developersPath('/build/tempo-transactions')).toBe('/build/tempo-transactions')
  })

  it('uses the developers mount in production deployments', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const { developersPath } = await import('./developersPaths')

    expect(developersPath('/')).toBe('/developers')
    expect(developersPath('/#open-source')).toBe('/developers/#open-source')
    expect(developersPath('/docs')).toBe('/developers/docs')
    expect(developersPath('/build/tempo-transactions')).toBe('/developers/build/tempo-transactions')
  })
})

describe('developersApiPath', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it.each([
    ['https://developers.tempo.xyz/docs/routes/test', '/api/routes-quote'],
    ['https://tempo.xyz/developers/docs/routes/test', '/developers/api/routes-quote'],
    ['https://tempo.xyz/developers', '/developers/api/routes-quote'],
    ['https://tempo.xyz/developersx/docs', '/api/routes-quote'],
    ['http://localhost:5173/docs/routes/test', '/api/routes-quote'],
  ])('follows the mount the page was served from: %s', async (page, expected) => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubGlobal('location', new URL(page))
    const { developersApiPath } = await import('./developersPaths')

    expect(developersApiPath('/api/routes-quote')).toBe(expected)
  })

  it('uses the deployment mount without a page', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const { developersApiPath } = await import('./developersPaths')

    expect(developersApiPath('/api/zone-rpc?zone=1')).toBe('/developers/api/zone-rpc?zone=1')
  })
})
