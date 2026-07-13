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
    expect(developersPath('/docs')).toBe('/docs')
    expect(developersPath('/build/tempo-transactions')).toBe('/build/tempo-transactions')
  })

  it('uses the developers mount in production deployments', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    const { developersPath } = await import('./developersPaths')

    expect(developersPath('/')).toBe('/developers')
    expect(developersPath('/docs')).toBe('/developers/docs')
    expect(developersPath('/build/tempo-transactions')).toBe('/developers/build/tempo-transactions')
  })
})
