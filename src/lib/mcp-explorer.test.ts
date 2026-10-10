import { describe, expect, it } from 'vitest'
import { buildArguments, type FormState, parseMcpResponse, toolErrorMessage } from './mcp-explorer'

const state: FormState = {
  tool: 'read_page',
  query: 'How do I connect an AI agent to Tempo?',
  path: '/docs/guide/using-tempo-with-ai',
  url: '',
  maxResults: 3,
  maxChars: 1600,
}

describe('buildArguments', () => {
  it('does not send the hidden query field with read_page', () => {
    expect(buildArguments(state)).toEqual({
      source: 'tempo',
      path: '/docs/guide/using-tempo-with-ai',
      url: undefined,
      max_chars: 1600,
      response_format: 'structured',
    })
  })
})

describe('parseMcpResponse', () => {
  it('reads the last SSE event', () => {
    const body = [
      'event: message',
      'data: {"jsonrpc":"2.0","method":"notifications/progress"}',
      '',
      'event: message',
      'data: {"jsonrpc":"2.0","id":1,"result":{}}',
      '',
      '',
    ].join('\n')

    expect(parseMcpResponse(body, 200)).toEqual({ jsonrpc: '2.0', id: 1, result: {} })
  })

  it('joins an SSE message split across data lines', () => {
    const body = 'event: message\r\ndata: {"jsonrpc":"2.0",\r\ndata: "id":1,"result":{}}\r\n\r\n'

    expect(parseMcpResponse(body, 200)).toEqual({ jsonrpc: '2.0', id: 1, result: {} })
  })

  it('reads plain JSON responses', () => {
    expect(
      parseMcpResponse('{"jsonrpc":"2.0","id":null,"error":{"code":-32600,"message":"Bad"}}', 400),
    ).toEqual({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Bad' } })
  })

  it.each([
    ['', 'MCP server returned an empty response (HTTP 502).'],
    ['<html>Bad gateway</html>', 'MCP server returned an unexpected response (HTTP 502).'],
  ])('reports unreadable body %j', (body, message) => {
    expect(() => parseMcpResponse(body, 502)).toThrow(message)
  })
})

describe('toolErrorMessage', () => {
  it('unwraps the docs tool error text', () => {
    expect(
      toolErrorMessage({
        isError: true,
        content: [{ type: 'text', text: '{"success":false,"error":"unknown source: nope"}' }],
      }),
    ).toBe('unknown source: nope')
  })

  it('falls back to raw text', () => {
    expect(toolErrorMessage({ isError: true, content: [{ type: 'text', text: 'boom' }] })).toBe(
      'boom',
    )
  })
})
