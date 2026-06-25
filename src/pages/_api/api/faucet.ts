import { createClient, http } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Actions } from 'viem/tempo'

function getClient() {
  return createClient({
    chain: tempoModerato,
    transport: http(),
  })
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const corsHeaders = cors(origin)

  let body: { address?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { data: null, error: 'Invalid request: could not parse JSON' },
      { status: 400, headers: corsHeaders },
    )
  }

  const address = body?.address
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return Response.json(
      { data: null, error: 'Invalid or missing address' },
      { status: 400, headers: corsHeaders },
    )
  }

  return fund(address.toLowerCase() as `0x${string}`, corsHeaders)
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  return new Response(null, { status: 200, headers: cors(origin) })
}

async function fund(address: `0x${string}`, headers: Record<string, string>): Promise<Response> {
  try {
    const client = getClient()
    const hashes = await Actions.faucet.fund(client, { account: address })

    const data = hashes.map((hash) => ({ hash }))
    return Response.json({ data, error: null }, { headers })
  } catch (error) {
    console.error('Faucet error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return Response.json({ data: null, error: message }, { status: 500, headers })
  }
}

function cors(origin: string | null): Record<string, string> {
  const allowedOrigins = ['https://docs.tempo.xyz']

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
