'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

function PostHogInitializer() {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST

    if (!posthogKey || !posthogHost) return

    const init = () => {
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
      posthog.register({ site: 'docs' })
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(init)
    } else {
      setTimeout(init, 1)
    }
  }, [])

  return null
}

export default function PostHogSetup() {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST

  if (!posthogKey || !posthogHost) return null

  return <PostHogInitializer />
}
