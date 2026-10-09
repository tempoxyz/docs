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

export async function GET(request: Request): Promise<Response> {
  // Only this docs site's demo may spend the docs key; browsers mark other sites' requests.
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return failure(403, 'forbidden', 'Quote from the docs demo.')
  const url = new URL(request.url)
  const kind = url.searchParams.get('kind') ?? ''
  if (!kinds.has(kind)) return failure(400, 'param_invalid', 'Unknown quote type.')
  const key = process.env.ROUTES_QUOTE_API_KEY
  if (!key) return failure(503, 'quote_proxy_unavailable', 'Add a project API key to quote.')

  const target = new URL(`${upstream}/${kind}/quote`)
  for (const [name, value] of url.searchParams)
    if (params.has(name)) target.searchParams.set(name, value)
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
