'use client'

import FeaturePage from '../../marketing/FeaturePage'
import MarketingRoute from '../../marketing/MarketingRoute'

export default function Page() {
  return (
    <MarketingRoute route="/build/tip20-tokens">
      <FeaturePage params={{ slug: 'tokens' }} />
    </MarketingRoute>
  )
}
