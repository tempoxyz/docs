import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const submit = vi.fn()

vi.mock('vocs/config', () => ({
  Feedback: {
    slack: () => ({ submit }),
  },
}))

import feedback from '../pages/_api/api/feedback'

beforeEach(() => {
  process.env.SLACK_FEEDBACK_WEBHOOK = 'https://hooks.slack.test/services/example'
  submit.mockResolvedValue(undefined)
})

afterEach(() => {
  delete process.env.SLACK_FEEDBACK_WEBHOOK
  vi.clearAllMocks()
})

describe('product feedback API', () => {
  it('acknowledges a delivered product feedback report', async () => {
    const response = await feedback(
      new Request('https://tempo.xyz/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          source: 'mcp',
          kind: 'feedback',
          summary: 'Search result ordering',
          details: 'Prefer exact title matches first.',
        }),
      }),
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      accepted: true,
      report_id: expect.stringMatching(/^fb_[a-z0-9]+_[0-9a-f-]{36}$/),
    })
    expect(submit).toHaveBeenCalledOnce()
  })

  it('does not acknowledge a product feedback delivery failure', async () => {
    submit.mockRejectedValue(new Error('delivery unavailable'))
    const response = await feedback(
      new Request('https://tempo.xyz/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          source: 'mcp',
          kind: 'bug_report',
          summary: 'Search misses a page',
          details: 'The page does not appear in search results.',
        }),
      }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      accepted: false,
      error: 'Submission failed',
    })
  })
})
