import { Feedback } from 'vocs/config'
import { z } from 'zod'

const maxBodyBytes = 16 * 1024
const maxMessageLength = 4_000
const maxShortLength = 160
const maxUrlLength = 2_048
const defaultPageUrl = 'https://tempo.xyz/developers/'

const schemeUrlPattern = /\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"'`]+/gi
const bareIpv4Pattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g

const feedbackInputSchema = z
  .object({
    source: z.enum(['docs', 'mcp']).optional(),
    helpful: z.boolean().optional(),
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
    category: z.string().optional(),
    message: z.string().optional(),
    pageUrl: z.string().optional(),
    path: z.string().optional(),
    toolName: z.string().optional(),
    relatedTool: z.string().optional(),
    relatedResource: z.string().optional(),
    client: z.string().optional(),
    requestId: z.string().optional(),
    timestamp: z.string().optional(),
  })
  .strict()

export type FeedbackInput = z.input<typeof feedbackInputSchema>

export type NormalizedFeedback = {
  id: string
  source: 'docs' | 'mcp'
  sentiment: 'positive' | 'negative' | 'neutral'
  timestamp: string
  helpful?: boolean | undefined
  category?: string | undefined
  message?: string | undefined
  pageUrl?: string | undefined
  path?: string | undefined
  toolName?: string | undefined
  relatedResource?: string | undefined
  client?: string | undefined
  requestId?: string | undefined
}

export type SubmitFeedbackResult = {
  feedback: NormalizedFeedback
  delivered: boolean
}

export async function parseFeedbackRequest(request: Request): Promise<FeedbackInput> {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > maxBodyBytes) throw new FeedbackError('Request body too large', 413)

  const text = await request.text().catch(() => {
    throw new FeedbackError('Could not read request body', 400)
  })

  if (new TextEncoder().encode(text).byteLength > maxBodyBytes)
    throw new FeedbackError('Request body too large', 413)

  try {
    return JSON.parse(text) as FeedbackInput
  } catch {
    throw new FeedbackError('Invalid JSON', 400)
  }
}

export async function submitFeedback(input: FeedbackInput): Promise<SubmitFeedbackResult> {
  const feedback = normalizeFeedback(input)
  const delivered = await sendSlackFeedback(feedback)
  return { feedback, delivered }
}

export function normalizeFeedback(input: FeedbackInput): NormalizedFeedback {
  const parsed = feedbackInputSchema.safeParse(input)
  if (!parsed.success) throw new FeedbackError('Invalid feedback payload', 400)

  const data = parsed.data
  const source = data.source ?? (typeof data.helpful === 'boolean' ? 'docs' : 'mcp')
  const pageUrl = cleanUrl(data.pageUrl)
  const path = cleanPath(data.path ?? pathFromUrl(pageUrl) ?? rawPathFromUrl(data.pageUrl))
  const feedback = {
    id: `fb_${Date.now().toString(36)}_${crypto.randomUUID()}`,
    source,
    sentiment: data.sentiment ?? sentimentFromHelpful(data.helpful),
    timestamp: normalizeTimestamp(data.timestamp),
    helpful: data.helpful,
    category: cleanFreeText(data.category, maxShortLength),
    message: cleanFreeText(data.message, maxMessageLength),
    pageUrl,
    path,
    toolName: cleanFreeText(data.toolName ?? data.relatedTool, maxShortLength),
    relatedResource: cleanResource(data.relatedResource),
    client: cleanFreeText(data.client, maxShortLength),
    requestId: cleanFreeText(data.requestId, maxShortLength),
  } satisfies NormalizedFeedback

  if (feedback.source === 'docs' && typeof feedback.helpful !== 'boolean')
    throw new FeedbackError('Docs feedback requires helpful', 400)
  if (feedback.source === 'docs' && !feedback.pageUrl && !feedback.path)
    throw new FeedbackError('Docs feedback requires pageUrl or path', 400)
  if (feedback.source === 'mcp' && !feedback.message && !feedback.category)
    throw new FeedbackError('MCP feedback requires message or category', 400)

  return feedback
}

export function redactSecrets(value: string): string {
  return value
    .replace(/\b0x[a-fA-F0-9]{64}\b/g, '[REDACTED_PRIVATE_KEY]')
    .replace(/\b(?:sk|pk|rk|ghp|gho|github_pat)_[A-Za-z0-9_=-]{16,}\b/g, '[REDACTED_TOKEN]')
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{16,}\b/gi, '$1 [REDACTED_TOKEN]')
    .replace(
      /\b(api[_-]?key|token|secret|password|private[_-]?key)\s*[:=]\s*["']?[^"'\s,;]{8,}/gi,
      '$1=[REDACTED_SECRET]',
    )
}

export class FeedbackError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'FeedbackError'
  }
}

async function sendSlackFeedback(feedback: NormalizedFeedback): Promise<boolean> {
  try {
    await Feedback.slack().submit(toVocsFeedback(feedback))
    return Boolean(process.env.SLACK_FEEDBACK_WEBHOOK)
  } catch {
    return false
  }
}

