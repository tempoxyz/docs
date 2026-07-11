import type { CaptureResult } from 'posthog-js'
import { describe, expect, it } from 'vitest'
import {
  classifyAnalyticsPage,
  classifyStrategicCta,
  getAnalyticsPageSection,
  sanitizeAnalyticsUrl,
  sanitizePostHogCapture,
} from './posthog-analytics'

describe('sanitizeAnalyticsUrl', () => {
  it('keeps campaign attribution and removes arbitrary query values and fragments', () => {
    expect(
      sanitizeAnalyticsUrl(
        '/developers/docs/api?utm_source=chatgpt&gclid=abc123&email=juan%40example.com#token',
      ),
    ).toBe('/developers/docs/api?utm_source=chatgpt&gclid=abc123')
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

  it('removes contact destinations and unsafe campaign values', () => {
    expect(sanitizeAnalyticsUrl('mailto:person@example.com')).toBe('mailto:')
    expect(sanitizeAnalyticsUrl('tel:+15555555555')).toBe('tel:')
    expect(
      sanitizeAnalyticsUrl(
        '/docs?utm_source=person%40example.com&utm_campaign=enterprise&query=private',
      ),
    ).toBe('/docs?utm_campaign=enterprise')
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
      $elements: [{ attr__href: '/docs/api?utm_campaign=launch' }],
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
})

describe('strategic CTA classification', () => {
  it('classifies contact intent from the current page', () => {
    expect(
      classifyStrategicCta('https://tempo.xyz/contact', '/developers/docs/api/authentication'),
    ).toEqual({
      ctaId: 'contact_api_access',
      destinationCategory: 'contact',
      conversionIntent: 'api_access',
    })
  })

  it('classifies high-value developer destinations', () => {
    expect(
      classifyStrategicCta('/developers/docs/quickstart/integrate-tempo', '/developers/build'),
    ).toEqual({
      ctaId: 'integrate_tempo',
      destinationCategory: 'get_started',
    })
  })

  it('does not classify ordinary documentation navigation as a CTA', () => {
    expect(classifyStrategicCta('/docs/protocol', '/docs')).toBeNull()
  })
})
