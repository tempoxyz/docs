'use client'

import { lazy, type ReactNode, Suspense, useEffect, useState } from 'react'

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights })),
)
const GoogleAnalytics = lazy(() => import('../components/GoogleAnalytics'))
const PostHogSetup = lazy(() => import('../components/PostHogSetup'))

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Tempo',
    description:
      'The only blockchain designed for payments. Sub-second transactions, sub-cent fees.',
  },
  '/build': {
    title: 'Tempo',
    description:
      'Build payment products on Tempo with stablecoins, fast settlement, and predictable fees.',
  },
  '/build/tempo-transactions': {
    title: 'Tempo Transactions',
    description: 'Batch, sponsor, schedule, and parallelize payments with Tempo Transactions.',
  },
  '/build/tip20-tokens': {
    title: 'TIP-20 Tokens',
    description:
      'Stablecoin-first Tempo Tokens for payments, fees, memos, policies, and liquidity.',
  },
  '/performance': {
    title: 'Tempo Performance',
    description:
      'Nightly benchmarks on Tempo throughput, block times, execution rates, and uptime.',
  },
  '/diagrams': {
    title: 'Tempo Diagrams',
    description: 'A playground for Tempo diagrams, product visuals, and house-style SVG exports.',
  },
}

const prefetchedPaths = new Set<string>()

function prefetchPath(href: string) {
  if (!href.startsWith('/') || prefetchedPaths.has(href)) return
  prefetchedPaths.add(href)

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  link.as = 'document'
  document.head.appendChild(link)
}

function applyRouteMetadata(route: string) {
  const metadata = routeMetadata[route] ?? routeMetadata['/']
  document.title = metadata.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
}

export default function MarketingRoute({
  children,
  route,
}: {
  children: ReactNode
  route: keyof typeof routeMetadata
}) {
  const [analyticsReady, setAnalyticsReady] = useState(false)

  useEffect(() => {
    applyRouteMetadata(route)
  }, [route])

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => setAnalyticsReady(true), { timeout: 2_000 })
      return () => window.cancelIdleCallback(idleId)
    }
    const timeoutId = globalThis.setTimeout(() => setAnalyticsReady(true), 1)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    prefetchPath('/docs')

    const prefetchAnchor = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.origin !== window.location.origin) return
      prefetchPath(anchor.pathname)
    }

    document.addEventListener('pointerover', prefetchAnchor, { passive: true })
    document.addEventListener('focusin', prefetchAnchor)
    return () => {
      document.removeEventListener('pointerover', prefetchAnchor)
      document.removeEventListener('focusin', prefetchAnchor)
    }
  }, [])

  return (
    <Suspense fallback={null}>
      {children}
      {analyticsReady && (
        <>
          <SpeedInsights route={route} />
          <Analytics />
          <GoogleAnalytics />
          <PostHogSetup site="developers" />
        </>
      )}
    </Suspense>
  )
}
