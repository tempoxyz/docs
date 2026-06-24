'use client'

import MarketingRoute from '../marketing/MarketingRoute'
import PerformancePage from '../marketing/PerformancePage'

export default function Page() {
  return (
    <MarketingRoute route="/performance">
      <PerformancePage />
    </MarketingRoute>
  )
}
