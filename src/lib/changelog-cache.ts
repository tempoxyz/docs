import type { Changelog } from 'vocs/config'

type Entry = {
  error?: unknown
  failedAt?: number | undefined
  fetchedAt?: number | undefined
  pending?: Promise<Changelog.Release[]> | undefined
  /** The last successful result, served when a later refresh fails. */
  releases?: Changelog.Release[] | undefined
}

// Vite evaluates the config module again after edits to its imports, so entries
// live on `globalThis`, keyed by cache name, to survive those reloads.
const shared = globalThis as { [key: symbol]: unknown }
const cachesKey = Symbol.for('tempo.docs.changelog-cache')
shared[cachesKey] ??= new Map()
const caches = shared[cachesKey] as Map<string, Map<string, Entry>>

/**
 * Caches a changelog adapter's releases in memory.
 *
 * Page renders, Markdown exports, and builds each fetch the changelog, so an
 * uncached adapter calls the GitHub API on every dev export and soon hits the
 * unauthenticated rate limit. A failed refresh serves the last releases and
 * waits `retryAfter` before trying again. With nothing cached, it rethrows the
 * failure during that wait, so callers still render their unavailable state.
 */
export function cacheChangelog(
  adapter: Changelog.Adapter,
  options: cacheChangelog.Options,
): Changelog.Adapter {
  const { maxAge = 10 * 60_000, name, retryAfter = 5 * 60_000 } = options
  const entries = caches.get(name) ?? new Map<string, Entry>()
  caches.set(name, entries)

  return {
    ...adapter,
    fetch(fetchOptions = {}) {
      const key = JSON.stringify([fetchOptions.limit ?? null, fetchOptions.prereleases ?? null])
      const entry = entries.get(key) ?? {}
      entries.set(key, entry)
      if (entry.pending) return entry.pending

      const now = Date.now()
      if (entry.releases && entry.fetchedAt !== undefined && now - entry.fetchedAt < maxAge)
        return Promise.resolve(entry.releases)
      if (entry.failedAt !== undefined && now - entry.failedAt < retryAfter)
        return entry.releases ? Promise.resolve(entry.releases) : Promise.reject(entry.error)

      entry.pending = adapter
        .fetch(fetchOptions)
        .then(
          (releases) => {
            Object.assign(entry, {
              error: undefined,
              failedAt: undefined,
              fetchedAt: Date.now(),
              releases,
            })
            return releases
          },
          (error: unknown) => {
            Object.assign(entry, { error, failedAt: Date.now() })
            if (!entry.releases) throw error
            console.warn(
              `[changelog] Serving cached releases for ${name}: ${error instanceof Error ? error.message : String(error)}`,
            )
            return entry.releases
          },
        )
        .finally(() => {
          entry.pending = undefined
        })
      return entry.pending
    },
  }
}

export declare namespace cacheChangelog {
  type Options = {
    /** How long, in milliseconds, to reuse fetched releases. Defaults to 10 minutes. */
    maxAge?: number | undefined
    /** Identifies the cache across reloads of the config module. */
    name: string
    /** How long, in milliseconds, to wait after a failure before fetching again. Defaults to 5 minutes. */
    retryAfter?: number | undefined
  }
}
