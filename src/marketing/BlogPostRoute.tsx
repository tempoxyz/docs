'use client'

import type { ReactNode } from 'react'
import BlogPostPage from './app/blog/[slug]/page'
import MarketingRoute from './MarketingRoute'

export default function BlogPostRoute({
  slug,
  metadata,
  head,
}: {
  slug: string
  metadata: { title: string; description: string }
  head?: ReactNode
}) {
  return (
    <MarketingRoute route={`/blog/${slug}`} metadata={metadata} head={head}>
      <BlogPostPage params={{ slug }} />
    </MarketingRoute>
  )
}
