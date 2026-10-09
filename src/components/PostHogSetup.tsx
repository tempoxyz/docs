'use client'

import { useEffect } from 'react'
import { trackMppSdkInstallCopyClicks } from '../lib/mpp-sdk-install-tracking'
import { POSTHOG_REPLAY_PRIVACY_CONFIG } from '../lib/posthog-privacy'

function PostHogInitializer({ site }: { site: string }) {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST

    if (!posthogKey || !posthogHost) return

    let disposed = false
    let stopTracking: (() => void) | undefined

    const init = async () => {
      const { default: posthog } = await import('posthog-js')
      if (disposed) return

      posthog.init(posthogKey, {
        api_host: '/ingest',
        ui_host: posthogHost,
        defaults: '2025-11-30',
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development',
        ...POSTHOG_REPLAY_PRIVACY_CONFIG,
      })
      posthog.register({ site })
      if (site === 'docs') {
        stopTracking = trackMppSdkInstallCopyClicks(document, (properties) => {
          posthog.capture('docs_mpp_sdk_install_copy_clicked', properties)
        })
      }
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(init, { timeout: 2_000 })
      return () => {
        disposed = true
        window.cancelIdleCallback(idleId)
        stopTracking?.()
      }
    }

    const timeoutId = globalThis.setTimeout(init, 1)
    return () => {
      disposed = true
      globalThis.clearTimeout(timeoutId)
      stopTracking?.()
    }
  }, [site])

  return null
}

export default function PostHogSetup({ site = 'docs' }: { site?: string }) {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST

  if (!posthogKey || !posthogHost) return null

  return <PostHogInitializer site={site} />
}
