'use client'

import type { ReactNode } from 'react'
import { Head, MdxPageContextProvider } from 'vocs'

/**
 * Per-page head tags for non-MDX (marketing/blog) pages.
 *
 * Vocs renders a site-generic `<Head>` in the document root, then dedupes head
 * tags in the prerendered HTML keeping the last occurrence of each identity.
 * MDX pages win that dedupe by rendering a second `<Head>` from the page
 * subtree (with frontmatter in context), which hoists into `<head>` after the
 * generic one. This component gives `.tsx` pages the same mechanism — raw
 * `<meta>` tags rendered directly by a page hoist *before* the generic head
 * and lose the dedupe instead.
 *
 * `children` render after `<Head>` so they can override tags it emits (e.g.
 * `og:type`) as well as add new ones.
 */
export default function PageHead({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <MdxPageContextProvider frontmatter={{ title, description }}>
      <Head />
      <meta property="og:image:alt" content={title} />
      {children}
    </MdxPageContextProvider>
  )
}
