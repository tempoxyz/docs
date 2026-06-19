import { z } from 'zod'

const maxBodyBytes = 16 * 1024
const maxMessageLength = 4_000
const maxShortLength = 160
const maxUrlLength = 2_048

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
  .passthrough()

export type FeedbackInput = z.input<typeof feedbackInputSchema>

export type NormalizedFeedback = {
  id: string
  source: 'docs' | 'mcp'
  sentiment: 'positive' | 'negative' | 'neutral'
  helpful?: boolean | undefined
  category?: string | undefined
  message?: string | undefined
  pageUrl?: string | undefined
  path?: string | undefined
  toolName?: string | undefined
  relatedResource?: string | undefined
  client?: string | undefined
  requestId?: string | undefined
  timestamp: string
}

type FeedbackContext = {
  headers?: Headers | undefined
}

type FeedbackDestinationResult = {
  destination: 'slack' | 'posthog'
  ok: boolean
  status?: number | undefined
}

export type SubmitFeedbackResult = {
  feedback: NormalizedFeedback
  delivered: boolean
  destinations: FeedbackDestinationResult[]
}

export async function parseFeedbackRequest(request: Request): Promise<FeedbackInput> {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > maxBodyBytes) throw new FeedbackError('Request body too large', 413)

  let text: string
  try {
    text = await request.text()
  } catch {
    throw new FeedbackError('Could not read request body', 400)
  }

  if (new TextEncoder().encode(text).byteLength > maxBodyBytes) {
    throw new FeedbackError('Request body too large', 413)
  }

  try {
    return JSON.parse(text) as FeedbackInput
  } catch {
    throw new FeedbackError('Invalid JSON', 400)
  }
}

export async function submitFeedback(
  input: FeedbackInput,
  context: FeedbackContext = {},
): Promise<SubmitFeedbackResult> {
  const feedback = normalizeFeedback(input)

  const destinationPromises = [sendSlackFeedback(feedback), sendPostHogFeedback(feedback, context)]
  const settled = await Promise.allSettled(destinationPromises)
  const destinations = settled.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value
    return []
  })

  return {
    feedback,
    delivered: destinations.some((destination) => destination.ok),
    destinations,
  }
}

export function normalizeFeedback(input: FeedbackInput): NormalizedFeedback {
  const parsed = feedbackInputSchema.safeParse(input)
  if (!parsed.success) throw new FeedbackError('Invalid feedback payload', 400)

  const data = parsed.data
  const source = data.source ?? (typeof data.helpful === 'boolean' ? 'docs' : 'mcp')
  const message = cleanText(data.message, maxMessageLength)
  const category = cleanText(data.category, maxShortLength)
  const pageUrl = cleanUrl(data.pageUrl)
  const path = cleanPath(data.path ?? getPathFromUrl(pageUrl))
  const toolName = cleanText(data.toolName ?? data.relatedTool, maxShortLength)
  const relatedResource = cleanText(data.relatedResource, maxUrlLength)
  const client = cleanText(data.client, maxShortLength)
  const requestId = cleanText(data.requestId, maxShortLength)

  if (source === 'docs' && typeof data.helpful !== 'boolean') {
    throw new FeedbackError('Docs feedback requires helpful', 400)
  }

  if (source === 'mcp' && !message && !category) {
    throw new FeedbackError('MCP feedback requires message or category', 400)
  }

  if (source === 'docs' && !pageUrl && !path) {
    throw new FeedbackError('Docs feedback requires pageUrl or path', 400)
  }

  const sentiment = data.sentiment ?? getSentiment(data.helpful)
  const timestamp = normalizeTimestamp(data.timestamp)

  return {
    id: `fb_${Date.now().toString(36)}_${crypto.randomUUID()}`,
    source,
    sentiment,
    helpful: data.helpful,
    category,
    message,
    pageUrl,
    path,
    toolName,
    relatedResource,
    client,
    requestId,
    timestamp,
  }
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

export function slackEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/@/g, '@\u200B')
    .replace(/#/g, '#\u200B')
}

export class FeedbackError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'FeedbackError'
    this.status = status
  }
}

async function sendSlackFeedback(
  feedback: NormalizedFeedback,
): Promise<FeedbackDestinationResult[]> {
  const webhookUrl = getSlackWebhookUrl(feedback.source)
  if (!webhookUrl) return []

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks: slackBlocks(feedback) }),
  })

  return [{ destination: 'slack', ok: response.ok, status: response.status }]
}

