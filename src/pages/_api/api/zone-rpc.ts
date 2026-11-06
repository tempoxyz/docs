// Sandbox gateways currently omit X-Authorization-Token from their CORS allowlist, so the
// browser calls this route; the caller still supplies a signed Zone token.
const upstreams: Record<string, string> = {
  '6': 'https://rpc-zone-a.testnet.tempo.xyz',
  '7': 'https://rpc-zone-b.testnet.tempo.xyz',
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
  if (!Object.hasOwn(upstreams, zoneId)) return failure(400, 'Unknown demo zone')

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

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'X-Authorization-Token': token,
  }
  // `user:key` of a sandbox gateway client. Without it the gateway serves the demo under its
  // anonymous rate limit.
  const credential = process.env.ZONE_RPC_BASIC_AUTH?.trim()
  if (credential?.includes(':'))
    headers.authorization = `Basic ${Buffer.from(credential).toString('base64')}`

  try {
    const response = await fetch(new URL(upstreams[zoneId]), {
      method: 'POST',
      headers,
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
