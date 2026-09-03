import { describe, expect, it } from 'vitest'
import { FeedbackError, normalizeFeedback, redactSecrets } from './feedback'

describe('redactSecrets', () => {
  it.each([
    [
      'hex private keys',
      'key=0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      'key=[REDACTED_PRIVATE_KEY]',
    ],
    [
      'bearer tokens',
      'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456',
      'Authorization: Bearer [REDACTED_TOKEN]',
    ],
    ['named secrets', 'api_key = tempo_secret_1234567890', 'api_key=[REDACTED_SECRET]'],
  ])('redacts %s', (_name, input, expected) => {
    expect(redactSecrets(input)).toBe(expected)
  })
})

describe('normalizeFeedback', () => {
  it('normalizes docs feedback', () => {
    const feedback = normalizeFeedback({
      helpful: false,
      category: ' Missing information ',
      message: ' Needs  more detail about token setup. ',
      pageUrl: 'https://tempo.xyz/developers/docs/guide/payments#send',
      timestamp: '2026-06-19T12:00:00.000Z',
    })

    expect(feedback).toMatchObject({
      source: 'docs',
      sentiment: 'negative',
      category: 'Missing information',
      message: 'Needs more detail about token setup.',
      pageUrl: 'https://tempo.xyz/developers/docs/guide/payments',
      path: '/guide/payments',
      timestamp: '2026-06-19T12:00:00.000Z',
    })
  })

  it('normalizes MCP feedback', () => {
    const feedback = normalizeFeedback({
      source: 'mcp',
      sentiment: 'neutral',
      message: 'read_page result has stale CLI command',
      toolName: 'read_page',
      relatedResource: '/guide/using-tempo-with-ai',
      client: 'codex',
    })

    expect(feedback).toMatchObject({
      source: 'mcp',
      sentiment: 'neutral',
      toolName: 'read_page',
      relatedResource: '/guide/using-tempo-with-ai',
      client: 'codex',
    })
  })

  it('requires MCP feedback content', () => {
    expect(() => normalizeFeedback({ source: 'mcp', toolName: 'read_page' })).toThrow(FeedbackError)
  })

  it('normalizes structured MCP product feedback', () => {
    const feedback = normalizeFeedback({
      kind: 'bug_report',
      summary: 'Search misses a page',
      details: 'A documented page does not appear in search results.',
      steps_to_reproduce: 'Search for the exact page title.',
      expected_behavior: 'The page is returned.',
      actual_behavior: 'No matching page is returned.',
    })

    expect(feedback).toMatchObject({
      id: expect.stringMatching(/^fb_[a-z0-9]+_[0-9a-f-]{36}$/),
      source: 'mcp',
      kind: 'bug_report',
      summary: 'Search misses a page',
      details: 'A documented page does not appear in search results.',
      stepsToReproduce: 'Search for the exact page title.',
      expectedBehavior: 'The page is returned.',
      actualBehavior: 'No matching page is returned.',
    })
  })

  it('rejects incomplete structured MCP product feedback', () => {
    expect(() =>
      normalizeFeedback({
        kind: 'feedback',
        summary: 'Search result ordering',
        details: '',
      }),
    ).toThrow(FeedbackError)
  })

  it('requires docs helpful value', () => {
    expect(() =>
      normalizeFeedback({ source: 'docs', pageUrl: 'https://tempo.xyz/developers' }),
    ).toThrow(FeedbackError)
  })
})
