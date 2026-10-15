import type { MarkdownOutputTransform } from 'vocs'
import { renderAiIndex, renderAiPage } from './ai-docs'
import { resolveBaseUrl } from './base-url'
import { canonicalizeGeneratedDeveloperLinks } from './canonical-developer-links'

/** Add product context before Vocs assembles, validates, and hashes every export. */
export const transformMarkdownOutput: MarkdownOutputTransform = ({ index, pages }) => {
  const canonical = (content: string) =>
    process.env.VERCEL_ENV === 'production'
      ? canonicalizeGeneratedDeveloperLinks(content, `${resolveBaseUrl()}/docs`)
      : content
  return {
    index: canonical(renderAiIndex(index)),
    pages: Object.fromEntries(
      Object.entries(pages).map(([route, content]) => [
        route,
        canonical(renderAiPage(content, route)),
      ]),
    ),
  }
}
