/** Pure helpers for the MCP explorer on the Build with AI page. */

export const DEFAULT_SOURCE = 'tempo'

export const TOOLS = [
  {
    name: 'search',
    label: 'Search docs',
  },
  {
    name: 'find_pages',
    label: 'Find pages',
  },
  {
    name: 'read_page',
    label: 'Read page',
  },
] as const

export type ToolName = (typeof TOOLS)[number]['name']

export type FormState = {
  tool: ToolName
  query: string
  path: string
  url: string
  maxResults: number
  maxChars: number
}

export type McpEnvelope = {
  result?: {
    content?: Array<{ type: string; text?: string }>
    isError?: boolean
    structuredContent?: {
      success?: boolean
      result?: unknown
    }
  }
  error?: {
    message?: string
  }
}

/**
 * Read the last JSON-RPC message from a streamable HTTP response. SSE events
 * may split one message across several `data:` lines; plain JSON has none.
 */
export function parseMcpResponse(body: string, status: number) {
  const events = body
    .split(/\r?\n\r?\n/)
    .map((event) =>
      event
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).replace(/^ /, ''))
        .join('\n'),
    )
    .filter((data) => data.trim() && data.trim() !== '[DONE]')
  const payload = events.at(-1) ?? body.trim()
  if (!payload) throw new Error(`MCP server returned an empty response (HTTP ${status}).`)
  try {
    return JSON.parse(payload) as McpEnvelope
  } catch {
    throw new Error(`MCP server returned an unexpected response (HTTP ${status}).`)
  }
}

export function toolErrorMessage(result: NonNullable<McpEnvelope['result']>) {
  const text = result.content?.find((item) => item.type === 'text')?.text ?? ''
  try {
    const parsed = JSON.parse(text) as { error?: unknown }
    if (typeof parsed.error === 'string') return parsed.error
  } catch {
    // Fall back to the raw text.
  }
  return text || 'The MCP tool call failed.'
}

export function buildArguments(state: FormState) {
  if (state.tool === 'search') {
    return {
      query: state.query,
      max_results: state.maxResults,
      max_total_chars: state.maxChars,
      response_format: 'structured',
    }
  }

  if (state.tool === 'find_pages') {
    return {
      source: DEFAULT_SOURCE,
      query: state.query,
      max_results: state.maxResults,
      response_format: 'structured',
    }
  }

  return {
    source: DEFAULT_SOURCE,
    path: state.path || undefined,
    url: state.url || undefined,
    max_chars: state.maxChars,
    response_format: 'structured',
  }
}
