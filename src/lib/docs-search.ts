import type { Options, SearchOptions } from 'minisearch'

// The website links here with ?search=1 to open Vocs search on arrival.
export const DOCS_SEARCH_PARAM = 'search'

type SearchDocument = Record<string, unknown>

// Vocs sends these functions to the browser as source text, so each one stays
// self-contained: no imports, module constants, or helpers outside its own body.

function extractDocsSearchField(document: SearchDocument, fieldName: string) {
  const href = String(document.href ?? '')
  if (fieldName === 'path') {
    return href
      .split('#')[0]
      .replace(/^\/docs\//, '/')
      .replaceAll('/', ' ')
  }
  if (fieldName === 'excerpt') {
    return String(document.text ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 24)
      .join(' ')
  }
  if (fieldName === 'aliases' || fieldName === 'keywords') {
    // Terms people search for that these pages' headings don't use. Only the page
    // document gets them, so it outranks its own sections. Two-word phrases go to
    // `aliases`; single words go to `keywords`, which carries less weight.
    if (document.type !== 'page') return undefined
    const aliases: Record<string, string[]> = {
      '/docs/api/console/api-keys': ['api key', 'api keys', 'api token'],
      '/docs/api/json-rpc': ['json rpc'],
      '/docs/quickstart/connection-details': [
        'rpc',
        'rpc url',
        'rpc endpoint',
        'chain id',
        'explorer',
      ],
      '/docs/quickstart/faucet': [
        'faucet',
        'testnet faucet',
        'test tokens',
        'testnet tokens',
        'testnet funds',
      ],
      '/get-started/quickstart': ['first payment'],
    }
    const terms = (aliases[href.split('#')[0]] ?? []).filter(
      (alias) => alias.includes(' ') === (fieldName === 'aliases'),
    )
    return terms.length ? terms.join('|') : undefined
  }
  if (fieldName === 'titles' && Array.isArray(document.titles)) {
    // Results show `category › ...titles`. Drop a title that repeats the category or
    // the title before it, so an endpoint reads "Tempo API › API keys".
    let previous = String(document.category ?? '')
      .trim()
      .toLowerCase()
    const titles: string[] = []
    for (const title of document.titles) {
      const current = String(title).trim().toLowerCase()
      if (current === previous) continue
      titles.push(String(title))
      previous = current
    }
    return titles
  }
  return document[fieldName]
}

function stringifyDocsSearchField(fieldValue: unknown) {
  // Join title stacks with spaces; the default comma join fuses the words around it.
  return Array.isArray(fieldValue) ? fieldValue.join(' ') : String(fieldValue)
}

function tokenizeDocsSearch(text: string, fieldName?: string) {
  // Each alias phrase is one term ("chain id" → ":chain-id"), so its words don't
  // boost the page for other queries such as "project id". The leading colon, which
  // the word split below removes from every other term, keeps a single word such as
  // "rpc" from prefix-matching a phrase.
  if (fieldName === 'aliases') {
    return text.split('|').map((alias) => `:${alias.trim().toLowerCase().replace(/\s+/g, '-')}`)
  }
  if (fieldName === 'keywords') return text.split('|')
  // The Vocs tokenizer: whitespace, punctuation, paths, and camelCase.
  const words = text.split(/[\s\-._/:@]+/).filter(Boolean)
  const tokens: string[] = []
  for (const word of words) {
    tokens.push(word.toLowerCase())
    const split = word
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .split(/\s+/)
      .map((part) => part.toLowerCase())
      .filter(Boolean)
    if (split.length > 1) tokens.push(...split)
  }
  // Queries (no field name) also search each pair of adjacent words as an alias term.
  if (fieldName === undefined) {
    for (let index = 1; index < words.length; index++) {
      tokens.push(`:${words[index - 1]}-${words[index]}`.toLowerCase())
    }
  }
  return tokens
}

function fuzzyDocsSearch(term: string) {
  // Alias phrase terms match exactly or by prefix, never fuzzily.
  return term.startsWith(':') ? false : 0.1
}

function boostDocsSearchDocument(
  documentId: unknown,
  _term: string,
  storedFields?: Record<string, unknown>,
) {
  const priority = (storedFields?.searchPriority as number | undefined) ?? 1
  const href = (storedFields?.href as string | undefined) ?? ''
  const segments = href ? href.split('/').filter(Boolean).length : 1
  const depth = href.startsWith('/docs/') ? Math.max(segments - 1, 1) : segments
  const docsBoost = href.startsWith('/docs/') ? 1.5 : 1
  // Guides answer intent queries ("api key", "faucet"), so generated API reference
  // entries rank below them and still surface for their own names. Home sections
  // repeat the pages they link to.
  let kindBoost = 1
  if (String(documentId).startsWith('openapi:')) {
    kindBoost = storedFields?.type === 'section' ? 0.5 : 0.6
  } else if (href === '/' || href.startsWith('/#')) {
    kindBoost = 0.35
  } else if (
    storedFields?.type === 'page' &&
    /^\/(?:get-started|docs\/guide|docs\/quickstart|docs\/api)\//.test(href)
  ) {
    kindBoost = 1.25
  }
  return priority * (1 / Math.max(depth, 1)) * docsBoost * kindBoost
}

export const docsSearch = {
  index: {
    fields: ['title', 'titles', 'subtitle', 'path', 'excerpt', 'aliases', 'keywords'],
    storeFields: ['path', 'excerpt'],
    extractField: extractDocsSearchField,
    stringifyField: stringifyDocsSearchField,
    tokenize: tokenizeDocsSearch,
  },
  query: {
    combineWith: 'OR',
    fuzzy: fuzzyDocsSearch,
    prefix: true,
    boost: { title: 5, subtitle: 3, titles: 2, path: 3, excerpt: 3, aliases: 60, keywords: 20 },
    boostDocument: boostDocsSearchDocument,
  },
} satisfies {
  index: Pick<Options, 'fields' | 'storeFields' | 'extractField' | 'stringifyField' | 'tokenize'>
  query: SearchOptions
}
