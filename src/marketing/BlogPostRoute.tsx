'use client'

import BlogPostPage from './app/blog/[slug]/page'
import MarketingRoute from './MarketingRoute'

export default function BlogPostRoute({
  slug,
  metadata,
}: {
  slug: string
  metadata: { title: string; description: string }
}) {
  return (
    <MarketingRoute route={`/blog/${slug}`} metadata={metadata}>
      <BlogPostPage params={{ slug }} />
    </MarketingRoute>
  )
}
