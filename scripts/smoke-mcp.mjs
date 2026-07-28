const endpoint = process.env.TEMPO_MCP_SMOKE_ENDPOINT || 'https://mcp.tempo.xyz'

async function callMcp(method, params = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method,
      params,
    }),
  })

  const body = await response.text()
  if (!response.ok)
    throw new Error(`MCP ${method} returned ${response.status}: ${body.slice(0, 500)}`)

  const data = body
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter((line) => line && line !== '[DONE]')
    .at(-1)

  const message = JSON.parse(data || body)
  if (message.error) throw new Error(`MCP ${method} failed: ${JSON.stringify(message.error)}`)
  return message.result
}

function toolResult(result) {
  if (result?.structuredContent) return result.structuredContent
  const text = result?.content?.find((item) => item.type === 'text')?.text
  if (!text) throw new Error('MCP tool returned no structured or text content.')
  return JSON.parse(text)
}

await callMcp('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: {
    name: 'tempo-docs-deployed-smoke',
    version: '1.0.0',
  },
})

const tools = await callMcp('tools/list')
const toolNames = new Set(tools.tools?.map((tool) => tool.name))
for (const name of ['search', 'find_pages', 'read_page', 'code'])
  if (!toolNames.has(name)) throw new Error(`MCP tools/list is missing ${name}.`)

const search = toolResult(
  await callMcp('tools/call', {
    name: 'search',
    arguments: {
      query: 'How do I connect an AI agent to Tempo?',
      source: 'tempo',
      max_results: 5,
      response_format: 'structured',
    },
  }),
)
const page = search.result?.chunks?.find((chunk) => chunk.url)
if (!page?.url) throw new Error('MCP search returned no readable Tempo page URL.')

const read = toolResult(
  await callMcp('tools/call', {
    name: 'read_page',
    arguments: {
      source: 'tempo',
      url: page.url,
      max_chars: 2000,
      response_format: 'structured',
    },
  }),
)
const text = read.result?.text
if (!read.success || typeof text !== 'string' || text.length < 100)
  throw new Error(`MCP read_page did not return page content for ${page.url}.`)
if (/page not found/i.test(text)) throw new Error(`MCP read_page could not read ${page.url}.`)

console.log(`Validated deployed Tempo MCP search -> read_page: ${page.url}`)
