'use client'

import { useEffect } from 'react'

function PostHogInitializer({ site }: { site: string }) {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST

    if (!posthogKey || !posthogHost) return

    const init = async () => {
      const { default: posthog } = await import('posthog-js')

      posthog.init(posthogKey, {
        api_host: '/ingest',
        ui_host: posthogHost,
        defaults: '2025-11-30',
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development',
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
          },
        },
      })
      posthog.register({ site })
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(init, { timeout: 2_000 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = globalThis.setTimeout(init, 1)
    return () => globalThis.clearTimeout(timeoutId)
  }, [site])

  return null
}

export default function PostHogSetup({ site = 'docs' }: { site?: string }) {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST

  if (!posthogKey || !posthogHost) return null

  return <PostHogInitializer site={site} />
}
