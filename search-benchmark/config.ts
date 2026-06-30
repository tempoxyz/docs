import type { SearchOptions } from 'minisearch'

export type DerivedField = 'path' | 'excerpt'

export type SearchVariant = {
  name: string
  description: string
  fields: string[]
  storeFields: string[]
  derivedFields?: DerivedField[]
  excerptWords?: number
  searchOptions: SearchOptions
  fallbackOptions?: SearchOptions
  minResultsBeforeFallback?: number
}

const productionBoost = { title: 4, subtitle: 3, text: 2, category: 1, titles: 1 }
const tunedProductionBoost = { title: 5, subtitle: 3, titles: 2, path: 3, excerpt: 3 }
const excerptPathTextBoost = { title: 5, subtitle: 3, titles: 2, path: 3, excerpt: 2, text: 2 }
const pathHeavyBoost = { title: 7, subtitle: 3, titles: 2, path: 6, excerpt: 1, text: 1 }
const balancedPathTextBoost = { title: 5, subtitle: 3, titles: 2, path: 3, text: 2 }

export function boostDocument(
  _documentId: unknown,
  _term: string,
  storedFields?: Record<string, unknown>,
): number {
  const priority = (storedFields?.searchPriority as number | undefined) ?? 1
  const href = storedFields?.href as string | undefined
  const isDocsPath = href?.startsWith('/docs/') ?? false
  const segments = href ? href.split('/').filter(Boolean).length : 1
  const depth = isDocsPath ? Math.max(segments - 1, 1) : segments
  const depthBoost = 1 / Math.max(depth, 1)
  const docsBoost = isDocsPath ? 1.5 : 1
  return priority * depthBoost * docsBoost
}

export const variants: SearchVariant[] = [
  {
    name: 'legacy-vocs-baseline',
    description: 'Previous unconfigured Vocs production settings.',
    fields: ['category', 'subtitle', 'text', 'title', 'titles'],
    storeFields: [
      'category',
      'href',
      'searchPriority',
      'subtitle',
      'text',
      'title',
      'titles',
      'type',
    ],
    searchOptions: {
      combineWith: 'AND',
      fuzzy: 0.2,
      prefix: true,
      boost: productionBoost,
      boostDocument,
    },
  },
  {
    name: 'production-baseline',
    description: 'Current Vocs 2.2.1 path/excerpt production settings.',
    fields: ['title', 'titles', 'subtitle', 'path', 'excerpt'],
    storeFields: [
      'category',
      'href',
      'searchPriority',
      'subtitle',
      'text',
      'title',
      'titles',
      'type',
    ],
    derivedFields: ['path', 'excerpt'],
    excerptWords: 24,
    searchOptions: {
      combineWith: 'OR',
      fuzzy: 0.1,
      prefix: false,
      boost: tunedProductionBoost,
      boostDocument,
    },
  },
  {
    name: 'path-excerpt-text-or-fallback',
    description: 'Candidate future config: exact path/excerpt/text search with OR fuzzy fallback.',
    fields: ['title', 'titles', 'subtitle', 'path', 'excerpt', 'text'],
    storeFields: [
      'category',
      'href',
      'searchPriority',
      'subtitle',
      'text',
      'title',
      'titles',
      'type',
    ],
    derivedFields: ['path', 'excerpt'],
    excerptWords: 80,
    searchOptions: {
      combineWith: 'AND',
      fuzzy: false,
      prefix: true,
      boost: excerptPathTextBoost,
      boostDocument,
    },
    fallbackOptions: {
      combineWith: 'OR',
      fuzzy: 0.2,
      prefix: true,
      boost: excerptPathTextBoost,
      boostDocument,
    },
    minResultsBeforeFallback: 3,
  },
  {
    name: 'path-heavy-or-fallback',
    description: 'Exact title/path/excerpt/text search with path-heavy OR fuzzy fallback.',
    fields: ['title', 'titles', 'subtitle', 'path', 'excerpt', 'text'],
    storeFields: ['href', 'searchPriority', 'title'],
    derivedFields: ['path', 'excerpt'],
    excerptWords: 80,
    searchOptions: {
      combineWith: 'AND',
      fuzzy: false,
      prefix: true,
      boost: pathHeavyBoost,
      boostDocument,
    },
    fallbackOptions: {
      combineWith: 'OR',
      fuzzy: 0.2,
      prefix: true,
      boost: pathHeavyBoost,
      boostDocument,
    },
    minResultsBeforeFallback: 3,
  },
  {
    name: 'path-text-or-fallback',
    description: 'Exact title/path/full-text search with balanced OR fuzzy fallback.',
    fields: ['title', 'titles', 'subtitle', 'path', 'text'],
    storeFields: ['href', 'searchPriority', 'title'],
    derivedFields: ['path'],
    searchOptions: {
      combineWith: 'AND',
      fuzzy: false,
      prefix: true,
      boost: balancedPathTextBoost,
      boostDocument,
    },
    fallbackOptions: {
      combineWith: 'OR',
      fuzzy: 0.2,
      prefix: true,
      boost: balancedPathTextBoost,
      boostDocument,
    },
    minResultsBeforeFallback: 3,
  },
]
