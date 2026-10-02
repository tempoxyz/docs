// Sandbox gateways currently omit X-Authorization-Token from their CORS allowlist.
// Keep HTTP credentials server-side; the caller still supplies a signed Zone token.
// Upstream URLs (which may embed HTTP Basic credentials) come from the environment
// so no secret is committed to the repository. The lookup is per-request so a
// misconfigured deployment fails closed instead of shipping a default credential.
const upstreamEnvKeys: Record<string, string> = {
  '6': 'ZONE_RPC_UPSTREAM_6',
  '7': 'ZONE_RPC_UPSTREAM_7',
}

const maxRequestBytes = 128 * 1024
const maxResponseBytes = 2 * 1024 * 1024
const allowedMethods = new Set([
  'eth_chainId',
  'eth_blockNumber',
  'eth_call',
  'eth_estimateGas',
  'eth_fillTransaction',
  'eth_gasPrice',
  'eth_maxPriorityFeePerGas',
  'eth_getBalance',
  'eth_getCode',
  'eth_getBlockByNumber',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_sendRawTransaction',
  'eth_sendRawTransactionSync',
  'zone_getAuthorizationTokenInfo',
  'zone_getZoneInfo',
])

export async function POST(request: Request): Promise<Response> {
  const zoneId = new URL(request.url).searchParams.get('zone') ?? ''
  const upstreamEnvKey = Object.hasOwn(upstreamEnvKeys, zoneId)
    ? upstreamEnvKeys[zoneId]
    : undefined
  if (!upstreamEnvKey) return failure(400, 'Unknown demo zone')

  const upstreamUrl = process.env[upstreamEnvKey]
  if (!upstreamUrl) {
    console.error(`Zone RPC upstream for zone ${zoneId} is not configured`)
    return failure(500, 'The demo Zone RPC is unavailable. Try again later.')
  }

  const token = request.headers.get('X-Authorization-Token')
  if (!token || !/^0x[0-9a-f]+$/i.test(token) || token.length > 8192) {
    return failure(401, 'A signed Zone authorization token is required')
  }

  let body: string
  try {
    body = await readLimitedBody(request.body, maxRequestBytes)
  } catch {
    return failure(413, 'RPC request exceeds the size limit')
  }

  try {
    const rpc = JSON.parse(body)
    if (
      !rpc ||
      Array.isArray(rpc) ||
      rpc.jsonrpc !== '2.0' ||
      !allowedMethods.has(rpc.method) ||
      (rpc.params !== undefined && !Array.isArray(rpc.params))
    )
      return failure(400, 'Unsupported demo RPC request')
  } catch {
    return failure(400, 'Invalid JSON-RPC request')
  }

  const upstream = new URL(upstreamUrl)
  const authorization = `Basic ${Buffer.from(
    `${decodeURIComponent(upstream.username)}:${decodeURIComponent(upstream.password)}`,
  ).toString('base64')}`
  upstream.username = ''
  upstream.password = ''

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization,
        'X-Authorization-Token': token,
      },
      body,
      redirect: 'error',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
    })
    const responseBody = await readLimitedBody(response.body, maxResponseBytes)
    return new Response(responseBody || null, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') ?? 'application/json',
        'cache-control': 'no-store',
      },
    })
  } catch {
    return failure(502, 'The demo Zone RPC is unavailable. Try again later.')
  }
}

function failure(status: number, message: string) {
  return Response.json(
    { jsonrpc: '2.0', id: null, error: { code: -32000, message } },
    { status, headers: { 'cache-control': 'no-store' } },
  )
}

async function readLimitedBody(body: ReadableStream<Uint8Array> | null, limit: number) {
  if (!body) return ''
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let size = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return text + decoder.decode()
      size += value.byteLength
      if (size > limit) {
        await reader.cancel()
        throw new Error('Body too large')
      }
      text += decoder.decode(value, { stream: true })
    }
  } finally {
    reader.releaseLock()
  }
}
