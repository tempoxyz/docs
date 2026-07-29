import { getSearchIndex } from 'virtual:vocs/search-index'
import MiniSearch, { type Options, type SearchOptions } from 'minisearch'

// Mirrors the search config in vocs.config.ts so the marketing search loads the
// same serialized index that the docs search dialog uses.
const searchFields = ['title', 'titles', 'subtitle', 'path', 'excerpt']
const storeFields = [
  'category',
  'excerpt',
  'href',
  'path',
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
  excerpt?: string
  path?: string
  type: 'page' | 'section' | 'nav'
  searchPriority?: number
  terms?: string[]
}

type SearchIndexes = {
  docs: MiniSearch<SearchResult>
  blog: MiniSearch<SearchResult>
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

const searchOptions: SearchOptions = {
  combineWith: 'OR',
  fuzzy: 0.1,
  prefix: false,
  boost: { title: 5, subtitle: 3, titles: 2, path: 3, excerpt: 3 },
  boostDocument: (_id, _term, storedFields) => {
    const priority = (storedFields?.searchPriority as number | undefined) ?? 1
    const href = storedFields?.href as string | undefined
    const isDocsPath = href?.startsWith('/docs/') ?? false
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

let indexPromise: Promise<SearchIndexes> | null = null

function createBlogIndex(
  documents: (SearchResult & { searchText: string })[],
): MiniSearch<SearchResult> {
  const index = new MiniSearch<SearchResult>({
    fields: ['title', 'excerpt', 'searchText', 'category'],
    storeFields,
    tokenize,
  })
  index.addAll(documents)
  return index
}

/** Loads (and caches) the MiniSearch index that Vocs built. */
export function loadSearchIndex(): Promise<SearchIndexes> {
  if (!indexPromise) {
    indexPromise = Promise.all([
      getSearchIndex(),
      import('virtual:blog-search-documents').then(({ documents }) => documents),
    ])
      .then(([json, documents]) => ({
        docs: MiniSearch.loadJSON<SearchResult>(json, loadOptions),
        blog: createBlogIndex(
          documents.map((post) => ({
            id: `blog:${post.slug}`,
            href: `/blog/${post.slug}`,
            title: post.title,
            titles: [],
            text: post.excerpt,
            excerpt: post.excerpt,
            category: 'Blog',
            type: 'page',
            searchText: post.searchText,
          })),
        ),
      }))
      .catch((error) => {
        // Reset so a later open can retry rather than caching the failure.
        indexPromise = null
        throw error
      })
  }
  return indexPromise
}

export function searchDocs(index: SearchIndexes, query: string): SearchResult[] {
  if (!query.trim()) return []
  return [
    ...index.docs.search(query, { ...searchOptions, tokenize }),
    ...index.blog.search(query, {
      combineWith: 'OR',
      fuzzy: 0.1,
      prefix: false,
      boost: { title: 5, excerpt: 3, category: 2, searchText: 1 },
      tokenize,
    }),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) as unknown as SearchResult[]
}
