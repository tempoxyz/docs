import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'
import {
  canonicalDocsUrl,
  GRAPHITE_RELATED_DOCS_ENDPOINT,
  PUBLIC_DOCS_PREFIX,
  parseGraphiteRelatedDocs,
  type RelatedDocsLink,
  type RelatedDocsManifest,
  TEMPO_ORIGIN,
} from '../src/lib/graphite-related-docs'

const virtualModuleId = 'virtual:graphite-related-docs'
const resolvedVirtualModuleId = `\0${virtualModuleId}`
const productionSitemapUrl = `${TEMPO_ORIGIN}/developers/sitemap.xml`
const cacheMaxAgeMs = 24 * 60 * 60 * 1_000
const cacheVersion = 1
const maxConcurrency = 6
const requestStartIntervalMs = 75
const requestTimeoutMs = 4_000
const maxResponseBytes = 250_000
const circuitBreakerFailureThreshold = 3

type CacheFile = {
  generatedAt: number
  manifest: RelatedDocsManifest
  sourceUrls: string[]
  version: number
}

type FetchResult = {
  links: RelatedDocsLink[]
  ok: boolean
  retryableFailure: boolean
}

const manifestPromises = new Map<string, Promise<RelatedDocsManifest>>()
const requestPromises = new Map<string, Promise<FetchResult>>()

export function graphiteRelatedDocsPlugin(): Plugin {
  let rootDirectory = process.cwd()

  return {
    name: 'tempo-graphite-related-docs',
    configResolved(config) {
      rootDirectory = config.root
    },
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) return

      let promise = manifestPromises.get(rootDirectory)
      if (!promise) {
        promise = buildRelatedDocsManifest(rootDirectory)
        manifestPromises.set(rootDirectory, promise)
      }

      const manifest = await promise.catch(() => ({}))
      return `export default ${JSON.stringify(manifest)}`
    },
  }
}

export function docsPageRouteFromFile(filePath: string): string | undefined {
  const normalized = filePath.replaceAll(path.sep, '/').replace(/^\.?\//, '')
  const prefix = 'src/pages/docs/'
  if (!normalized.startsWith(prefix) || !/\.mdx?$/.test(normalized)) return

  let route = normalized.slice('src/pages/'.length).replace(/\.mdx?$/, '')
  if (route === 'docs/index') route = 'docs'
  else if (route.endsWith('/index')) route = route.slice(0, -'/index'.length)
  if (route.split('/').some((segment) => segment.startsWith('_'))) return

  return `/${route}`
}

async function buildRelatedDocsManifest(rootDirectory: string): Promise<RelatedDocsManifest> {
  const localRoutes = await discoverLocalDocsRoutes(rootDirectory)
  const localSourceUrls = localRoutes.flatMap((route) => {
    const source = canonicalDocsUrl(route)
    return source ? [source] : []
  })
  const cached = await readCache(rootDirectory)

  if (
    cached &&
    Date.now() - cached.generatedAt < cacheMaxAgeMs &&
    localSourceUrls.every((source) => cached.sourceUrls.includes(source))
  ) {
    return cached.manifest
  }

  const sitemapSourceUrls = await discoverSitemapDocsUrls()
  const sourceUrls = [...new Set([...localSourceUrls, ...sitemapSourceUrls])].sort()
  const waitForStart = createStartRateLimiter(requestStartIntervalMs)
  const manifest: RelatedDocsManifest = {}
  let successfulRequests = 0
  let consecutiveFailures = 0
  let circuitOpen = false

  await mapWithConcurrency(sourceUrls, maxConcurrency, async (sourceUrl) => {
    if (circuitOpen) {
      const route = new URL(sourceUrl).pathname.slice('/developers'.length) || '/'
      manifest[route] = cached?.manifest[route] ?? []
      return
    }

    await waitForStart()
    if (circuitOpen) {
      const route = new URL(sourceUrl).pathname.slice('/developers'.length) || '/'
      manifest[route] = cached?.manifest[route] ?? []
      return
    }

    const result = await fetchRelatedDocs(sourceUrl)
    if (result.ok) successfulRequests += 1
    if (result.retryableFailure) {
      consecutiveFailures += 1
      if (consecutiveFailures >= circuitBreakerFailureThreshold && !circuitOpen) {
        circuitOpen = true
        console.warn(
          `[Graphite ILAPI] Skipping remaining docs requests after ${consecutiveFailures} consecutive upstream failures.`,
        )
      }
    } else {
      consecutiveFailures = 0
    }

    const route = new URL(sourceUrl).pathname.slice('/developers'.length) || '/'
    manifest[route] = result.ok ? result.links : (cached?.manifest[route] ?? [])
  })

  if (isCompleteManifestRefresh(successfulRequests, sourceUrls.length)) {
    await writeCache(rootDirectory, {
      generatedAt: Date.now(),
      manifest,
      sourceUrls,
      version: cacheVersion,
    })
  } else if (successfulRequests === 0 && cached) {
    return cached.manifest
  }

  return manifest
}

export function isCompleteManifestRefresh(
  successfulRequests: number,
  totalRequests: number,
): boolean {
  return totalRequests > 0 && successfulRequests === totalRequests
}

async function discoverLocalDocsRoutes(rootDirectory: string): Promise<string[]> {
  const pagesDirectory = path.join(rootDirectory, 'src/pages/docs')
  const files = await filesWithin(pagesDirectory)
  return files.flatMap((file) => {
    const route = docsPageRouteFromFile(path.relative(rootDirectory, file))
    return route ? [route] : []
  })
}

async function discoverSitemapDocsUrls(): Promise<string[]> {
  try {
    const response = await fetch(productionSitemapUrl, {
      headers: { accept: 'application/xml,text/xml' },
      signal: AbortSignal.timeout(requestTimeoutMs),
    })
    if (!response.ok) return []

    const xml = await response.text()
    const urls: string[] = []
    for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
      const rawUrl = match[1]?.replaceAll('&amp;', '&')
      if (!rawUrl) continue

      try {
        const url = new URL(rawUrl)
        if (
          url.origin === TEMPO_ORIGIN &&
          (url.pathname === PUBLIC_DOCS_PREFIX || url.pathname.startsWith(`${PUBLIC_DOCS_PREFIX}/`))
        ) {
          urls.push(`${url.origin}${url.pathname}${url.search}`)
        }
      } catch {
        // Ignore invalid sitemap entries.
      }
    }
    return urls
  } catch {
    return []
  }
}

