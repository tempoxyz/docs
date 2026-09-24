import {
  lazy,
  type ReactNode,
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createRoot } from 'react-dom/client'
import '../pages/_root.css'
import Header from './app/_components/Header'
import TpsTrendChartFrame from './app/performance/_components/TpsTrendChartFrame'
import HomePage from './HomePage'
import { routeMetadata } from './routeMetadata'

const loadBlogPage = () => import('./app/blog/page')
const loadBlogPostPage = () => import('./app/blog/[slug]/page')
const loadFeaturePage = () => import('./FeaturePage')
const loadPerformancePage = () => import('./PerformancePage')

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights })),
)
const GoogleAnalytics = lazy(() => import('../components/GoogleAnalytics'))
const PostHogSetup = lazy(() => import('../components/PostHogSetup'))
const PerformancePage = lazy(loadPerformancePage)
const FeaturePage = lazy(loadFeaturePage)
const BlogPage = lazy(loadBlogPage)
const BlogPostPage = lazy(loadBlogPostPage)

function currentRoute() {
  return normalizeRoutePath(window.location.pathname)
}

function normalizeRoutePath(pathname: string) {
  return pathname.replace(/\/$/, '') || '/'
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

function FallbackSkeleton({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse bg-surface-skeleton/35 motion-reduce:animate-none ${className}`}
    />
  )
}

function PerformanceRouteFallback() {
  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto w-full max-w-7xl border-line border-x bg-surface-shell">
        <Header />
        <section className="relative border-line border-b px-5 pt-20 pb-12 lg:px-8 lg:pt-28">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-[880px] text-balance font-sans text-[clamp(2.5rem,6vw,3.5rem)] text-foreground leading-[1.05] tracking-[-0.03em] antialiased">
              Pushing the frontier of blockchain performance.
            </h1>
          </div>

          <div className="mt-16">
            <TpsTrendChartFrame />
            <div className="mt-5 text-center">
              <p className="font-sans text-[20px] text-foreground leading-tight tracking-[0]">
                Transactions per second
              </p>
              <FallbackSkeleton className="mx-auto mt-2 h-4 w-[300px] max-w-[70vw]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function RouteFallback({ route }: { route: string }) {
  if (route === '/performance') return <PerformanceRouteFallback />
  return null
}

function isMarketingRoute(pathname: string) {
  const route = normalizeRoutePath(pathname)
  return route in routeMetadata || route.startsWith('/blog/')
}

function preloadRoute(pathname: string) {
  const route = normalizeRoutePath(pathname)
  if (route === '/build/tempo-transactions' || route === '/build/tip20-tokens') {
    void loadFeaturePage()
  } else if (route === '/performance') {
    void loadPerformancePage()
  } else if (route === '/blog') {
    void loadBlogPage()
  } else if (route.startsWith('/blog/')) {
    void loadBlogPostPage()
  }
}

function idFromHash(hash: string) {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return hash.slice(1)
  }
}

function metadataForRoute(path: string) {
  if (routeMetadata[path]) return routeMetadata[path]
  if (path.startsWith('/blog/')) return routeMetadata['/blog']
  return routeMetadata['/']
}

function applyRouteMetadata(path: string) {
  const metadata = metadataForRoute(path)
  document.title = metadata.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
}

function renderRoute(path: string): ReactNode {
  if (path === '/' || path === '/build') return <HomePage />
  if (path === '/build/tempo-transactions') return <FeaturePage params={{ slug: 'transactions' }} />
  if (path === '/build/tip20-tokens') return <FeaturePage params={{ slug: 'tokens' }} />
  if (path === '/performance') return <PerformancePage />
  if (path === '/blog') return <BlogPage />
  if (path.startsWith('/blog/'))
    return <BlogPostPage params={{ slug: path.slice('/blog/'.length) }} />
  return <HomePage />
}

function MarketingApp() {
  const [route, setRoute] = useState(currentRoute)
  const [analyticsReady, setAnalyticsReady] = useState(false)
  const routeRef = useRef(route)
  const pendingScrollRef = useRef<string | null>(null)

  const scrollToPendingTarget = useCallback(() => {
    if (pendingScrollRef.current === null) return
    const hash = pendingScrollRef.current
    pendingScrollRef.current = null

    requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(idFromHash(hash))?.scrollIntoView()
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    })
  }, [])

  useEffect(() => {
    routeRef.current = route
    applyRouteMetadata(route)
    scrollToPendingTarget()
  }, [route, scrollToPendingTarget])

  useEffect(() => {
    setAnalyticsReady(false)
    return scheduleIdleAnalytics(() => setAnalyticsReady(true))
  }, [])

  useEffect(() => {
    const update = () => {
      startTransition(() => setRoute(currentRoute()))
    }
    const navigate = (url: URL) => {
      const nextRoute = normalizeRoutePath(url.pathname)
      pendingScrollRef.current = url.hash
      preloadRoute(nextRoute)
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
      if (nextRoute === routeRef.current) {
        applyRouteMetadata(nextRoute)
        scrollToPendingTarget()
        window.dispatchEvent(new CustomEvent('tempo:navigation'))
        return
      }
      startTransition(() => setRoute(nextRoute))
      window.dispatchEvent(new CustomEvent('tempo:navigation'))
    }
    const prefetchAnchor = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.origin !== window.location.origin) return
      prefetchPath(anchor.pathname)
      if (isMarketingRoute(anchor.pathname)) preloadRoute(anchor.pathname)
    }
    const clickAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== '_self') return

      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin || !isMarketingRoute(url.pathname)) return

      event.preventDefault()
      navigate(url)
    }

    window.addEventListener('popstate', update)
    document.addEventListener('click', clickAnchor)
    document.addEventListener('pointerover', prefetchAnchor, { passive: true })
    document.addEventListener('focusin', prefetchAnchor)
    return () => {
      window.removeEventListener('popstate', update)
      document.removeEventListener('click', clickAnchor)
      document.removeEventListener('pointerover', prefetchAnchor)
      document.removeEventListener('focusin', prefetchAnchor)
    }
  }, [scrollToPendingTarget])

  return (
    <>
      <Suspense fallback={<RouteFallback route={route} />}>{renderRoute(route)}</Suspense>
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

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Marketing root element was not found')
}

createRoot(rootElement).render(<MarketingApp />)
