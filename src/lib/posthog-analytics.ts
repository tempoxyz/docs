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

const utmQueryParameters = new Set([
  'utm_campaign',
  'utm_content',
  'utm_creative_format',
  'utm_id',
  'utm_marketing_tactic',
  'utm_medium',
  'utm_source',
  'utm_source_platform',
  'utm_term',
])

const safeCampaignValuePattern = /^[a-z\d][a-z\d._~+-]{0,127}$/i

const blockedPropertyNames = new Set([
  'api_key',
  'authorization',
  'code_snippet',
  'command_text',
  'email',
  'feedback_message',
  'memo',
  'password',
  'phone',
  'private_key',
  'recipient_address',
  'search_query',
  'sender_address',
  'transaction_hash',
  'tx_hash',
  'wallet_address',
])

const maxCampaignValueLength = 256
const sensitivePathSegmentPatterns = [
  /^0x[a-f\d]{16,}$/i,
  /^[a-f\d]{64}$/i,
  /^[a-f\d]{8}-[a-f\d]{4}-[1-5][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i,
]

const productionAnalyticsHosts = new Set([
  'developers.tempo.xyz',
  'docs.tempo.xyz',
  'mainnet.docs.tempo.xyz',
  'tempo.xyz',
  'www.tempo.xyz',
])

export const DEFAULT_ANALYTICS_RELEASE = 'docs_growth_v1'

export type AnalyticsPageType =
  | 'developer_blog'
  | 'developer_feature'
  | 'developer_home'
  | 'developer_performance'
  | 'docs'
  | 'other'

export type AnalyticsConversionIntent = 'contact' | 'developer' | 'none'
export type AnalyticsDestinationKind = 'external' | 'internal'

export type StrategicCta = {
  ctaId: string
  ctaType: string
  destination: string
  destinationCategory: string
  destinationHost: string
  destinationKind: AnalyticsDestinationKind
  destinationPath: string
  conversionIntent: AnalyticsConversionIntent
  conversionDetail?: string | undefined
}

export function isProductionAnalyticsHost(hostname: string) {
  return productionAnalyticsHosts.has(hostname.trim().toLowerCase().replace(/\.$/, ''))
}

export function getAnalyticsRuntimeProperties(site: string, release = DEFAULT_ANALYTICS_RELEASE) {
  const safeRelease = /^[a-z\d][a-z\d._-]{0,63}$/i.test(release)
    ? release
    : DEFAULT_ANALYTICS_RELEASE

  return {
    site,
    surface: site,
    tempo_app_id: site,
    client_type: 'browser',
    release: safeRelease,
  }
}

function shouldKeepQueryParameter(name: string) {
  const normalized = name.toLowerCase()
  return utmQueryParameters.has(normalized) || campaignQueryParameters.has(normalized)
}

function campaignPropertyKind(name: string) {
  const normalized = name.toLowerCase().replace(/^\$+/, '')
  if (
    /(?:^|_)utm_(?:source|medium|campaign|term|content|id|source_platform|creative_format|marketing_tactic)$/.test(
      normalized,
    )
  )
    return 'campaign'
  if (
    [...campaignQueryParameters].some(
      (parameter) => normalized === parameter || normalized.endsWith(`_${parameter}`),
    )
  )
    return 'click_id'
  return null
}

function sanitizeCampaignValue(kind: 'campaign' | 'click_id', value: unknown) {
  if (typeof value !== 'string' || !value) return undefined
  if (kind === 'click_id') return 'present'
  return safeCampaignValuePattern.test(value) ? value : undefined
}

export function hasUnsafeAnalyticsQuery(value: string) {
  try {
    const url = new URL(value, 'https://tempo.xyz')
    for (const [name, campaignValue] of url.searchParams.entries()) {
      const normalized = name.toLowerCase()
      if (campaignQueryParameters.has(normalized)) return true
      if (!utmQueryParameters.has(normalized)) return true
      if (!sanitizeCampaignValue('campaign', campaignValue)) return true
    }
    return false
  } catch {
    return true
  }
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

  if (/^(?:mailto|tel):/i.test(input)) return input.replace(/:.*/, ':')

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input)
  const isAbsolute = /^https?:\/\//i.test(input)
  const isProtocolRelative = input.startsWith('//')
  const isRelativeUrl = input.startsWith('/') || input.startsWith('?') || input.startsWith('#')
  if (hasScheme && !isAbsolute) return ''
  if (!isAbsolute && !isProtocolRelative && !isRelativeUrl) return value

  try {
    const url = new URL(input, 'https://tempo.xyz')
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''

    url.username = ''
    url.password = ''
    url.hash = ''
    url.pathname = redactSensitivePathSegments(url.pathname)

    for (const name of [...new Set(url.searchParams.keys())]) {
      if (!shouldKeepQueryParameter(name)) {
        url.searchParams.delete(name)
        continue
      }

      const kind = utmQueryParameters.has(name.toLowerCase()) ? 'campaign' : 'click_id'
      const values = url.searchParams.getAll(name)
      url.searchParams.delete(name)
      for (const item of values) {
        const sanitized = sanitizeCampaignValue(kind, item.slice(0, maxCampaignValueLength))
        if (sanitized) url.searchParams.append(name, sanitized)
      }
    }

    if (isAbsolute || isProtocolRelative) return url.toString()
    return `${url.pathname}${url.search}`
  } catch {
    return ''
  }
}

