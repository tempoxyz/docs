import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { FeedbackError, parseFeedbackRequest, submitFeedback } from '../../../lib/feedback'

const app = new Hono()

app.use(
  '*',
  cors({
    allowHeaders: ['Content-Type'],
    allowMethods: ['POST', 'OPTIONS'],
    origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
  }),
)

app.post('/api/feedback', async (c) => {
  try {
    const body = await parseFeedbackRequest(c.req.raw)
    const result = await submitFeedback(body)
    return c.json({ success: true, id: result.feedback.id, delivered: result.delivered })
  } catch (error) {
    if (error instanceof FeedbackError) {
      const status = error.status === 413 ? 413 : 400
      return c.json({ success: false, error: error.message }, status)
    }

    console.error('Feedback submission failed:', error)
    return c.json({ success: false, error: 'Submission failed' }, 500)
  }
})

export default function feedback(request: Request) {
  return app.fetch(request)
}

function isAllowedOrigin(origin: string | undefined) {
  if (!origin) return false
  if (process.env.NODE_ENV === 'development' && origin === 'http://localhost:5173') return true

  try {
    const { hostname, protocol } = new URL(origin)
    if (protocol !== 'https:') return false
    return (
      hostname === 'tempo.xyz' ||
      hostname.endsWith('.tempo.xyz') ||
      hostname.endsWith('.vercel.app')
    )
  } catch {
    return false
  }
}
