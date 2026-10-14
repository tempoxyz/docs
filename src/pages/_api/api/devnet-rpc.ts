// Same-origin JSON-RPC proxy for the Accounts demos on the multisig-1113 devnet.
// Its public endpoint sits behind the shared `previews` API key, which must stay server-side,
// and HTTPS pages can't call the Tailscale-only HTTP endpoint. Without a key (local dev on the
// tailnet), it forwards to the Tailscale RPC instead.
const publicUpstream = process.env.DEVNET_RPC_URL ?? 'https://rpc-multisig-1113.devnet.tempoxyz.dev'
const tailnetUpstream = 'http://multisig-1113-nodes-rpc-service.tail388b2e.ts.net:8545'

const maxRequestBytes = 256 * 1024
const maxResponseBytes = 4 * 1024 * 1024
const maxBatch = 20
const allowedPrefixes = ['eth_', 'net_', 'web3_']
const allowedMethods = new Set(['tempo_fundAddress'])

export async function POST(request: Request): Promise<Response> {
  let body: string
  try {
    body = await readLimitedBody(request.body, maxRequestBytes)
  } catch {
    return failure(413, 'RPC request exceeds the size limit')
  }

  try {
    const parsed: unknown = JSON.parse(body)
    const calls = Array.isArray(parsed) ? parsed : [parsed]
    if (calls.length === 0 || calls.length > maxBatch || !calls.every(isAllowedCall))
      return failure(400, 'Unsupported demo RPC request')
  } catch {
    return failure(400, 'Invalid JSON-RPC request')
  }

  const apiKey = process.env.DEVNET_RPC_API_KEY
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (apiKey)
    headers.authorization = `Basic ${Buffer.from(`previews:${apiKey}`).toString('base64')}`

  try {
    const response = await fetch(apiKey ? publicUpstream : tailnetUpstream, {
      method: 'POST',
      headers,
      body,
      redirect: 'error',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
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
    return failure(502, 'The demo devnet is unavailable. Try again later.')
  }
}

function isAllowedCall(call: unknown) {
  if (!call || typeof call !== 'object') return false
  const { jsonrpc, method, params } = call as {
    jsonrpc?: unknown
    method?: unknown
    params?: unknown
  }
  if (jsonrpc !== '2.0' || typeof method !== 'string') return false
  if (params !== undefined && !Array.isArray(params)) return false
  return allowedMethods.has(method) || allowedPrefixes.some((prefix) => method.startsWith(prefix))
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
