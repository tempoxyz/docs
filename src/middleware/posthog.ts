/**
 * Server-side tracking for machine-readable docs requests.
 *
 * Crawlers and agent clients do not run browser analytics, so this captures
 * only high-signal docs consumption paths and official crawler user agents.
 */
import type { MiddlewareHandler } from 'vocs/server'
import { classifyDocsRequest } from '../lib/docs-request-classifier'

export default function posthog(): MiddlewareHandler {
  return async (c, next) => {
    const startedAt = performance.now()
    const url = new URL(c.req.url)
    const userAgent = c.req.header('user-agent') || ''
    const referer = c.req.header('referer') || c.req.header('referrer')
    const classification = classifyDocsRequest({
      path: url.pathname,
      referer,
      userAgent,
    })

    await next()

    if (!classification.shouldTrack) return

    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (!posthogKey) return

    const event = {
      api_key: posthogKey,
      distinct_id: getDistinctId(classification),
      event: 'docs_request',
      properties: {
        site: 'docs',
        path: url.pathname,
        method: c.req.method,
        status: c.res.status,
        duration_ms: Math.round(performance.now() - startedAt),
        surface: classification.surface,
        agent_family: classification.agent_family,
        agent_kind: classification.agent_kind,
        match_source: classification.match_source,
        referer_host: classification.referer_host,
        user_agent: userAgent || undefined,
      },
    }

    fetch(`${posthogHost}/capture/`, {
      body: JSON.stringify(event),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).catch(() => {})
  }
}

function getDistinctId(classification: ReturnType<typeof classifyDocsRequest>) {
  if (classification.agent_family)
    return `docs:${classification.agent_family}:${classification.agent_kind ?? 'unknown'}`
  return `docs:${classification.match_source}:${classification.surface}`
}
