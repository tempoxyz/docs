// Shared contract between the marketing SPA and the Vocs docs app for opening
// the documentation search dialog.
//
// The marketing site (homepage etc.) has no Vocs runtime, so it can't open the
// search dialog itself. Instead it navigates to the docs with this query param,
// and `DocsHeader` detects it on mount and opens the (Vocs-owned) search dialog.
export const DOCS_SEARCH_PARAM = 'search'

/** URL that opens the docs search dialog on arrival (handled by DocsHeader). */
export function docsSearchUrl(): string {
  return `/docs?${DOCS_SEARCH_PARAM}=1`
}
