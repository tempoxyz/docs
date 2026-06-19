'use client'

import DiagramsPage from '../marketing/DiagramsPage'
import MarketingRoute from '../marketing/MarketingRoute'

export default function Page() {
  return (
    <MarketingRoute route="/diagrams">
      <DiagramsPage />
    </MarketingRoute>
  )
}
