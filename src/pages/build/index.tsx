'use client'

import HomePage from '../../marketing/HomePage'
import MarketingRoute from '../../marketing/MarketingRoute'

export default function Page() {
  return (
    <MarketingRoute route="/build">
      <HomePage />
    </MarketingRoute>
  )
}