function cleanText(value: string | undefined, maxLength: number) {
  if (typeof value !== 'string') return undefined
  const cleaned = redactSecrets(stripInvisible(value).replace(/\s+/g, ' ').trim()).slice(
    0,
    maxLength,
  )
  return cleaned || undefined
}

/** Drops control, zero-width and bidi-override characters that hide or reorder text. */
function stripInvisible(value: string) {
  let out = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    const whitespace = code === 0x09 || code === 0x0a || code === 0x0d
    const control = (code < 0x20 && !whitespace) || (code >= 0x7f && code <= 0x9f)
    const invisible =
      (code >= 0x200b && code <= 0x200f) ||
      (code >= 0x202a && code <= 0x202e) ||
      (code >= 0x2060 && code <= 0x2069) ||
      code === 0xfeff
    if (!control && !invisible) out += char
  }
  return out
}

/** Free text shown in Slack: links outside Tempo are defanged so they are not clickable. */
function cleanFreeText(value: string | undefined, maxLength: number) {
  const cleaned = cleanText(value, maxLength)
  return cleaned ? defangLinks(cleaned) : undefined
}

function cleanResource(value: string | undefined) {
  const cleaned = cleanText(value, maxUrlLength)
  if (!cleaned) return undefined
  if (/^[a-z][a-z0-9+.-]*:/i.test(cleaned) || cleaned.startsWith('//')) {
    const url = allowedUrl(cleaned)
    return url ? url.toString() : defangLinks(cleaned)
  }
  return defangLinks(cleaned)
}

export function defangLinks(value: string): string {
  return value
    .replace(schemeUrlPattern, (match) => (allowedUrl(match) ? match : defangUrl(match)))
    .replace(bareIpv4Pattern, (match) => match.replaceAll('.', '[.]'))
}

function defangUrl(value: string) {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)(.*)$/is.exec(value)
  if (!match) return value
  const [, scheme = '', host = '', rest = ''] = match
  const safeScheme = scheme.toLowerCase().replace(/^http/, 'hxxp').replace(/^ftp/, 'fxp')
  return `${safeScheme}[://]${host.replaceAll('.', '[.]')}${rest}`
}

export function isTempoHost(hostname: string) {
  return hostname === 'tempo.xyz' || hostname.endsWith('.tempo.xyz')
}

function allowedUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !isTempoHost(url.hostname)) return undefined
    if (url.username || url.password || url.port) return undefined
    return url
  } catch {
    return undefined
  }
}

function cleanPath(value: string | undefined) {
  const cleaned = cleanText(value, 512)
  if (!cleaned) return undefined
  const path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`
  return path.replace(/^\/developers(?=\/|$)/, '').replace(/^\/docs(?=\/|$)/, '') || '/'
}

function cleanUrl(value: string | undefined) {
  const cleaned = cleanText(value, maxUrlLength)
  if (!cleaned) return undefined

  const url = allowedUrl(cleaned)
  if (!url) return undefined
  url.hash = ''
  return url.toString()
}

/** The path of any http(s) URL, so feedback from preview hosts still names its page. */
function rawPathFromUrl(value: string | undefined) {
  const cleaned = cleanText(value, maxUrlLength)
  if (!cleaned) return undefined
  try {
    const url = new URL(cleaned)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    return url.pathname
  } catch {
    return undefined
  }
}

function pathFromUrl(value: string | undefined) {
  if (!value) return undefined
  try {
    return new URL(value).pathname
  } catch {
    return undefined
  }
}

function normalizeTimestamp(value: string | undefined) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function sentimentFromHelpful(helpful: boolean | undefined) {
  if (helpful === true) return 'positive'
  if (helpful === false) return 'negative'
  return 'neutral'
}

function toVocsFeedback(feedback: NormalizedFeedback) {
  if (feedback.source === 'docs') {
    return {
      helpful: feedback.helpful ?? feedback.sentiment === 'positive',
      category: feedback.category,
      message: feedback.message,
      pageUrl: feedback.pageUrl ?? urlFromPath(feedback.path),
      timestamp: feedback.timestamp,
    }
  }

  return {
    helpful: feedback.sentiment === 'positive',
    category: compact(['MCP feedback', feedback.toolName && `tool: ${feedback.toolName}`]).join(
      ' | ',
    ),
    message: compact([
      feedback.message,
      feedback.relatedResource && `Resource: ${feedback.relatedResource}`,
      feedback.client && `Client: ${feedback.client}`,
      feedback.requestId && `Request ID: ${feedback.requestId}`,
    ]).join('\n'),
    pageUrl: feedback.pageUrl ?? urlFromPath(feedback.path ?? feedback.relatedResource),
    timestamp: feedback.timestamp,
  }
}

function compact<T>(values: Array<T | false | undefined>): T[] {
  return values.filter(Boolean) as T[]
}

function urlFromPath(path: string | undefined) {
  if (!path) return defaultPageUrl
  if (URL.canParse(path)) return allowedUrl(path)?.toString() ?? defaultPageUrl
  try {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, 'https://tempo.xyz/developers')
    return isTempoHost(url.hostname) ? url.toString() : defaultPageUrl
  } catch {
    return defaultPageUrl
  }
}
