import { FeedbackError, parseFeedbackRequest, submitFeedback } from '../../../lib/feedback'

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const headers = cors(origin)

  try {
    const body = await parseFeedbackRequest(request)
    const result = await submitFeedback(body, { headers: request.headers })

    return Response.json(
      {
        success: true,
        id: result.feedback.id,
        delivered: result.delivered,
      },
      { headers },
    )
  } catch (error) {
    if (error instanceof FeedbackError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status, headers },
      )
    }

    console.error('Feedback submission failed:', error)
    return Response.json({ success: false, error: 'Submission failed' }, { status: 500, headers })
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  return new Response(null, { status: 200, headers: cors(origin) })
}

function cors(origin: string | null): Record<string, string> {
  const allowedOrigins = ['https://docs.tempo.xyz', 'https://mainnet.docs.tempo.xyz']

  if (origin?.includes('tempo.xyz')) allowedOrigins.push(origin)
  if (origin?.includes('vercel.app')) allowedOrigins.push(origin)
  if (process.env.NODE_ENV === 'development') allowedOrigins.push('http://localhost:5173')

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}
