'use client'

import { lazy, type PropsWithChildren, Suspense } from 'react'
import { usePageSettled } from '../lib/pageSettled'

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then((module) => ({ default: module.Analytics })),
)
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((module) => ({ default: module.SpeedInsights })),
)
const Toaster = lazy(() => import('sonner').then((module) => ({ default: module.Toaster })))
const GoogleAnalytics = lazy(() => import('../components/GoogleAnalytics'))
const PostHogSetup = lazy(() => import('../components/PostHogSetup'))

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    const key = `vite:preloadError:${(event as unknown as CustomEvent).detail?.message}`
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      window.location.reload()
    }
  })
}

export default function Layout(
  props: PropsWithChildren<{
    path: string
    frontmatter?: { interactive?: boolean; mipd?: boolean }
  }>,
) {
  const pageSettled = usePageSettled()
  const needsToaster = Boolean(props.frontmatter?.interactive || props.frontmatter?.mipd)

  return (
    <>
      {props.children}
      <Suspense fallback={null}>
        {needsToaster && (
          <Toaster
            className="z-42069 select-none"
            expand={false}
            position="bottom-right"
            swipeDirections={['right', 'left', 'top', 'bottom']}
            theme="light"
            toastOptions={{
              style: {
                borderRadius: '1.5rem',
              },
            }}
          />
        )}
        {pageSettled && (
          <>
            <SpeedInsights route={props.path} />
            <Analytics />
            <GoogleAnalytics />
            <PostHogSetup />
          </>
        )}
      </Suspense>
    </>
  )
}
