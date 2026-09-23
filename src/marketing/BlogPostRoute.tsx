'use client'

import type { ReactNode } from 'react'
import BlogPostPage from './app/blog/[slug]/page'
import MarketingRoute from './MarketingRoute'
import type { RouteMetadata } from './routeMetadata'

export default function BlogPostRoute({
  slug,
  metadata,
  head,
}: {
  slug: string
  metadata: RouteMetadata
  head?: ReactNode
}) {
  return (
    <MarketingRoute route={`/blog/${slug}`} metadata={metadata} head={head}>
      <BlogPostPage params={{ slug }} />
    </MarketingRoute>
  )
}
