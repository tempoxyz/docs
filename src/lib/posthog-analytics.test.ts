import type { CaptureResult } from 'posthog-js'
import { describe, expect, it } from 'vitest'
import {
  classifyAnalyticsPage,
  classifyStrategicCta,
  DEFAULT_ANALYTICS_RELEASE,
  enrichPostHogCapture,
  getAnalyticsPageSection,
  getAnalyticsRuntimeProperties,
  hasUnsafeAnalyticsQuery,
  isProductionAnalyticsHost,
  sanitizeAnalyticsPath,
  sanitizeAnalyticsUrl,
  sanitizePostHogCapture,
} from './posthog-analytics'

describe('sanitizeAnalyticsUrl', () => {
  it('keeps campaign attribution and removes arbitrary query values and fragments', () => {
    expect(
      sanitizeAnalyticsUrl(
        '/developers/docs/api?utm_source=chatgpt&gclid=abc123&email=juan%40example.com#token',
      ),
    ).toBe('/developers/docs/api?utm_source=chatgpt&gclid=present')
  })

  it('removes URL credentials and redacts blockchain identifiers', () => {
    expect(
      sanitizeAnalyticsUrl(
        'https://user:secret@explorer.tempo.xyz/tx/0x1234567890abcdef1234567890abcdef?tab=logs',
      ),
    ).toBe('https://explorer.tempo.xyz/tx/:identifier')
  })

  it('leaves non-URL labels unchanged', () => {
    expect(sanitizeAnalyticsUrl('accept payments')).toBe('accept payments')
  })

  it('fails closed for malformed or unsupported URL values', () => {
    expect(sanitizeAnalyticsUrl('https://%zz')).toBe('')
    expect(sanitizeAnalyticsUrl('javascript:alert(1)')).toBe('')
  })

  it('removes contact destinations and unsafe campaign values', () => {
    expect(sanitizeAnalyticsUrl('mailto:person@example.com')).toBe('mailto:')
    expect(sanitizeAnalyticsUrl('tel:+15555555555')).toBe('tel:')
    expect(
      sanitizeAnalyticsUrl(
        '/docs?utm_source=person%40example.com&utm_campaign=enterprise&query=private',
      ),
    ).toBe('/docs?utm_campaign=enterprise')
    expect(sanitizeAnalyticsUrl('/docs?gclid=secret-click-id')).toBe('/docs?gclid=present')
  })

  it('detects URLs that must not be included in session replay', () => {
    expect(hasUnsafeAnalyticsQuery('/docs?utm_source=chatgpt')).toBe(false)
    expect(hasUnsafeAnalyticsQuery('/docs?utm_source=person%40example.com')).toBe(true)
    expect(hasUnsafeAnalyticsQuery('/docs?utm_email=juan')).toBe(true)
    expect(hasUnsafeAnalyticsQuery('/docs?gclid=raw-click-id')).toBe(true)
    expect(hasUnsafeAnalyticsQuery('/docs?query=customer-secret')).toBe(true)
  })
})

describe('sanitizePostHogCapture', () => {
  it('removes sensitive custom properties and sanitizes nested URLs', () => {
    const capture = {
      event: 'docs_copy_code',
      properties: {
        command_text: 'pnpm secret-command',
        search_query: 'customer api key',
        $current_url: 'https://tempo.xyz/docs?utm_source=perplexity&token=secret#section',
        $session_entry_utm_source: 'person@example.com',
        $gclid: 'raw-click-id',
        $elements: [
          {
            attr__href: '/docs/api?utm_campaign=launch&api_key=secret#authentication',
          },
        ],
      },
    } as unknown as CaptureResult

    const sanitized = sanitizePostHogCapture(capture)
    expect(sanitized?.properties).toEqual({
      $current_url: 'https://tempo.xyz/docs?utm_source=perplexity',
      $gclid: 'present',
      $elements: [{ attr__href: '/docs/api?utm_campaign=launch' }],
    })
  })

  it('redacts native paths and URL keys inside heatmap payloads', () => {
    const walletPath = '/developers/docs/address/0x1234567890abcdef1234567890abcdef'
    const heatmapUrl = `https://tempo.xyz${walletPath}?email=person%40example.com&utm_source=docs`
    const capture = {
      event: '$$heatmap',
      properties: {
        $pathname: walletPath,
        $prev_pageview_pathname: '/developers/docs/session/123e4567-e89b-42d3-a456-426614174000',
        page_path: walletPath,
        result_path: walletPath,
        $heatmap_data: {
          [heatmapUrl]: [{ type: 'click', x: 10, y: 20 }],
        },
      },
    } as unknown as CaptureResult

    const sanitized = sanitizePostHogCapture(capture)
    expect(sanitized?.properties).toEqual({
      $pathname: '/developers/docs/address/:identifier',
      $prev_pageview_pathname: '/developers/docs/session/:identifier',
      page_path: '/developers/docs/address/:identifier',
      result_path: '/developers/docs/address/:identifier',
      $heatmap_data: {
        'https://tempo.xyz/developers/docs/address/:identifier?utm_source=docs': [
          { type: 'click', x: 10, y: 20 },
        ],
      },
    })
    expect(JSON.stringify(sanitized)).not.toContain('person%40example.com')
    expect(JSON.stringify(sanitized)).not.toContain('1234567890abcdef')
  })

  it('removes blockchain identifiers from event and person properties', () => {
    const capture = {
      event: 'docs_demo_step_complete',
      properties: {
        wallet_address: '0x1234567890abcdef1234567890abcdef',
        sender_address: '0xsender',
        recipient_address: '0xrecipient',
        tx_hash: '0xtransaction',
        transaction_hash: '0xtransaction',
        memo: 'customer payroll',
        nested: {
          $wallet_address: '0xnested',
          safe_label: 'step_complete',
        },
      },
      $set: {
        wallet_address: '0xperson',
        role: 'developer',
      },
      $set_once: {
        memo: 'private memo',
        first_surface: 'docs',
      },
    } as unknown as CaptureResult

    expect(sanitizePostHogCapture(capture)).toEqual({
      event: 'docs_demo_step_complete',
      properties: {
        nested: { safe_label: 'step_complete' },
      },
      $set: { role: 'developer' },
      $set_once: { first_surface: 'docs' },
    })
  })

  it('adds normalized page context before applying path privacy', () => {
    const capture = {
      event: '$pageview',
      properties: {
        $pathname: '/developers/docs/api/authentication',
      },
    } as unknown as CaptureResult

    const sanitized = sanitizePostHogCapture(
      enrichPostHogCapture(
        capture,
        '/developers/docs/api/authentication',
        'Authentication | Tempo Docs',
      ),
    )
    expect(sanitized?.properties).toMatchObject({
      $pathname: '/developers/docs/api/authentication',
      page_path: '/docs/api/authentication',
      page_type: 'docs',
      page_section: 'api',
      page_title: 'Authentication | Tempo Docs',
    })
  })
})

