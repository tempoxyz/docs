'use client'

import { lazy, type ReactNode, Suspense, useEffect, useState } from 'react'
import PageHead from '../components/PageHead'
import { type RouteMetadata, routeMetadata } from './routeMetadata'

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights })),
)
const GoogleAnalytics = lazy(() => import('../components/GoogleAnalytics'))
const PostHogSetup = lazy(() => import('../components/PostHogSetup'))

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

// Fallback for routes missing from the metadata map, so a forgotten entry
// yields a page-derived title instead of silently reusing the homepage copy.
function fallbackMetadata(route: string): RouteMetadata {
  const name = route
    .split('/')
    .filter(Boolean)
    .pop()
    ?.split('-')
    .map((word) => (word[0]?.toUpperCase() ?? '') + word.slice(1))
    .join(' ')
  return {
    title: name || 'Tempo',
    description: 'Build payment products on Tempo with stablecoins and predictable settlement.',
  }
}

export default function MarketingRoute({
  children,
  route,
  metadata,
  head,
}: {
  children: ReactNode
  route: string
  metadata?: RouteMetadata
  /** Extra head tags rendered after the page `<Head>` (e.g. article metadata). */
  head?: ReactNode
}) {
  const [analyticsReady, setAnalyticsReady] = useState(false)
  const resolvedMetadata = metadata ?? routeMetadata[route] ?? fallbackMetadata(route)

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
      <PageHead title={resolvedMetadata.title} description={resolvedMetadata.description}>
        {head}
      </PageHead>
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
