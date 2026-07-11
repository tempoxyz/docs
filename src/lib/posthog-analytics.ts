import type { CaptureResult } from 'posthog-js'

const campaignQueryParameters = new Set([
  'dclid',
  'fbclid',
  'gbraid',
  'gclid',
  'li_fat_id',
  'mc_cid',
  'mc_eid',
  'msclkid',
  'sccid',
  'ttclid',
  'twclid',
  'wbraid',
])

const blockedPropertyNames = new Set([
  'api_key',
  'authorization',
  'code_snippet',
  'command_text',
  'email',
  'feedback_message',
  'password',
  'phone',
  'private_key',
  'search_query',
])

const maxCampaignValueLength = 256
const sensitivePathSegmentPatterns = [
  /^0x[a-f\d]{16,}$/i,
  /^[a-f\d]{64}$/i,
  /^[a-f\d]{8}-[a-f\d]{4}-[1-5][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i,
]

export type AnalyticsPageType =
  | 'developer_blog'
  | 'developer_feature'
  | 'developer_home'
  | 'developer_performance'
  | 'docs'
  | 'other'

export type StrategicCta = {
  ctaId: string
  destinationCategory: string
  conversionIntent?: string | undefined
}

function shouldKeepQueryParameter(name: string) {
  const normalized = name.toLowerCase()
  return normalized.startsWith('utm_') || campaignQueryParameters.has(normalized)
}

function redactSensitivePathSegments(pathname: string) {
  return pathname
    .split('/')
    .map((segment) => {
      let decoded = segment
      try {
        decoded = decodeURIComponent(segment)
      } catch {
        // Keep malformed segments as-is.
      }
      return sensitivePathSegmentPatterns.some((pattern) => pattern.test(decoded))
        ? ':identifier'
        : segment
    })
    .join('/')
}

/**
 * Removes arbitrary query parameters, URL credentials, and hashes while
 * preserving standard campaign attribution parameters.
 */
export function sanitizeAnalyticsUrl(value: string) {
  const input = value.trim()
  if (!input) return input

  const isAbsolute = /^[a-z][a-z\d+.-]*:\/\//i.test(input)
  const isProtocolRelative = input.startsWith('//')
  const isRelativeUrl = input.startsWith('/') || input.startsWith('?') || input.startsWith('#')
  if (!isAbsolute && !isProtocolRelative && !isRelativeUrl) return value

  try {
    const url = new URL(input, 'https://tempo.xyz')
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return value

    url.username = ''
    url.password = ''
    url.hash = ''
    url.pathname = redactSensitivePathSegments(url.pathname)

    for (const name of [...url.searchParams.keys()]) {
      if (!shouldKeepQueryParameter(name)) {
        url.searchParams.delete(name)
        continue
      }

      const values = url.searchParams.getAll(name)
      url.searchParams.delete(name)
      for (const item of values)
        url.searchParams.append(name, item.slice(0, maxCampaignValueLength))
    }

    if (isAbsolute || isProtocolRelative) return url.toString()
    return `${url.pathname}${url.search}`
  } catch {
    return value
  }
}

function isUrlProperty(name: string) {
  const normalized = name.toLowerCase()
  return (
    normalized.includes('current_url') ||
    normalized.includes('page_url') ||
    normalized.includes('referrer') ||
    normalized.includes('result_url') ||
    normalized.endsWith('href') ||
    normalized.endsWith('_url')
  )
}

function sanitizePropertyValue(name: string, value: unknown): unknown {
  if (blockedPropertyNames.has(name.toLowerCase())) return undefined
  if (typeof value === 'string' && isUrlProperty(name)) return sanitizeAnalyticsUrl(value)
  if (Array.isArray(value))
    return value
      .map((item) => sanitizePropertyValue(name, item))
      .filter((item) => item !== undefined)
  if (!value || typeof value !== 'object' || value instanceof Date) return value
  return sanitizePropertyRecord(value as Record<string, unknown>)
}

function sanitizePropertyRecord(properties: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {}

  for (const [name, value] of Object.entries(properties)) {
    const nextValue = sanitizePropertyValue(name, value)
    if (nextValue !== undefined) sanitized[name] = nextValue
  }

  return sanitized
}

/** Final guardrail applied to every browser event before PostHog sends it. */
export function sanitizePostHogCapture(capture: CaptureResult | null): CaptureResult | null {
  if (!capture) return null

  return {
    ...capture,
    properties: sanitizePropertyRecord(capture.properties as Record<string, unknown>),
    $set: capture.$set
      ? sanitizePropertyRecord(capture.$set as Record<string, unknown>)
      : undefined,
    $set_once: capture.$set_once
      ? sanitizePropertyRecord(capture.$set_once as Record<string, unknown>)
      : undefined,
  } as CaptureResult
}

export function normalizeAnalyticsPath(pathname: string) {
  const withoutDevelopersPrefix = pathname.replace(/^\/developers(?=\/|$)/, '') || '/'
  return withoutDevelopersPrefix.replace(/\/+$/, '') || '/'
}

export function classifyAnalyticsPage(pathname: string): AnalyticsPageType {
  const path = normalizeAnalyticsPath(pathname)
  if (path === '/' || path === '/build') return 'developer_home'
  if (path === '/docs' || path.startsWith('/docs/')) return 'docs'
  if (path === '/blog' || path.startsWith('/blog/')) return 'developer_blog'
  if (path === '/performance') return 'developer_performance'
  if (path.startsWith('/build/')) return 'developer_feature'
  return 'other'
}

export function getAnalyticsPageSection(pathname: string) {
  const path = normalizeAnalyticsPath(pathname)
  if (path === '/docs') return 'overview'
  if (path.startsWith('/docs/')) return path.split('/')[2] || 'overview'
  if (path === '/') return 'home'
  return path.split('/')[1] || 'home'
}

function contactIntent(pathname: string) {
  const path = normalizeAnalyticsPath(pathname)
  if (path === '/docs/api' || path.startsWith('/docs/api/')) return 'api_access'
  if (path.includes('/zones')) return 'zones_design_partner'
  if (path.startsWith('/docs/guide/node/validator')) return 'validator_interest'
  if (path === '/docs/partners' || path.startsWith('/docs/ecosystem')) return 'partner_interest'
  return 'general_contact'
}

/** Returns stable metadata only for destinations worth treating as funnel CTAs. */
export function classifyStrategicCta(href: string, currentPathname: string): StrategicCta | null {
  try {
    const url = new URL(href, 'https://tempo.xyz')
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    const path = normalizeAnalyticsPath(url.pathname)

    if (hostname === 'tempo.xyz' && /^\/contact\/?$/.test(url.pathname)) {
      const conversionIntent = contactIntent(currentPathname)
      return {
        ctaId: `contact_${conversionIntent}`,
        destinationCategory: 'contact',
        conversionIntent,
      }
    }

    if (hostname === 'wallet.tempo.xyz')
      return { ctaId: 'tempo_wallet', destinationCategory: 'wallet' }
    if (hostname === 'faucet.tempo.xyz' || path === '/docs/quickstart/faucet')
      return { ctaId: 'tempo_faucet', destinationCategory: 'faucet' }
    if (hostname === 'explorer.tempo.xyz')
      return { ctaId: 'tempo_explorer', destinationCategory: 'explorer' }
    if (hostname === 'github.com' && url.pathname.toLowerCase().startsWith('/tempoxyz'))
      return { ctaId: 'tempo_github', destinationCategory: 'source' }
    if (hostname === 'mpp.dev') return { ctaId: 'mpp_docs', destinationCategory: 'mpp' }

    const strategicDocsPaths: Record<string, StrategicCta> = {
      '/docs/guide/machine-payments': {
        ctaId: 'machine_payments_guide',
        destinationCategory: 'guide',
      },
      '/docs/guide/payments/accept-a-payment': {
        ctaId: 'accept_payments_guide',
        destinationCategory: 'guide',
      },
      '/docs/guide/using-tempo-with-ai': {
        ctaId: 'tempo_ai_guide',
        destinationCategory: 'agent_setup',
      },
      '/docs/quickstart/integrate-tempo': {
        ctaId: 'integrate_tempo',
        destinationCategory: 'get_started',
      },
    }
    const strategicDocsCta = strategicDocsPaths[path]
    if (hostname === 'tempo.xyz' && strategicDocsCta) return strategicDocsCta

    if (hostname === 'tempo.xyz' && path === '/') {
      return { ctaId: 'tempo_marketing_site', destinationCategory: 'marketing' }
    }

    return null
  } catch {
    return null
  }
}
