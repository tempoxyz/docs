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
 * `children` add tags not emitted by `<Head>`. Override native tags through
 * the Vocs head configuration to avoid competing streamed head entries.
 */
export default function PageHead({
  title,
  description,
  ogImage,
  children,
}: {
  title: string
  description: string
  ogImage?: string
  children?: ReactNode
}) {
  return (
    <MdxPageContextProvider frontmatter={{ title, description, ogImage }}>
      <Head />
      <meta property="og:site_name" content="Tempo" />
      <meta property="og:image:alt" content={title} />
      {children}
    </MdxPageContextProvider>
  )
}
