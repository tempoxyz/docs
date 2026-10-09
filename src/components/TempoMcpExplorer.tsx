'use client'

import * as React from 'react'
import LucideExternalLink from '~icons/lucide/external-link'
import LucidePlay from '~icons/lucide/play'
import LucideRotateCcw from '~icons/lucide/rotate-ccw'
import { Container } from './Container'
import * as ui from './TempoMcpExplorer.recipes'

const MCP_ENDPOINT = 'https://mcp.tempo.xyz'
const DEFAULT_SOURCE = 'tempo'

const TOOLS = [
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

type ToolName = (typeof TOOLS)[number]['name']

type FormState = {
  tool: ToolName
  query: string
  path: string
  url: string
  maxResults: number
  maxChars: number
}

type McpEnvelope = {
  result?: {
    content?: Array<{ type: string; text?: string }>
    structuredContent?: {
      success?: boolean
      result?: unknown
    }
  }
  error?: {
    message?: string
  }
}

type SearchChunk = {
  score?: number
  source?: string
  url?: string
  text?: string
}

type PageCandidate = {
  title?: string
  url?: string
  score?: number
}

const initialState: FormState = {
  tool: 'search',
  query: 'How do I connect an AI agent to Tempo?',
  path: '/docs/guide/using-tempo-with-ai',
  url: '',
  maxResults: 3,
  maxChars: 1600,
}

function parseSseResponse(body: string) {
  const dataLines = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter((line) => line && line !== '[DONE]')

  const last = dataLines.at(-1)
  if (!last) throw new Error('MCP server returned an empty response.')
  return JSON.parse(last) as McpEnvelope
}

function buildArguments(state: FormState) {
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
    query: state.query || undefined,
    max_chars: state.maxChars,
    response_format: 'structured',
  }
}

function requestPreview(state: FormState) {
  return JSON.stringify(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: state.tool,
        arguments: buildArguments(state),
      },
    },
    null,
    2,
  )
}

