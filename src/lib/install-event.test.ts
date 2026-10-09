import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import installEvent from '../pages/_api/api/install-event'

const event = {
  source: 'tempo-docs-wallet',
  first_install: true,
  event_id: '0123456789abcdef0123456789abcdef',
}

function request(body: unknown) {
  return new Request('https://developers.tempo.xyz/api/install-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.stubEnv('VITE_POSTHOG_KEY', 'test-key')
  vi.stubEnv('VITE_POSTHOG_HOST', 'https://us.i.posthog.com')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok')))
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('install completion ingestion', () => {
  it('captures only validated attribution with an anonymous per-event ID', async () => {
    const response = await installEvent(request({ ...event, wallet: 'ignored' }))
    expect(response.status).toBe(204)
    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect(JSON.parse(options?.body as string)).toEqual({
      api_key: 'test-key',
      event: 'tempo_cli_install_completed',
      distinct_id: `install:${event.event_id}`,
      properties: {
        $insert_id: event.event_id,
        $process_person_profile: false,
        $geoip_disable: true,
        site: 'docs',
        install_product: 'tempo_cli',
        measurement: 'install_completed',
        install_source: event.source,
        page_path: '/docs/cli/wallet',
        first_install: true,
      },
    })
  })

  it.each([
    null,
    { ...event, source: 'constructor' },
    { ...event, source: 'unknown' },
    { ...event, event_id: 'invalid' },
    { ...event, first_install: 'true' },
  ])('rejects invalid events without forwarding them', async (body) => {
    expect((await installEvent(request(body))).status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('bounds the request body', async () => {
    expect((await installEvent(request({ ...event, extra: 'x'.repeat(1024) }))).status).toBe(413)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reports missing configuration', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '')
    expect((await installEvent(request(event))).status).toBe(503)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not acknowledge an unsuccessful capture', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 500 }))
    expect((await installEvent(request(event))).status).toBe(502)
  })

  it('handles network failures', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))
    expect((await installEvent(request(event))).status).toBe(502)
  })
})
