// Quotes are read-only, so readers can price a route before adding their own API key. The docs
// key stays server-side and is only used for quotes; creating a transfer or deposit address always
// uses the reader's key.
const upstream = 'https://api.tempo.xyz/v1/routes'
const kinds = new Set(['transfers', 'deposit-addresses'])
const params = new Set([
  'amount',
  'destinationChain',
  'destinationToken',
  'mode',
  'recipient',
  'refundAddress',
  'sender',
  'slippageBps',
  'sourceChain',
  'sourceToken',
  'subsidize',
])

// The quote arrives as a JSON body rather than a query string, so the reader's addresses stay out
// of request URLs and the logs that record them. A JSON body also makes browsers preflight
// cross-site requests, which this route never approves.
export async function POST(request: Request): Promise<Response> {
  // Only this docs site's demo may spend the docs key; browsers mark other sites' requests.
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return failure(403, 'forbidden', 'Quote from the docs demo.')
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return failure(415, 'content_type_invalid', 'Send the quote as JSON.')
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return failure(400, 'body_invalid', 'Send the quote as JSON.')
  }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return failure(400, 'body_invalid', 'Send the quote as JSON.')
  const { kind, ...query } = body as Record<string, unknown>
  if (typeof kind !== 'string' || !kinds.has(kind))
    return failure(400, 'param_invalid', 'Unknown quote type.')
  const key = process.env.ROUTES_QUOTE_API_KEY
  if (!key) return failure(503, 'quote_proxy_unavailable', 'Add a project API key to quote.')

  const target = new URL(`${upstream}/${kind}/quote`)
  for (const [name, value] of Object.entries(query)) {
    if (!params.has(name)) continue
    if (!['string', 'number', 'boolean'].includes(typeof value) || String(value).length > 128)
      return failure(400, 'param_invalid', `Invalid ${name}.`)
    target.searchParams.set(name, String(value))
  }
  try {
    const response = await fetch(target, {
      headers: { 'tempo-api-key': key },
      redirect: 'error',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
    })
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'cache-control': 'no-store',
        'content-type': response.headers.get('content-type') ?? 'application/json',
      },
    })
  } catch {
    return failure(502, 'upstream_error', 'The quote service could not be reached. Try again.')
  }
}

function failure(status: number, code: string, message: string) {
  return Response.json(
    { error: { code, message } },
    { status, headers: { 'cache-control': 'no-store' } },
  )
}
