import { Tidx } from 'tidx.ts'

type QueryRequest = {
  chainId: number
  query: string
  signatures?: Tidx.Signature[]
}

type RowValue = string | number | boolean | null

type QueryResponse = {
  columns: Array<{
    name: string
  }>
  rows: Array<RowValue[]>
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

  if (!Number.isInteger(body.chainId) || body.chainId <= 0) {
    return Response.json(
      {
        error: 'Invalid request: chainId is required and must be a positive integer',
      },
      { status: 400, headers: corsHeaders },
    )
  }

  const basicAuth = process.env.TIDX_BASIC_AUTH
  if (!basicAuth) {
    console.error('TIDX_BASIC_AUTH is not configured')
    return Response.json(
      { error: 'Server configuration error: tidx credentials not found' },
      { status: 500, headers: corsHeaders },
    )
  }

  try {
    const tidx = Tidx.create({
      basicAuth,
      baseUrl: process.env.TIDX_URL ?? 'https://tidx.tempo.xyz',
      chainId: body.chainId,
    })

    const result = await tidx.fetch({
      query: body.query.replace(/\s+/g, ' ').trim(),
      signatures: body.signatures,
    })

    return Response.json(toQueryResponse(result.rows), {
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error querying tidx:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  return new Response(null, { status: 200, headers: cors(origin) })
}

function cors(origin: string | null): Record<string, string> {
  const allowedOrigins = new Set(['https://docs.tempo.xyz', 'https://mainnet.docs.tempo.xyz'])

  if (origin?.includes('vercel.app')) allowedOrigins.add(origin)
  if (process.env.NODE_ENV === 'development' && process.env.VITE_BASE_URL)
    allowedOrigins.add(process.env.VITE_BASE_URL)

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
  }

  if (origin && Array.from(allowedOrigins).some((allowed) => origin.startsWith(allowed)))
    headers['Access-Control-Allow-Origin'] = origin

  return headers
}

function toQueryResponse(rows: Record<string, unknown>[]): QueryResponse {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).map((name) => ({
    name,
  }))

  return {
    columns,
    rows: rows.map((row) => columns.map((column) => toRowValue(row[column.name]))),
  }
}

function toRowValue(value: unknown): RowValue {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return value
  if (typeof value === 'bigint') return value.toString()
  return JSON.stringify(value)
}
