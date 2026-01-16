'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { PostHogProvider as PostHogProviderBase } from 'posthog-js/react'
import type React from 'react'
import { Toaster } from 'sonner'
import { PageViewTracker } from '../components/PageViewTracker'
import { PostHogSiteIdentifier } from '../components/PostHogSiteIdentifier'

function PostHogProvider({ children }: React.PropsWithChildren) {
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

  if (!posthogKey || !posthogHost) return children

  return (
    <PostHogProviderBase
      apiKey={posthogKey}
      options={{
        api_host: posthogHost,
        defaults: '2025-05-24',
        capture_exceptions: true, // This enables capturing exceptions using Error Tracking
        debug: import.meta.env.MODE === 'development',
      }}
    >
      {children}
    </PostHogProviderBase>
  )
}

export default function Layout(
  props: React.PropsWithChildren<{
    path: string
    frontmatter?: { mipd?: boolean }
  }>,
) {
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

  return (
    <>
      <PostHogProvider>
        {posthogKey && posthogHost && <PostHogSiteIdentifier />}
        {posthogKey && posthogHost && <PageViewTracker />}
        {props.children}
      </PostHogProvider>

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
      <SpeedInsights />
      <Analytics />
    </>
  )
}
