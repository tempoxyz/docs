import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'

const sources = {
  'tempo-docs-cli': '/docs/cli',
  'tempo-docs-wallet': '/docs/cli/wallet',
  'tempo-docs-foundry-mpp': '/docs/sdk/foundry/mpp',
  'tempo-docs-node': '/docs/guide/node/installation',
} as const

const app = new Hono()
app.use('*', bodyLimit({ maxSize: 1024 }))
app.post('/api/install-event', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }
  if (
    !body ||
    typeof body !== 'object' ||
    !('source' in body) ||
    typeof body.source !== 'string' ||
    !Object.hasOwn(sources, body.source) ||
    !('first_install' in body) ||
    typeof body.first_install !== 'boolean' ||
    !('event_id' in body) ||
    typeof body.event_id !== 'string' ||
    !/^[a-f0-9]{32}$/.test(body.event_id)
  ) {
    return c.json({ error: 'Invalid install event' }, 400)
  }

  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return c.json({ error: 'Analytics unavailable' }, 503)

  try {
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'
    const response = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000),
      body: JSON.stringify({
        api_key: key,
        event: 'tempo_cli_install_completed',
        distinct_id: `install:${body.event_id}`,
        properties: {
          $insert_id: body.event_id,
          $process_person_profile: false,
          $geoip_disable: true,
          site: 'docs',
          install_product: 'tempo_cli',
          measurement: 'install_completed',
          install_source: body.source,
          page_path: sources[body.source as keyof typeof sources],
          first_install: body.first_install,
        },
      }),
    })
    if (!response.ok) return c.json({ error: 'Analytics unavailable' }, 502)
    return c.body(null, 204)
  } catch {
    return c.json({ error: 'Analytics unavailable' }, 502)
  }
})

export default function installEvent(request: Request) {
  return app.fetch(request)
}