async function sendPostHogFeedback(
  feedback: NormalizedFeedback,
  context: FeedbackContext,
): Promise<FeedbackDestinationResult[]> {
  const apiKey = process.env.POSTHOG_KEY || process.env.VITE_POSTHOG_KEY
  if (!apiKey) return []

  const host =
    process.env.POSTHOG_HOST || process.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'
  const events = [
    'feedback_submitted',
    `feedback_${feedback.source}_submitted`,
    ...(feedback.source === 'docs' && typeof feedback.helpful === 'boolean'
      ? [feedback.helpful ? 'docs_feedback_helpful' : 'docs_feedback_not_helpful']
      : []),
  ]

  const ip = context.headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
  const properties = {
    site: 'docs',
    feedback_id: feedback.id,
    feedback_source: feedback.source,
    feedback_sentiment: feedback.sentiment,
    feedback_helpful: feedback.helpful,
    feedback_category: feedback.category,
    feedback_message: feedback.message,
    feedback_page_url: feedback.pageUrl,
    page_path: feedback.path,
    feedback_tool_name: feedback.toolName,
    feedback_related_resource: feedback.relatedResource,
    feedback_client: feedback.client,
    feedback_request_id: feedback.requestId,
    $ip: ip,
  }

  const responses = await Promise.all(
    events.map((event) =>
      fetch(`${host}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          event,
          distinct_id: `${feedback.source}_${feedback.id}`,
          properties,
          timestamp: feedback.timestamp,
        }),
      }),
    ),
  )

  return responses.map((response) => ({
    destination: 'posthog' as const,
    ok: response.ok,
    status: response.status,
  }))
}

function slackBlocks(feedback: NormalizedFeedback) {
  const icon =
    feedback.sentiment === 'positive'
      ? ':thumbsup:'
      : feedback.sentiment === 'negative'
        ? ':thumbsdown:'
        : ':speech_balloon:'
  const title = `${icon} ${feedback.source.toUpperCase()} Feedback`
  const fields = [
    field('Source', feedback.source),
    field('Sentiment', feedback.sentiment),
    field('Time', new Date(feedback.timestamp).toLocaleString()),
  ]

  if (feedback.path) fields.push(field('Path', feedback.path))
  if (feedback.pageUrl)
    fields.push(field('Page', `<${feedback.pageUrl}|${feedback.pageUrl}>`, false))
  if (feedback.category) fields.push(field('Category', feedback.category))
  if (feedback.toolName) fields.push(field('Tool', feedback.toolName))
  if (feedback.client) fields.push(field('Client', feedback.client))
  if (feedback.requestId) fields.push(field('Request ID', feedback.requestId))

  const blocks: object[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: title, emoji: true },
    },
    {
      type: 'section',
      fields,
    },
  ]

  if (feedback.message) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Message:*\n${slackEscape(feedback.message)}`,
      },
    })
  }

  if (feedback.relatedResource) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `Related: ${slackEscape(feedback.relatedResource)}` }],
    })
  }

  return blocks
}

function field(title: string, value: string, shouldEscape = true) {
  return {
    type: 'mrkdwn',
    text: `*${title}:*\n${shouldEscape ? slackEscape(value) : value}`,
  }
}

function getSlackWebhookUrl(source: 'docs' | 'mcp') {
  if (source === 'mcp') {
    return (
      process.env.FEEDBACK_MCP_SLACK_WEBHOOK_URL ||
      process.env.FEEDBACK_SLACK_WEBHOOK_URL ||
      process.env.SLACK_FEEDBACK_WEBHOOK
    )
  }

  return (
    process.env.FEEDBACK_DOCS_SLACK_WEBHOOK_URL ||
    process.env.FEEDBACK_SLACK_WEBHOOK_URL ||
    process.env.SLACK_FEEDBACK_WEBHOOK
  )
}

function cleanText(value: string | undefined, maxLength: number) {
  if (typeof value !== 'string') return undefined
  const cleaned = redactSecrets(value.replace(/\s+/g, ' ').trim()).slice(0, maxLength)
  return cleaned || undefined
}

function cleanPath(value: string | undefined) {
  const cleaned = cleanText(value, 512)
  if (!cleaned) return undefined
  if (!cleaned.startsWith('/')) return `/${cleaned}`
  return cleaned
}

function cleanUrl(value: string | undefined) {
  const cleaned = cleanText(value, maxUrlLength)
  if (!cleaned) return undefined

  try {
    const url = new URL(cleaned)
    if (!['http:', 'https:'].includes(url.protocol)) return undefined
    url.hash = ''
    return url.toString()
  } catch {
    return undefined
  }
}

function getPathFromUrl(value: string | undefined) {
  if (!value) return undefined
  try {
    return new URL(value).pathname
  } catch {
    return undefined
  }
}

function getSentiment(helpful: boolean | undefined) {
  if (helpful === true) return 'positive'
  if (helpful === false) return 'negative'
  return 'neutral'
}

function normalizeTimestamp(value: string | undefined) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}
