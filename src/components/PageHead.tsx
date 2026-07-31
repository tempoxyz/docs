'use client'

import type { ReactNode } from 'react'
import { Head, MdxPageContextProvider } from 'vocs'

/**
 * Per-page head tags for non-MDX (marketing/blog) pages.
 *
 * MDX routes get one route-aware `<Head>` from their layout. This component
 * gives `.tsx` routes the same single per-page owner with their metadata in
 * context.
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
      <meta property="og:site_name" content="Tempo" />
      <meta property="og:image:alt" content={title} />
      {children}
    </MdxPageContextProvider>
  )
}
