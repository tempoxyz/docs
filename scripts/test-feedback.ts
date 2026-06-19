import assert from 'node:assert/strict'
import { normalizeFeedback, redactSecrets } from '../src/lib/feedback'

const redactionCases = [
  {
    name: 'redacts hex private keys',
    input: 'key=0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    expected: 'key=[REDACTED_PRIVATE_KEY]',
  },
  {
    name: 'redacts bearer tokens',
    input: 'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456',
    expected: 'Authorization: Bearer [REDACTED_TOKEN]',
  },
  {
    name: 'redacts named secrets',
    input: 'api_key = tempo_secret_1234567890',
    expected: 'api_key=[REDACTED_SECRET]',
  },
]

for (const testCase of redactionCases) {
  assert.equal(redactSecrets(testCase.input), testCase.expected, testCase.name)
}

const normalizedDocs = normalizeFeedback({
  helpful: false,
  category: ' Missing information ',
  message: ' Needs  more detail about token setup. ',
  pageUrl: 'https://docs.tempo.xyz/guide/payments#send',
  timestamp: '2026-06-19T12:00:00.000Z',
})

assert.equal(normalizedDocs.source, 'docs')
assert.equal(normalizedDocs.sentiment, 'negative')
assert.equal(normalizedDocs.category, 'Missing information')
assert.equal(normalizedDocs.message, 'Needs more detail about token setup.')
assert.equal(normalizedDocs.pageUrl, 'https://docs.tempo.xyz/guide/payments')
assert.equal(normalizedDocs.path, '/guide/payments')
assert.equal(normalizedDocs.timestamp, '2026-06-19T12:00:00.000Z')

const normalizedMcp = normalizeFeedback({
  source: 'mcp',
  sentiment: 'neutral',
  message: 'read_page result has stale CLI command',
  toolName: 'read_page',
  relatedResource: '/guide/using-tempo-with-ai',
  client: 'codex',
})

assert.equal(normalizedMcp.source, 'mcp')
assert.equal(normalizedMcp.sentiment, 'neutral')
assert.equal(normalizedMcp.toolName, 'read_page')
assert.equal(normalizedMcp.relatedResource, '/guide/using-tempo-with-ai')
assert.equal(normalizedMcp.client, 'codex')

assert.throws(
  () => normalizeFeedback({ source: 'mcp', toolName: 'read_page' }),
  /MCP feedback requires message or category/,
)

assert.throws(
  () => normalizeFeedback({ source: 'docs', pageUrl: 'https://docs.tempo.xyz' }),
  /Docs feedback requires helpful/,
)

console.log('feedback tests passed')
