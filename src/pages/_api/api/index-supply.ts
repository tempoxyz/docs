import { tempoModerato } from 'viem/chains'

type QueryRequest = {
  query: string
  signatures?: string[]
}

type QueryResponse = {
  cursor?: string
  columns: Array<{
    name: string
    pgtype: string
  }>
  rows: Array<Array<string | number | null>>
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const corsHeaders = cors(origin)

  let body: QueryRequest
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'Invalid request: could not parse JSON' },
      { status: 400, headers: corsHeaders },
    )
  }

  if (!body || typeof body.query !== 'string') {
    return Response.json(
      { error: 'Invalid request: query is required' },
      { status: 400, headers: corsHeaders },
    )
  }

  const apiKey = import.meta.env.VITE_INDEXSUPPLY_API_KEY
  if (!apiKey) {
    console.error('VITE_INDEXSUPPLY_API_KEY is not configured')
    return Response.json(
      { error: 'Server configuration error: API key not found' },
      { status: 500, headers: corsHeaders },
    )
  }

  try {
    const endpoint = 'https://api.indexsupply.net/v2/query'
    const url = new URL(endpoint)
    url.searchParams.set('api-key', apiKey)

    const signatures = body.signatures && body.signatures.length > 0 ? body.signatures : ['']

    const chainId = tempoModerato.id
    const chainCursor = `${chainId}-0`

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify([
        {
          cursor: chainCursor,
          signatures,
          query: body.query.replace(/\s+/g, ' ').trim(),
        },
      ]),
    })

    let json: unknown
    try {
      json = await response.json()
    } catch {
      return Response.json(
        { error: 'Index Supply API returned invalid JSON' },
        { status: 502, headers: corsHeaders },
      )
    }

    if (!response.ok) {
      const message =
        typeof json === 'object' &&
        json !== null &&
        'message' in json &&
        typeof (json as { message?: string }).message === 'string'
          ? (json as { message: string }).message
          : response.statusText
      return Response.json(
        { error: `Index Supply API error: ${message}` },
        { status: response.status, headers: corsHeaders },
      )
    }

    const data = json as QueryResponse[]
    const [result] = data
    if (!result) {
      return Response.json(
        { error: 'Index Supply returned an empty result set' },
        { status: 500, headers: corsHeaders },
      )
    }

    return Response.json(result, { headers: corsHeaders })
  } catch (error) {
    console.error('Error querying Index Supply:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  return new Response(null, { status: 200, headers: cors(origin) })
}

function cors(origin: string | null): Record<string, string> {
  const allowedOrigins = ['https://docs.tempo.xyz', 'https://mainnet.docs.tempo.xyz']

  if (origin?.includes('vercel.app')) allowedOrigins.push(origin)
  if (process.env.NODE_ENV === 'development') allowedOrigins.push('http://localhost:5173')

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
  }

  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed)))
    headers['Access-Control-Allow-Origin'] = origin

  return headers
}
