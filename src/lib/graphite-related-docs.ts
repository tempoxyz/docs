export const GRAPHITE_RELATED_DOCS_ENDPOINT =
  'https://ilapi.graphite.io/tempoxyz/docs/related-links'
export const PUBLIC_DEVELOPERS_PREFIX = '/developers'
export const PUBLIC_DOCS_PREFIX = `${PUBLIC_DEVELOPERS_PREFIX}/docs`
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
  return `${TEMPO_ORIGIN}${PUBLIC_DEVELOPERS_PREFIX}${normalized}`
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

  const sourcePath = normalizeComparablePath(source.pathname)
  const seen = new Set<string>()
  const links: RelatedDocsLink[] = []

  for (const candidate of payload.related_links) {
    if (!isRecord(candidate)) continue
    if (candidate.type !== 'related' && candidate.type !== 'random') continue

    const title = boundedText(candidate.title, MAX_TITLE_CHARS)
    const target = typeof candidate.url === 'string' ? parseTempoUrl(candidate.url) : undefined
    if (
      !title ||
      !target ||
      (target.pathname !== PUBLIC_DOCS_PREFIX &&
        !target.pathname.startsWith(`${PUBLIC_DOCS_PREFIX}/`))
    ) {
      continue
    }
    if (normalizeComparablePath(target.pathname) === sourcePath) continue

    const href = `${target.pathname.slice(PUBLIC_DEVELOPERS_PREFIX.length)}${target.search}${target.hash}`
    const targetKey = `${normalizeComparablePath(target.pathname)}${target.search}`
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

function normalizeComparablePath(pathname: string): string {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return normalized || '/'
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