export function sanitizeAnalyticsPath(value: string) {
  const input = value.trim()
  if (!input) return input

  try {
    const url = new URL(input, 'https://tempo.xyz')
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return redactSensitivePathSegments(url.pathname)
  } catch {
    return ''
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

function isPathProperty(name: string) {
  const normalized = name.toLowerCase()
  return normalized === 'path' || normalized.endsWith('_path') || normalized.endsWith('pathname')
}

function sanitizeHeatmapData(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const sanitized: Record<string, unknown> = {}
  for (const [rawUrl, points] of Object.entries(value as Record<string, unknown>)) {
    const safeUrl = sanitizeAnalyticsUrl(rawUrl)
    if (!safeUrl || !/^https?:\/\//i.test(safeUrl)) continue

    const safePoints = sanitizePropertyValue('$heatmap_points', points)
    const existing = sanitized[safeUrl]
    sanitized[safeUrl] =
      Array.isArray(existing) && Array.isArray(safePoints)
        ? [...existing, ...safePoints]
        : safePoints
  }

  return sanitized
}

function sanitizePropertyValue(name: string, value: unknown): unknown {
  const normalizedName = name.toLowerCase().replace(/^\$+/, '')
  if (blockedPropertyNames.has(normalizedName)) return undefined
  if (name === '$heatmap_data') return sanitizeHeatmapData(value)
  const campaignKind = campaignPropertyKind(name)
  if (campaignKind) return sanitizeCampaignValue(campaignKind, value)
  if (typeof value === 'string' && isPathProperty(name)) return sanitizeAnalyticsPath(value)
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
    properties: sanitizePropertyRecord((capture.properties ?? {}) as Record<string, unknown>),
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

export function getAnalyticsPageContext(pathname: string, title = '') {
  const pagePath = sanitizeAnalyticsPath(normalizeAnalyticsPath(pathname)) || '/'
  return {
    page_path: pagePath,
    page_type: classifyAnalyticsPage(pagePath),
    page_section: getAnalyticsPageSection(pagePath),
    page_title: title.trim().slice(0, 240),
  }
}

export function enrichPostHogCapture(
  capture: CaptureResult | null,
  pathname: string,
  title = '',
): CaptureResult | null {
  if (!capture) return null
  return {
    ...capture,
    properties: {
      ...getAnalyticsPageContext(pathname, title),
      ...(capture.properties ?? {}),
    },
  } as CaptureResult
}

function contactConversionDetail(pathname: string) {
  const path = normalizeAnalyticsPath(pathname)
  if (path === '/docs/api' || path.startsWith('/docs/api/')) return 'api_access'
  if (path.includes('/zones')) return 'zones_design_partner'
  if (path.startsWith('/docs/guide/node/validator')) return 'validator_interest'
  if (path === '/docs/partners' || path.startsWith('/docs/ecosystem')) return 'partner_interest'
  return 'general_contact'
}

function normalizeAnalyticsHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, '')
}

function buildStrategicCta(
  url: URL,
  properties: {
    ctaId: string
    destinationCategory: string
    conversionIntent: AnalyticsConversionIntent
    conversionDetail?: string | undefined
  },
): StrategicCta {
  const destinationHost = normalizeAnalyticsHostname(url.hostname)
  return {
    ...properties,
    ctaType: properties.ctaId,
    destination: sanitizeAnalyticsUrl(url.toString()),
    destinationHost,
    destinationKind: isProductionAnalyticsHost(url.hostname) ? 'internal' : 'external',
    destinationPath: sanitizeAnalyticsPath(normalizeAnalyticsPath(url.pathname)),
  }
}

/** Returns stable metadata only for destinations worth treating as funnel CTAs. */
export function classifyStrategicCta(href: string, currentPathname: string): StrategicCta | null {
  try {
    const url = new URL(href, 'https://tempo.xyz')
    const hostname = normalizeAnalyticsHostname(url.hostname)
    const path = normalizeAnalyticsPath(url.pathname)
    const isDocsSurfaceHost = isProductionAnalyticsHost(url.hostname)

    if (hostname === 'tempo.xyz' && /^\/contact\/?$/.test(url.pathname)) {
      const conversionDetail = contactConversionDetail(currentPathname)
      return buildStrategicCta(url, {
        ctaId: `contact_${conversionDetail}`,
        destinationCategory: 'contact',
        conversionIntent: 'contact',
        conversionDetail,
      })
    }

    if (hostname === 'wallet.tempo.xyz')
      return buildStrategicCta(url, {
        ctaId: 'tempo_wallet',
        destinationCategory: 'wallet',
        conversionIntent: 'developer',
        conversionDetail: 'wallet',
      })
    if (
      hostname === 'faucet.tempo.xyz' ||
      (isDocsSurfaceHost && path === '/docs/quickstart/faucet')
    )
      return buildStrategicCta(url, {
        ctaId: 'tempo_faucet',
        destinationCategory: 'faucet',
        conversionIntent: 'developer',
        conversionDetail: 'faucet',
      })
    if (hostname === 'explorer.tempo.xyz')
      return buildStrategicCta(url, {
        ctaId: 'tempo_explorer',
        destinationCategory: 'explorer',
        conversionIntent: 'developer',
        conversionDetail: 'explorer',
      })
    if (hostname === 'github.com' && url.pathname.toLowerCase().startsWith('/tempoxyz'))
      return buildStrategicCta(url, {
        ctaId: 'tempo_github',
        destinationCategory: 'source',
        conversionIntent: 'developer',
        conversionDetail: 'source',
      })
    if (hostname === 'mpp.dev')
      return buildStrategicCta(url, {
        ctaId: 'mpp_docs',
        destinationCategory: 'mpp',
        conversionIntent: 'developer',
        conversionDetail: 'mpp',
      })

    const strategicDocsPaths: Record<
      string,
      Pick<StrategicCta, 'ctaId' | 'destinationCategory' | 'conversionIntent' | 'conversionDetail'>
    > = {
      '/docs/guide/machine-payments': {
        ctaId: 'machine_payments_guide',
        destinationCategory: 'guide',
        conversionIntent: 'developer',
        conversionDetail: 'machine_payments_guide',
      },
      '/docs/guide/payments/accept-a-payment': {
        ctaId: 'accept_payments_guide',
        destinationCategory: 'guide',
        conversionIntent: 'developer',
        conversionDetail: 'accept_payments_guide',
      },
      '/docs/guide/payments/send-a-payment': {
        ctaId: 'send_first_payment_guide',
        destinationCategory: 'guide',
        conversionIntent: 'developer',
        conversionDetail: 'send_first_payment_guide',
      },
      '/docs/guide/using-tempo-with-ai': {
        ctaId: 'tempo_ai_guide',
        destinationCategory: 'agent_setup',
        conversionIntent: 'developer',
        conversionDetail: 'tempo_ai_guide',
      },
      '/docs/quickstart/integrate-tempo': {
        ctaId: 'integrate_tempo',
        destinationCategory: 'get_started',
        conversionIntent: 'developer',
        conversionDetail: 'integrate_tempo',
      },
    }
    const strategicDocsCta = strategicDocsPaths[path]
    if (isDocsSurfaceHost && strategicDocsCta) return buildStrategicCta(url, strategicDocsCta)

    if (hostname === 'tempo.xyz' && path === '/') {
      return buildStrategicCta(url, {
        ctaId: 'tempo_marketing_site',
        destinationCategory: 'marketing',
        conversionIntent: 'none',
        conversionDetail: 'marketing_site',
      })
    }

    return null
  } catch {
    return null
  }
}
