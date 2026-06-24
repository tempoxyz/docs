'use client'

import BlogPage from '../marketing/app/blog/page'
import MarketingRoute from '../marketing/MarketingRoute'

export default function Page() {
  return (
    <MarketingRoute route="/blog">
      <BlogPage />
    </MarketingRoute>
  )
}
