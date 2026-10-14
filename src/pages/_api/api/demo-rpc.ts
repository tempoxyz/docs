const upstream = 'https://rpc.moderato.tempo.xyz/'
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
  'eth_feeHistory',
  'eth_getBalance',
  'eth_getCode',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'eth_getTransactionCount',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_getLogs',
  'eth_newFilter',
  'eth_newBlockFilter',
  'eth_getFilterChanges',
  'eth_uninstallFilter',
  'eth_sendRawTransaction',
  'eth_sendRawTransactionSync',
  'tempo_fundAddress',
])

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    return failure(403, 'Use the RPC from the docs demo.')
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return failure(415, 'Send JSON-RPC as application/json.')

  let body: string
  try {
    body = await readLimitedBody(request.body, maxRequestBytes)
  } catch {
    return failure(413, 'RPC request exceeds the size limit.')
  }
  try {
    const payload = JSON.parse(body)
    const calls = Array.isArray(payload) ? payload : [payload]
    if (calls.length === 0 || calls.length > 5 || !calls.every(isAllowedCall))
      return failure(400, 'Unsupported demo RPC request.')
  } catch {
    return failure(400, 'Invalid JSON-RPC request.')
  }

  // Fork CI and local development can use the public pool without a secret.
  // Production should enable VITE_RPC_PROXY only after setting the server key.
  const key = process.env.TEMPO_RPC_API_KEY?.trim()
  try {
    const response = await fetch(key ? `${upstream}${encodeURIComponent(key)}` : upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      redirect: 'error',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
    })
    const responseBody = await readLimitedBody(response.body, maxResponseBytes)
    if (key && (responseBody.includes(key) || responseBody.includes(encodeURIComponent(key))))
      return failure(502, 'The demo RPC is unavailable. Try again later.')
    const retryAfter = response.headers.get('retry-after')
    return new Response(responseBody || null, {
      status: response.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        ...(retryAfter ? { 'retry-after': retryAfter } : {}),
      },
    })
  } catch {
    // Upstream errors can include the secret URL. Return only a fixed message.
    return failure(502, 'The demo RPC is unavailable. Try again later.')
  }
}

function isAllowedCall(call: unknown) {
  if (!call || typeof call !== 'object' || Array.isArray(call)) return false
  const rpc = call as Record<string, unknown>
  return (
    rpc.jsonrpc === '2.0' &&
    typeof rpc.method === 'string' &&
    allowedMethods.has(rpc.method) &&
    (rpc.id === undefined || rpc.id === null || ['string', 'number'].includes(typeof rpc.id)) &&
    (rpc.params === undefined || Array.isArray(rpc.params))
  )
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
