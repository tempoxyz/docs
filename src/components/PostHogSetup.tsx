'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

function PostHogInitializer() {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST

    if (!posthogKey || !posthogHost) return

    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: '2025-05-24',
      capture_exceptions: true,
      debug: import.meta.env.MODE === 'development',
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      loaded: (posthog) => {
        posthog.capture('$pageview')
      },
    })

    return () => {
      posthog.reset()
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
