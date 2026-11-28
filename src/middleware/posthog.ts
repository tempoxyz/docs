/**
 * Server-side tracking for machine-readable docs requests.
 *
 * Crawlers and agent clients do not run browser analytics, so this captures
 * only high-signal docs consumption paths and official crawler user agents.
 */
import type { MiddlewareHandler } from 'vocs/server'
import { trackDocsRequest } from '../lib/docs-request-analytics'

export default function posthog(): MiddlewareHandler {
  return async (c, next) => {
    const startedAt = performance.now()
    await next()
    void trackDocsRequest(c.req.raw, c.res.status, startedAt, {
      key: import.meta.env.VITE_POSTHOG_KEY,
      host: import.meta.env.VITE_POSTHOG_HOST,
    })
  }
}
