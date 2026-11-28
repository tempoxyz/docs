import { classifyDocsRequest } from './docs-request-classifier'

export async function trackDocsRequest(
  request: Request,
  status: number,
  startedAt: number,
  { key, host }: { key?: string; host?: string },
) {
  if (!key) return
  const path = new URL(request.url).pathname
  const userAgent = request.headers.get('user-agent') ?? ''
  const classification = classifyDocsRequest({
    path,
    userAgent,
    referer: request.headers.get('referer') ?? request.headers.get('referrer') ?? undefined,
  })
  if (!classification.shouldTrack) return

  const { agent_family, agent_kind, match_source, referer_host, surface } = classification
  const distinctId = agent_family
    ? `docs:${agent_family}:${agent_kind ?? 'unknown'}`
    : `docs:${match_source}:${surface}`
  const posthogHost = host?.startsWith('https://') ? host : 'https://us.i.posthog.com'
  try {
    const response = await fetch(`${posthogHost.replace(/\/$/, '')}/capture/`, {
      body: JSON.stringify({
        api_key: key,
        distinct_id: distinctId,
        event: 'docs_request',
        properties: {
          site: 'docs',
          path,
          method: request.method,
          status,
          duration_ms: Math.round(performance.now() - startedAt),
          surface,
          agent_family,
          agent_kind,
          match_source,
          referer_host,
          user_agent: userAgent || undefined,
        },
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    await response.body?.cancel()
  } catch {
    // Analytics delivery does not affect the docs response.
  }
}
