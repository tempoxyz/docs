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
    title: 'Build on Tempo',
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
    title: 'Performance',
    description:
      'Nightly benchmarks on Tempo throughput, block times, execution rates, and uptime.',
  },
  '/blog': {
    title: 'Blog',
    description:
      'Engineering deep dives, network upgrades, events, and case studies from the Tempo team.',
  },
}

const prefetchedPaths = new Set<string>()
const ANALYTICS_DELAY_MS = 15_000
const ANALYTICS_IDLE_TIMEOUT_MS = 20_000

function prefetchPath(href: string) {
  if (!href.startsWith('/') || prefetchedPaths.has(href)) return
  prefetchedPaths.add(href)

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  link.as = 'document'
  document.head.appendChild(link)
}

type RouteMetadata = { title: string; description: string }

function scheduleIdleAnalytics(callback: () => void) {
  let idleId: number | undefined
  const timeoutId = globalThis.setTimeout(() => {
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(callback, { timeout: ANALYTICS_IDLE_TIMEOUT_MS })
    } else {
      callback()
    }
  }, ANALYTICS_DELAY_MS)

  return () => {
    globalThis.clearTimeout(timeoutId)
    if (idleId !== undefined) window.cancelIdleCallback(idleId)
  }
}

function applyRouteMetadata(route: string, metadata?: RouteMetadata) {
  const resolved = metadata ?? routeMetadata[route] ?? routeMetadata['/']
  document.title = resolved.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', resolved.description)
}

export default function MarketingRoute({
  children,
  route,
  metadata,
}: {
  children: ReactNode
  route: string
  metadata?: RouteMetadata
}) {
  const [analyticsReady, setAnalyticsReady] = useState(false)

  useEffect(() => {
    applyRouteMetadata(route, metadata)
  }, [route, metadata])

  useEffect(() => {
    return scheduleIdleAnalytics(() => setAnalyticsReady(true))
  }, [])

  useEffect(() => {
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
    <>
      {children}
      {analyticsReady && (
        <Suspense fallback={null}>
          <SpeedInsights route={route} />
          <Analytics />
          <GoogleAnalytics />
          <PostHogSetup site="developers" />
        </Suspense>
      )}
    </>
  )
}