function formatScore(score: number | undefined) {
  if (typeof score !== 'number') return null
  return score >= 1 ? score.toFixed(0) : score.toFixed(3)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizePositiveIntegerInput(event: React.ChangeEvent<HTMLInputElement>) {
  const value = Math.max(1, Number.parseInt(event.target.value, 10) || 1)
  event.target.value = String(value)
  return value
}

function ResultView({ result }: { result: unknown }) {
  if (isRecord(result) && Array.isArray(result.chunks)) {
    return (
      <div {...ui.resultViewLayout()}>
        {result.chunks.map((chunk, index) => {
          const item = chunk as SearchChunk
          return (
            <article key={`${item.url ?? 'chunk'}-${index}`} {...ui.article()}>
              <div {...ui.resultViewLayout2()}>
                {item.source && <span>{item.source}</span>}
                {formatScore(item.score) && <span>score {formatScore(item.score)}</span>}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...ui.resultViewLink()}
                  >
                    Open <LucideExternalLink className={ui.lucideExternalLink().className} />
                  </a>
                )}
              </div>
              <p {...ui.resultViewDescription()}>{item.text}</p>
            </article>
          )
        })}
      </div>
    )
  }

  if (isRecord(result) && Array.isArray(result.pages)) {
    return (
      <div {...ui.resultViewLayout3()}>
        <table {...ui.table()}>
          <thead {...ui.thead()}>
            <tr>
              <th {...ui.th()}>Page</th>
              <th {...ui.th()}>Score</th>
            </tr>
          </thead>
          <tbody>
            {result.pages.map((page, index) => {
              const item = page as PageCandidate
              return (
                <tr key={`${item.url ?? 'page'}-${index}`} {...ui.tr()}>
                  <td {...ui.td()}>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...ui.resultViewLink()}
                      >
                        {item.title ?? item.url}{' '}
                        <LucideExternalLink className={ui.lucideExternalLink().className} />
                      </a>
                    ) : (
                      item.title
                    )}
                  </td>
                  <td {...ui.td2()}>{formatScore(item.score)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (isRecord(result) && typeof result.text === 'string') {
    return <pre {...ui.pre()}>{result.text}</pre>
  }

  return <pre {...ui.pre()}>{JSON.stringify(result, null, 2)}</pre>
}

export function TempoMcpExplorer() {
  const [state, setState] = React.useState<FormState>(initialState)
  const [result, setResult] = React.useState<unknown>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const preview = React.useMemo(() => requestPreview(state), [state])

  const updateState = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  const reset = () => {
    setState(initialState)
    setResult(null)
    setError(null)
  }

  const runTool = async (event?: React.FormEvent) => {
    event?.preventDefault()

    const args = buildArguments(state)
    if ('query' in args && typeof args.query === 'string' && !args.query.trim()) {
      setError('Enter a query.')
      return
    }
    if (state.tool === 'read_page' && !state.path.trim() && !state.url.trim()) {
      setError('Enter a page path or URL.')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(MCP_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/event-stream',
          'Content-Type': 'application/json',
        },
        body: preview,
      })

      const body = await response.text()
      const envelope = parseSseResponse(body)

      if (!response.ok || envelope.error) {
        throw new Error(envelope.error?.message ?? response.statusText)
      }

      setResult(envelope.result?.structuredContent?.result ?? envelope.result ?? envelope)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MCP request failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <form id="tempo-mcp-explorer" onSubmit={runTool} {...ui.form()}>
        <div {...ui.tempoMcpExplorerLayout()}>
          <label {...ui.label()}>
            <span {...ui.tempoMcpExplorerText()}>Tool</span>
            <select
              value={state.tool}
              onChange={(event) => updateState('tool', event.target.value as ToolName)}
              {...ui.select()}
            >
              {TOOLS.map((tool) => (
                <option key={tool.name} value={tool.name}>
                  {tool.label}
                </option>
              ))}
            </select>
          </label>

          <label {...ui.label()}>
            <span {...ui.tempoMcpExplorerText()}>
              {state.tool === 'read_page' ? 'Max chars' : 'Result limit'}
            </span>
            <input
              type="number"
              min={1}
              max={state.tool === 'read_page' ? 50000 : 25}
              value={state.tool === 'read_page' ? state.maxChars : state.maxResults}
              onChange={(event) => {
                const value = normalizePositiveIntegerInput(event)
                updateState(state.tool === 'read_page' ? 'maxChars' : 'maxResults', value)
              }}
              {...ui.select()}
            />
          </label>

          <div {...ui.tempoMcpExplorerLayout2()}>
            <button
              type="button"
              onClick={reset}
              {...ui.tempoMcpExplorerButton()}
              aria-label="Reset MCP explorer"
              title="Reset"
            >
              <LucideRotateCcw className={ui.lucideRotateCcw().className} />
            </button>
            <button type="submit" disabled={isLoading} {...ui.tempoMcpExplorerButton2()}>
              <LucidePlay className={ui.lucidePlay().className} />
              {isLoading ? 'Running' : 'Run'}
            </button>
          </div>
        </div>

        {state.tool !== 'read_page' && (
          <label {...ui.label2()}>
            <span {...ui.tempoMcpExplorerText()}>Query</span>
            <input
              value={state.query}
              onChange={(event) => updateState('query', event.target.value)}
              {...ui.select()}
            />
          </label>
        )}

        {state.tool === 'read_page' && (
          <div {...ui.tempoMcpExplorerLayout3()}>
            <label {...ui.label()}>
              <span {...ui.tempoMcpExplorerText()}>Path</span>
              <input
                value={state.path}
                onChange={(event) => updateState('path', event.target.value)}
                placeholder="/docs/guide/using-tempo-with-ai"
                {...ui.tempoMcpExplorerInput()}
              />
            </label>
            <label {...ui.label()}>
              <span {...ui.tempoMcpExplorerText()}>URL</span>
              <input
                value={state.url}
                onChange={(event) => updateState('url', event.target.value)}
                placeholder="https://tempo.xyz/developers/..."
                {...ui.tempoMcpExplorerInput()}
              />
            </label>
          </div>
        )}

        {state.tool === 'search' && (
          <label {...ui.label2()}>
            <span {...ui.tempoMcpExplorerText()}>Max total chars</span>
            <input
              type="number"
              min={300}
              max={50000}
              value={state.maxChars}
              onChange={(event) => updateState('maxChars', normalizePositiveIntegerInput(event))}
              {...ui.select()}
            />
          </label>
        )}

        <div {...ui.tempoMcpExplorerLayout4()}>
          <div {...ui.resultViewLayout()}>
            <div {...ui.tempoMcpExplorerLayout5()}>Request</div>
            <pre {...ui.pre2()}>{preview}</pre>
          </div>

          <div {...ui.resultViewLayout()}>
            <div {...ui.tempoMcpExplorerLayout6()}>
              <span {...ui.tempoMcpExplorerText2()}>Result</span>
            </div>
            {error && <div {...ui.tempoMcpExplorerLayout7()}>{error}</div>}
            {isLoading && <div {...ui.tempoMcpExplorerLayout8()}>Waiting for MCP response...</div>}
            {!isLoading && !error && !result && (
              <div {...ui.tempoMcpExplorerLayout8()}>
                Run a tool to see the structured MCP response.
              </div>
            )}
            {result !== null && <ResultView result={result} />}
          </div>
        </div>
      </form>
    </Container>
  )
}
