'use client'

import { useEffect } from 'react'
import { POSTHOG_REPLAY_PRIVACY_CONFIG } from '../lib/posthog-privacy'

function PostHogInitializer({ site }: { site: string }) {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST

    if (!posthogKey || !posthogHost) return

    const init = async () => {
      // Bundle the extensions posthog-js would otherwise fetch from /ingest/static
      // at runtime, so disable_external_dependency_loading blocks every remote script.
      // A failed extension chunk costs only that extension, never core analytics.
      const optional = (load: Promise<unknown>) => load.catch(() => undefined)
      const [{ default: posthog }] = await Promise.all([
        import('posthog-js'),
        optional(import('posthog-js/dist/dead-clicks-autocapture')),
        optional(import('posthog-js/dist/exception-autocapture')),
        optional(import('posthog-js/dist/web-vitals')),
        optional(import('posthog-js/dist/surveys')),
      ])

      posthog.init(posthogKey, {
        api_host: '/ingest',
        ui_host: posthogHost,
        defaults: '2025-11-30',
        capture_exceptions: true,
        // Never inject posthog scripts at runtime (lazy-loaded chunks have no SRI).
        disable_external_dependency_loading: true,
        debug: import.meta.env.MODE === 'development',
        ...POSTHOG_REPLAY_PRIVACY_CONFIG,
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
