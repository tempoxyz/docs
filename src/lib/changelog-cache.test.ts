import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { Changelog } from 'vocs/config'
import { cacheChangelog } from './changelog-cache'

const release = (version: string): Changelog.Release => ({
  body: '',
  date: '2026-10-01T00:00:00Z',
  title: version,
  url: `https://github.com/tempoxyz/tempo/releases/tag/${version}`,
  version,
})

function adapter(...results: (Changelog.Release[] | Error)[]) {
  const fetch = vi.fn(async () => {
    const result = results.shift()
    if (!result) throw new Error('Unexpected fetch')
    if (result instanceof Error) throw result
    return result
  })
  return { adapter: { type: 'test', fetch } satisfies Changelog.Adapter, fetch }
}

let cacheCount = 0
const name = () => `test-${++cacheCount}`

describe('cacheChangelog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-10-14T00:00:00Z') })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('reuses releases until they expire', async () => {
    const { adapter: source, fetch } = adapter([release('v1.0.0')], [release('v1.1.0')])
    const cached = cacheChangelog(source, { maxAge: 60_000, name: name() })

    await expect(cached.fetch({ limit: 20 })).resolves.toEqual([release('v1.0.0')])
    vi.advanceTimersByTime(59_000)
    await expect(cached.fetch({ limit: 20 })).resolves.toEqual([release('v1.0.0')])
    expect(fetch).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1_000)
    await expect(cached.fetch({ limit: 20 })).resolves.toEqual([release('v1.1.0')])
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  test('shares one request between concurrent calls with the same options', async () => {
    const { adapter: source, fetch } = adapter([release('v1.0.0')], [release('v0.9.0')])
    const cached = cacheChangelog(source, { name: name() })

    const [first, second, other] = await Promise.all([
      cached.fetch({ limit: 20 }),
      cached.fetch({ limit: 20 }),
      cached.fetch({ limit: 5 }),
    ])
    expect(first).toBe(second)
    expect(other).toEqual([release('v0.9.0')])
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  test('shares entries between adapters with the same cache name', async () => {
    const cacheName = name()
    const { adapter: first } = adapter([release('v1.0.0')])
    const { adapter: second, fetch } = adapter([release('v2.0.0')])

    await cacheChangelog(first, { name: cacheName }).fetch()
    await expect(cacheChangelog(second, { name: cacheName }).fetch()).resolves.toEqual([
      release('v1.0.0'),
    ])
    expect(fetch).not.toHaveBeenCalled()
  })

  test('serves cached releases and waits before retrying after a failed refresh', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { adapter: source, fetch } = adapter(
      [release('v1.0.0')],
      new Error('Failed to fetch GitHub releases: rate limit exceeded'),
      [release('v1.1.0')],
    )
    const cached = cacheChangelog(source, { maxAge: 60_000, name: name(), retryAfter: 120_000 })

    await cached.fetch()
    vi.advanceTimersByTime(60_000)
    await expect(cached.fetch()).resolves.toEqual([release('v1.0.0')])
    await expect(cached.fetch()).resolves.toEqual([release('v1.0.0')])
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('rate limit exceeded')

    vi.advanceTimersByTime(120_000)
    await expect(cached.fetch()).resolves.toEqual([release('v1.1.0')])
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  test('rethrows a failure without refetching until the retry delay passes', async () => {
    const failure = new Error('fetch failed')
    const { adapter: source, fetch } = adapter(failure, [release('v1.0.0')])
    const cached = cacheChangelog(source, { name: name(), retryAfter: 120_000 })

    await expect(cached.fetch()).rejects.toBe(failure)
    await expect(cached.fetch()).rejects.toBe(failure)
    expect(fetch).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(120_000)
    await expect(cached.fetch()).resolves.toEqual([release('v1.0.0')])
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
