export const GRAPHITE_RELATED_DOCS_ENDPOINT =
  'https://ilapi.graphite.io/tempoxyz/docs/related-links'
export const PUBLIC_DEVELOPERS_PREFIX = '/developers'
/** Public path of the docs pages, served at tempo.xyz/docs. */
export const PUBLIC_DOCS_PREFIX = '/docs'
export const TEMPO_ORIGIN = 'https://tempo.xyz'
const MAX_LINKS = 32
const MAX_TITLE_CHARS = 240
const MAX_DESCRIPTION_CHARS = 500

export type RelatedDocsLink = {
  description?: string
  href: string
  title: string
  type: 'random' | 'related'
}

export type RelatedDocsManifest = Record<string, RelatedDocsLink[]>

export function normalizeDocsRoutePath(pathname: string): string {
  let normalized = pathname || '/'

  if (normalized === PUBLIC_DEVELOPERS_PREFIX) normalized = '/'
  else if (normalized.startsWith(`${PUBLIC_DEVELOPERS_PREFIX}/`)) {
    normalized = normalized.slice(PUBLIC_DEVELOPERS_PREFIX.length) || '/'
  }

  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, '')
  return normalized || '/'
}

export function canonicalDocsUrl(routePath: string): string | undefined {
  const normalized = normalizeDocsRoutePath(routePath)
  if (normalized !== '/docs' && !normalized.startsWith('/docs/')) return
  return `${TEMPO_ORIGIN}${normalized}`
}

export function relatedDocsForRoute(
  manifest: RelatedDocsManifest,
  routePath: string,
): RelatedDocsLink[] {
  return manifest[normalizeDocsRoutePath(routePath)] ?? []
}

export function parseGraphiteRelatedDocs(
  payload: unknown,
  sourceCanonicalUrl: string,
): RelatedDocsLink[] {
  if (!isRecord(payload) || !Array.isArray(payload.related_links)) return []

  const source = parseTempoUrl(sourceCanonicalUrl)
  if (!source) return []

  // Links indexed before the move to tempo.xyz/docs still carry the /developers mount.
  const sourcePath = normalizeDocsRoutePath(source.pathname)
  const seen = new Set<string>()
  const links: RelatedDocsLink[] = []

  for (const candidate of payload.related_links) {
    if (!isRecord(candidate)) continue
    if (candidate.type !== 'related' && candidate.type !== 'random') continue

    const title = boundedText(candidate.title, MAX_TITLE_CHARS)
    const target = typeof candidate.url === 'string' ? parseTempoUrl(candidate.url) : undefined
    const targetPath = target ? normalizeDocsRoutePath(target.pathname) : undefined
    if (
      !title ||
      !target ||
      !targetPath ||
      (targetPath !== PUBLIC_DOCS_PREFIX && !targetPath.startsWith(`${PUBLIC_DOCS_PREFIX}/`))
    ) {
      continue
    }
    if (targetPath === sourcePath) continue

    const href = `${targetPath}${target.search}${target.hash}`
    const targetKey = `${targetPath}${target.search}`
    if (seen.has(targetKey)) continue
    seen.add(targetKey)

    const description = boundedText(candidate.description, MAX_DESCRIPTION_CHARS)
    links.push({
      ...(description ? { description } : {}),
      href,
      title,
      type: candidate.type,
    })
    if (links.length >= MAX_LINKS) break
  }

  return links
}

function parseTempoUrl(value: string): URL | undefined {
  try {
    const url = new URL(value)
    if (url.origin !== TEMPO_ORIGIN || url.username || url.password) return
    return url
  } catch {
    return
  }
}

function boundedText(value: unknown, maxChars: number): string | undefined {
  if (typeof value !== 'string') return
  const normalized = value.trim()
  if (!normalized || normalized.length > maxChars) return

  for (const character of normalized) {
    const code = character.charCodeAt(0)
    if (code <= 31 || code === 127) return
  }
  return normalized
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
