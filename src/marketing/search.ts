import { getSearchIndex } from 'virtual:marketing/search-index'
import MiniSearch, { type Options, type SearchOptions } from 'minisearch'

// The fields, store fields and tokenizer below mirror Vocs' internal search
// config (vocs/dist/internal/search.client.js) so the index that Vocs builds is
// queried here exactly as it is inside the docs app. Vocs doesn't export these,
// so they're duplicated and must be kept in sync.
const searchFields = ['category', 'subtitle', 'text', 'title', 'titles']
const storeFields = [
  'category',
  'href',
  'searchPriority',
  'subtitle',
  'text',
  'title',
  'titles',
  'type',
]

export type SearchResult = {
  id: string
  href: string
  title: string
  titles: string[]
  text: string
  category?: string
  type: 'page' | 'section' | 'nav'
  searchPriority?: number
  terms?: string[]
}

/**
 * Splits on whitespace, punctuation and camelCase/PascalCase, keeping both the
 * original and the sub-tokens. Copied verbatim from Vocs' tokenizer so query
 * tokenization matches how the index was built.
 *
 * "createUser" → ["createuser", "create", "user"]
 */
function tokenize(text: string): string[] {
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

// Mirrors Vocs' resolved default `search` options (vocs/dist/internal/config.js)
// so ranking matches the docs search dialog.
const searchOptions: SearchOptions = {
  combineWith: 'AND',
  fuzzy: 0.2,
  prefix: true,
  boost: { title: 4, subtitle: 3, text: 2, category: 1, titles: 1 },
  boostDocument: (_id, _term, storedFields) => {
    const priority = (storedFields?.searchPriority as number | undefined) ?? 1
    const href = storedFields?.href as string | undefined
    const isDocsPath = href?.startsWith('/docs/') ?? false
    // Treat /docs/ as root for depth calculation (subtract 1).
    const segments = href ? href.split('/').filter(Boolean).length : 1
    const depth = isDocsPath ? Math.max(segments - 1, 1) : segments
    const depthBoost = 1 / Math.max(depth, 1)
    const docsBoost = isDocsPath ? 1.5 : 1
    return priority * depthBoost * docsBoost
  },
}

const loadOptions: Options<SearchResult> = {
  fields: searchFields,
  storeFields,
  tokenize,
}

let indexPromise: Promise<MiniSearch<SearchResult>> | null = null

/** Loads (and caches) the MiniSearch index that Vocs built. */
export function loadSearchIndex(): Promise<MiniSearch<SearchResult>> {
  if (!indexPromise) {
    indexPromise = getSearchIndex()
      .then((json) => MiniSearch.loadJSON<SearchResult>(json, loadOptions))
      .catch((error) => {
        // Reset so a later open can retry rather than caching the failure.
        indexPromise = null
        throw error
      })
  }
  return indexPromise
}

export function searchDocs(index: MiniSearch<SearchResult>, query: string): SearchResult[] {
  if (!query.trim()) return []
  return index
    .search(query, { ...searchOptions, tokenize })
    .slice(0, 20) as unknown as SearchResult[]
}
