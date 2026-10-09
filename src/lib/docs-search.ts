// Blog search navigates to the docs shell, where DocsHeader opens Vocs search.
export const DOCS_SEARCH_PARAM = 'search'

/** URL that opens the docs search dialog on arrival (handled by DocsHeader). */
export function docsSearchUrl(): string {
  return `/?${DOCS_SEARCH_PARAM}=1`
}