function fetchRelatedDocs(sourceUrl: string): Promise<FetchResult> {
  const cached = requestPromises.get(sourceUrl)
  if (cached) return cached

  const request = (async (): Promise<FetchResult> => {
    try {
      const endpoint = new URL(GRAPHITE_RELATED_DOCS_ENDPOINT)
      endpoint.searchParams.set('url', sourceUrl)
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(requestTimeoutMs) })
      if (response.status === 204) {
        return { links: [], ok: true, retryableFailure: false }
      }
      if (!response.ok) {
        const retryableFailure = response.status === 429 || response.status >= 500
        return { links: [], ok: !retryableFailure, retryableFailure }
      }

      const rawBody = await readResponseText(response, maxResponseBytes)
      if (rawBody === undefined) {
        return { links: [], ok: false, retryableFailure: true }
      }
      const payload: unknown = JSON.parse(rawBody)
      if (
        typeof payload !== 'object' ||
        payload === null ||
        !Array.isArray((payload as { related_links?: unknown }).related_links)
      ) {
        return { links: [], ok: false, retryableFailure: true }
      }
      return {
        links: parseGraphiteRelatedDocs(payload, sourceUrl),
        ok: true,
        retryableFailure: false,
      }
    } catch {
      return { links: [], ok: false, retryableFailure: true }
    }
  })()

  requestPromises.set(sourceUrl, request)
  return request
}

async function readResponseText(response: Response, maxBytes: number): Promise<string | undefined> {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return

  if (!response.body) {
    const text = await response.text()
    return new TextEncoder().encode(text).byteLength <= maxBytes ? text : undefined
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let totalBytes = 0
  let text = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      return
    }
    text += decoder.decode(value, { stream: true })
  }

  return text + decoder.decode()
}

function createStartRateLimiter(intervalMs: number): () => Promise<void> {
  let nextStartAt = 0
  let queue = Promise.resolve()

  return () => {
    const ready = queue.then(async () => {
      const delay = Math.max(0, nextStartAt - Date.now())
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay))
      nextStartAt = Date.now() + intervalMs
    })
    queue = ready.catch(() => undefined)
    return ready
  }
}

async function mapWithConcurrency<T>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<void>,
): Promise<void> {
  let cursor = 0

  async function worker() {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      const value = values[index]
      if (value !== undefined) await mapper(value)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()))
}

async function filesWithin(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) return filesWithin(entryPath)
        return entry.isFile() ? [entryPath] : []
      }),
    )
    return files.flat()
  } catch {
    return []
  }
}

async function readCache(rootDirectory: string): Promise<CacheFile | undefined> {
  try {
    const contents = await fs.readFile(cachePath(rootDirectory), 'utf8')
    const cache: unknown = JSON.parse(contents)
    if (!isCacheFile(cache)) return
    return cache
  } catch {
    return
  }
}

async function writeCache(rootDirectory: string, cache: CacheFile): Promise<void> {
  try {
    const filePath = cachePath(rootDirectory)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(cache), 'utf8')
  } catch {
    // Caching is an optimization. A read-only build filesystem must not fail the build.
  }
}

function cachePath(rootDirectory: string): string {
  return path.join(rootDirectory, 'node_modules/.cache/graphite-related-docs.json')
}

function isCacheFile(value: unknown): value is CacheFile {
  if (typeof value !== 'object' || value === null) return false
  const cache = value as Partial<CacheFile>
  return (
    cache.version === cacheVersion &&
    typeof cache.generatedAt === 'number' &&
    Array.isArray(cache.sourceUrls) &&
    cache.sourceUrls.every((source) => typeof source === 'string') &&
    typeof cache.manifest === 'object' &&
    cache.manifest !== null
  )
}
