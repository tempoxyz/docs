import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { parseAiIndex } from './ai-docs'
import { aiDocsDevMiddleware, renderAiDevFull } from './ai-docs-dev'

const index = '- [Earn](/docs/earn): Vaults.\n- [Deposit](/docs/earn/integrate): Deposit.\n'
const full = `# Tempo Docs

<!--
Sitemap:
${index}-->

<span id="earn" />

# Earn

First page.

\`\`\`md
# This is code, not a page
\`\`\`

<span id="deposit-funds" />

# Deposit

Second page.
`

function response() {
  const headers = new Map<string, string | number | readonly string[]>()
  const sent: Buffer[] = []
  const result = {
    statusCode: 200,
    statusMessage: '',
    headersSent: false,
    setHeader(name: string, value: string | number | readonly string[]) {
      headers.set(name.toLowerCase(), value)
      return result
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase())
    },
    removeHeader(name: string) {
      if (result.headersSent) throw new Error('Headers already sent')
      headers.delete(name.toLowerCase())
    },
    writeHead: vi.fn(
      (
        status: number,
        messageOrHeaders?: string | Record<string, string>,
        values?: Record<string, string>,
      ) => {
        result.statusCode = status
        const supplied = typeof messageOrHeaders === 'string' ? values : messageOrHeaders
        for (const [key, value] of Object.entries(supplied ?? {})) result.setHeader(key, value)
        result.headersSent = true
        return result
      },
    ),
    flushHeaders: vi.fn(() => {
      result.headersSent = true
    }),
    write: vi.fn((chunk: string | Uint8Array, encoding?: unknown, callback?: () => void) => {
      result.headersSent = true
      sent.push(Buffer.from(chunk))
      const done = typeof encoding === 'function' ? encoding : callback
      done?.()
      return true
    }),
    end: vi.fn((chunk?: string | Uint8Array, encoding?: unknown, callback?: () => void) => {
      result.headersSent = true
      if (chunk !== undefined) sent.push(Buffer.from(chunk))
      const done = typeof encoding === 'function' ? encoding : callback
      done?.()
      return result
    }),
    body: () => Buffer.concat(sent).toString('utf8'),
  }
  return result
}

function request(url: string, method = 'GET') {
  const res = response()
  const original = {
    write: res.write,
    end: res.end,
    writeHead: res.writeHead,
    flushHeaders: res.flushHeaders,
  }
  const next = vi.fn()
  aiDocsDevMiddleware(process.cwd())(
    { url, method } as IncomingMessage,
    res as unknown as ServerResponse,
    next,
  )
  return { res, next, original }
}

describe('development AI Markdown', () => {
  it('attributes every full-export page while preserving code and pre-title anchors', () => {
    const output = renderAiDevFull(full)
    expect(parseAiIndex(output)).toHaveLength(2)
    expect(output.match(/> Source:/g)).toHaveLength(2)
    expect(output).toContain('```md\n# This is code, not a page\n```')
    const second = output.indexOf('> Source: [/docs/earn/integrate]')
    expect(output.indexOf('<span id="deposit-funds" />')).toBeGreaterThan(second)
    expect(output.slice(0, second)).toContain('<span id="earn" />')
    expect(output).toContain('## APIs & SDKs')
    expect(() => renderAiDevFull(full.replace('# Deposit', '## Deposit'))).toThrow(
      'page headings for 2 entries',
    )
  })

  it.each([
    '/docs/earn.md',
    '/docs/earn',
    '/assets/md/docs/earn.md',
  ])('buffers streamed Markdown at %s', async (url) => {
    const { res, next, original } = request(url)
    res.writeHead(200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Length': '19',
      ETag: 'old',
    })
    res.flushHeaders()
    expect(res.headersSent).toBe(false)
    const done = vi.fn()
    const source = '# Earn\n\nCafé.'
    const bytes = Buffer.from(source)
    res.write(bytes.subarray(0, bytes.length - 2), done)
    res.end(bytes.subarray(bytes.length - 2))
    await Promise.resolve()
    expect(done).toHaveBeenCalledOnce()
    expect(original.flushHeaders).not.toHaveBeenCalled()
    expect(res.body()).toContain('> Section: [Earn]')
    expect(res.body()).toContain(source)
    expect(res.getHeader('Content-Length')).toBeUndefined()
    expect(res.getHeader('ETag')).toBeUndefined()
    expect(next).toHaveBeenCalledOnce()
  })

  it.each(['/llms.txt', '/'])('groups the development index at %s', (url) => {
    const { res } = request(url)
    res.setHeader('Content-Type', url === '/' ? 'text/markdown' : 'text/plain')
    res.write(index.slice(0, 20))
    res.end(index.slice(20))
    expect(res.body()).toContain('## Earn')
    expect(parseAiIndex(res.body())).toHaveLength(2)
  })

  it('adds source context to the streamed full export', () => {
    const { res } = request('/llms-full.txt')
    res.setHeader('Content-Type', 'text/plain')
    res.write(Buffer.from(full.slice(0, 100)))
    res.end(Buffer.from(full.slice(100)))
    expect(res.body()).toBe(renderAiDevFull(full))
  })

  it.each(['text/html', 'text/x-component'])('passes %s streams through unchanged', (type) => {
    const { res, original } = request('/docs/earn')
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': '12' })
    res.write('<p>Earn</p>')
    res.end('!')
    expect(res.body()).toBe('<p>Earn</p>!')
    expect(original.writeHead).toHaveBeenCalledOnce()
    expect(original.write).toHaveBeenCalledOnce()
    expect(res.getHeader('Content-Length')).toBe('12')
  })

  it('does not alter error responses or unrelated endpoints', () => {
    const error = request('/llms.txt')
    error.res.writeHead(500, { 'Content-Type': 'text/plain' })
    error.res.end('Build failed')
    expect(error.res.body()).toBe('Build failed')
    const other = request('/api/search')
    expect(other.res.end).toBe(other.original.end)
    const head = request('/docs/earn.md', 'HEAD')
    expect(head.res.end).toBe(head.original.end)
  })

  it('passes transform errors to Connect without sending an incomplete body', () => {
    const { res, next } = request('/llms-full.txt')
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Invalid full export')
    expect(next).toHaveBeenLastCalledWith(expect.any(Error))
    expect(res.body()).toBe('')
    expect(res.headersSent).toBe(false)
  })

  it('serves the source skill for GET and a bodyless HEAD', async () => {
    const get = request('/SKILL.md')
    await vi.waitFor(() => expect(get.res.body()).toContain('name: tempo-docs'))
    expect(get.res.getHeader('Content-Type')).toBe('text/markdown; charset=utf-8')
    const head = request('/SKILL.md', 'HEAD')
    await vi.waitFor(() => expect(head.res.headersSent).toBe(true))
    expect(head.res.body()).toBe('')
  })
})