describe('analytics runtime context', () => {
  it.each([
    'tempo.xyz',
    'www.tempo.xyz',
    'docs.tempo.xyz',
    'developers.tempo.xyz',
    'mainnet.docs.tempo.xyz',
  ])('allows the production host %s', (hostname) => {
    expect(isProductionAnalyticsHost(hostname)).toBe(true)
  })

  it.each([
    'localhost',
    'tempo-docs-preview.vercel.app',
    'tempo.xyz.example.com',
  ])('rejects non-production host %s', (hostname) => {
    expect(isProductionAnalyticsHost(hostname)).toBe(false)
  })

  it('registers factual browser and release metadata', () => {
    expect(getAnalyticsRuntimeProperties('docs', 'release_2026_07_11')).toEqual({
      site: 'docs',
      surface: 'docs',
      tempo_app_id: 'docs',
      client_type: 'browser',
      release: 'release_2026_07_11',
    })
    expect(getAnalyticsRuntimeProperties('docs', 'not a safe release')).toMatchObject({
      release: DEFAULT_ANALYTICS_RELEASE,
    })
  })
})

describe('analytics page classification', () => {
  it.each([
    ['/developers', 'developer_home', 'home'],
    ['/developers/build/tip20-tokens', 'developer_feature', 'build'],
    ['/developers/blog/fees', 'developer_blog', 'blog'],
    ['/developers/performance', 'developer_performance', 'performance'],
    ['/docs/api/authentication', 'docs', 'api'],
  ] as const)('classifies %s', (path, pageType, section) => {
    expect(classifyAnalyticsPage(path)).toBe(pageType)
    expect(getAnalyticsPageSection(path)).toBe(section)
  })

  it('redacts wallet-like segments from analytics paths', () => {
    expect(
      sanitizeAnalyticsPath(
        '/developers/docs/address/0x1234567890abcdef1234567890abcdef?token=secret',
      ),
    ).toBe('/developers/docs/address/:identifier')
  })
})

describe('strategic CTA classification', () => {
  it('classifies contact intent from the current page', () => {
    expect(
      classifyStrategicCta('https://tempo.xyz/contact', '/developers/docs/api/authentication'),
    ).toEqual({
      ctaId: 'contact_api_access',
      ctaType: 'contact_api_access',
      destination: 'https://tempo.xyz/contact',
      destinationCategory: 'contact',
      destinationHost: 'tempo.xyz',
      destinationKind: 'internal',
      destinationPath: '/contact',
      conversionIntent: 'contact',
      conversionDetail: 'api_access',
    })
  })

  it('classifies high-value developer destinations', () => {
    expect(
      classifyStrategicCta('/developers/docs/quickstart/integrate-tempo', '/developers/build'),
    ).toEqual({
      ctaId: 'integrate_tempo',
      ctaType: 'integrate_tempo',
      destination: 'https://tempo.xyz/developers/docs/quickstart/integrate-tempo',
      destinationCategory: 'get_started',
      destinationHost: 'tempo.xyz',
      destinationKind: 'internal',
      destinationPath: '/docs/quickstart/integrate-tempo',
      conversionIntent: 'developer',
      conversionDetail: 'integrate_tempo',
    })
  })

  it.each([
    'docs.tempo.xyz',
    'developers.tempo.xyz',
  ])('classifies the first-payment guide on %s without calling it activation', (hostname) => {
    expect(
      classifyStrategicCta(
        `https://${hostname}/developers/docs/guide/payments/send-a-payment`,
        '/developers/docs/quickstart/faucet',
      ),
    ).toMatchObject({
      ctaId: 'send_first_payment_guide',
      ctaType: 'send_first_payment_guide',
      destinationCategory: 'guide',
      destinationHost: hostname,
      destinationKind: 'internal',
      destinationPath: '/docs/guide/payments/send-a-payment',
      conversionIntent: 'developer',
      conversionDetail: 'send_first_payment_guide',
    })
  })

  it('does not classify ordinary documentation navigation as a CTA', () => {
    expect(classifyStrategicCta('/docs/protocol', '/docs')).toBeNull()
  })

  it('does not classify a lookalike host as a strategic docs CTA', () => {
    expect(
      classifyStrategicCta(
        'https://tempo.xyz.example.com/docs/guide/payments/send-a-payment',
        '/docs',
      ),
    ).toBeNull()
  })
})
