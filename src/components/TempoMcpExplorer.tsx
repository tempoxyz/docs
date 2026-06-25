'use client'

import * as React from 'react'
import LucideExternalLink from '~icons/lucide/external-link'
import LucidePlay from '~icons/lucide/play'
import LucideRotateCcw from '~icons/lucide/rotate-ccw'
import { Container } from './Container'

const MCP_ENDPOINT = '/api/mcp'
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
  path: '/guide/using-tempo-with-ai',
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
      <div className="space-y-3">
        {result.chunks.map((chunk, index) => {
          const item = chunk as SearchChunk
          return (
            <article
              key={`${item.url ?? 'chunk'}-${index}`}
              className="rounded-md border border-gray5 p-3"
            >
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray10">
                {item.source && <span>{item.source}</span>}
                {formatScore(item.score) && <span>score {formatScore(item.score)}</span>}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Open <LucideExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="line-clamp-6 whitespace-pre-wrap text-[13px] text-gray12 leading-5">
                {item.text}
              </p>
            </article>
          )
        })}
      </div>
    )
  }

  if (isRecord(result) && Array.isArray(result.pages)) {
    return (
      <div className="overflow-x-auto rounded-md border border-gray6">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray2 text-gray11">
            <tr>
              <th className="px-3 py-3 font-medium">Page</th>
              <th className="px-3 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {result.pages.map((page, index) => {
              const item = page as PageCandidate
              return (
                <tr key={`${item.url ?? 'page'}-${index}`} className="border-gray5 border-t">
                  <td className="px-3 py-2">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        {item.title ?? item.url} <LucideExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      item.title
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-gray11">{formatScore(item.score)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (isRecord(result) && typeof result.text === 'string') {
    return (
      <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-md border border-gray6 bg-gray2 p-3 text-[13px] text-gray12 leading-5">
        {result.text}
      </pre>
    )
  }

  return (
    <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-md border border-gray6 bg-gray2 p-3 text-[13px] text-gray12 leading-5">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
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
      <form id="tempo-mcp-explorer" onSubmit={runTool} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="space-y-2 text-sm">
            <span className="mb-2 block text-gray11">Tool</span>
            <select
              value={state.tool}
              onChange={(event) => updateState('tool', event.target.value as ToolName)}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            >
              {TOOLS.map((tool) => (
                <option key={tool.name} value={tool.name}>
                  {tool.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="mb-2 block text-gray11">
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
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            />
          </label>

          <div className="flex items-end justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray6 text-gray10 hover:bg-gray3 hover:text-gray12"
              aria-label="Reset MCP explorer"
              title="Reset"
            >
              <LucideRotateCcw className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LucidePlay className="h-3.5 w-3.5" />
              {isLoading ? 'Running' : 'Run'}
            </button>
          </div>
        </div>

        {state.tool !== 'read_page' && (
          <label className="block space-y-2 text-sm">
            <span className="mb-2 block text-gray11">Query</span>
            <input
              value={state.query}
              onChange={(event) => updateState('query', event.target.value)}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            />
          </label>
        )}

        {state.tool === 'read_page' && (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="mb-2 block text-gray11">Path</span>
              <input
                value={state.path}
                onChange={(event) => updateState('path', event.target.value)}
                placeholder="/guide/using-tempo-with-ai"
                className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 font-mono text-gray12"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="mb-2 block text-gray11">URL</span>
              <input
                value={state.url}
                onChange={(event) => updateState('url', event.target.value)}
                placeholder="https://docs.tempo.xyz/..."
                className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 font-mono text-gray12"
              />
            </label>
          </div>
        )}

        {state.tool === 'search' && (
          <label className="block space-y-2 text-sm">
            <span className="mb-2 block text-gray11">Max total chars</span>
            <input
              type="number"
              min={300}
              max={50000}
              value={state.maxChars}
              onChange={(event) => updateState('maxChars', normalizePositiveIntegerInput(event))}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            />
          </label>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="space-y-3">
            <div className="px-1 pb-1 text-gray11 text-sm">Request</div>
            <pre className="max-h-[360px] overflow-auto rounded-md border border-gray6 bg-gray2 p-3 text-[12px] text-gray12 leading-5">
              {preview}
            </pre>
          </div>

          <div className="space-y-3">
            <div className="flex min-h-5 items-center justify-between gap-3 px-1 pb-1 text-sm">
              <span className="text-gray11">Result</span>
            </div>
            {error && (
              <div className="rounded-md border border-red6 bg-red2 px-3 py-2 text-red11 text-sm">
                {error}
              </div>
            )}
            {isLoading && (
              <div className="rounded-md border border-gray6 bg-gray2 px-3 py-2 text-gray11 text-sm">
                Waiting for MCP response...
              </div>
            )}
            {!isLoading && !error && !result && (
              <div className="rounded-md border border-gray6 bg-gray2 px-3 py-2 text-gray11 text-sm">
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
