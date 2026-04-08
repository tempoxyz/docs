'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import type React from 'react'
import { Toaster } from 'sonner'
import GoogleAnalytics from '../components/GoogleAnalytics'
import PostHogSetup from '../components/PostHogSetup'

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
  props: React.PropsWithChildren<{
    path: string
    frontmatter?: { mipd?: boolean }
  }>,
) {
  return (
    <>
      {props.children}
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
      <SpeedInsights route={props.path} />
      <Analytics />
      <GoogleAnalytics />
      <PostHogSetup />
    </>
  )
}
