import MiniSearch from 'minisearch'
import type { DerivedField, SearchVariant } from './config.ts'
import type { Doc } from './corpus.ts'

type SearchDoc = Doc & Partial<Record<DerivedField, string>>
type SearchHit = { id: unknown; href: string }

export function tokenize(text: string): string[] {
  const tokens: string[] = []
  for (const word of text.split(/[\s\-._/:@]+/)) {
    if (!word) continue
    tokens.push(word.toLowerCase())
    const split = word
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .split(/\s+/)
      .map((w) => w.toLowerCase())
      .filter((w) => w.length > 0)
    if (split.length > 1) tokens.push(...split)
  }
  return tokens.filter((w) => w.length > 0)
}

export function pagePath(href: string): string {
  return href.split('#')[0] ?? href
}

function prepareDoc(doc: Doc, variant: SearchVariant): SearchDoc {
  const indexed: SearchDoc = { ...doc }
  for (const field of variant.derivedFields ?? []) {
    if (field === 'path') {
      indexed.path = pagePath(doc.href)
        .replace(/^\/docs\//, '/')
        .replaceAll('/', ' ')
    } else {
      indexed.excerpt = doc.text
        .trim()
        .split(/\s+/)
        .slice(0, variant.excerptWords ?? 40)
        .join(' ')
    }
  }
  return indexed
}

function pagesFromHits(hits: SearchHit[]): string[] {
  const seen = new Set<string>()
  const pages: string[] = []
  for (const hit of hits) {
    const page = pagePath(hit.href)
    if (seen.has(page)) continue
    seen.add(page)
    pages.push(page)
  }
  return pages
}

export function buildSearch(variant: SearchVariant, docs: Doc[]): (query: string) => string[] {
  const index = new MiniSearch<SearchDoc>({
    fields: variant.fields,
    storeFields: variant.storeFields,
    tokenize,
  })
  index.addAll(docs.map((doc) => prepareDoc(doc, variant)))

  return (query) => {
    const hits = index.search(query, {
      ...variant.searchOptions,
      tokenize,
    }) as unknown as SearchHit[]
    if (!variant.fallbackOptions || hits.length >= (variant.minResultsBeforeFallback ?? 1)) {
      return pagesFromHits(hits)
    }

    const seen = new Set(hits.map((hit) => hit.id))
    const fallbackHits = index
      .search(query, { ...variant.fallbackOptions, tokenize })
      .map((hit) => hit as unknown as SearchHit)
      .filter((hit) => !seen.has(hit.id))
    return pagesFromHits([...hits, ...fallbackHits])
  }
}
