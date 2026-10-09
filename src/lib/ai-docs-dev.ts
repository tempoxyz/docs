import { readFile } from 'node:fs/promises'
import type { OutgoingHttpHeaders } from 'node:http'
import path from 'node:path'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Connect } from 'vite'
import { parseAiIndex, renderAiFull, renderAiIndex, renderAiPage } from './ai-docs'

const parser = unified().use(remarkParse)

/** Split Vocs' full export by real page headings, never by headings inside code. */
export function renderAiDevFull(content: string) {
  const sitemap = /<!--\r?\nSitemap:\r?\n([\s\S]*?)-->/.exec(content)
  if (!sitemap) throw new Error('Missing Vocs sitemap in the full Markdown export.')
  const entries = parseAiIndex(sitemap[1])
  const body = content.slice(sitemap.index + sitemap[0].length)
  const nodes = parser.parse(body).children
  const starts: number[] = []
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]
    if (node.type !== 'heading' || node.depth !== 1) continue
    let first = index
    // MDX pages often preserve old anchors immediately before their title.
    while (first > 0) {
      const previous = nodes[first - 1]
      if (
        previous.type !== 'html' ||
        !/^(?:\s*<span\s+id=["'][^"']+["']\s*(?:\/>|>\s*<\/span>))+\s*$/.test(previous.value)
      )
        break
      first--
    }
    const offset = nodes[first].position?.start.offset
    if (offset === undefined) throw new Error('Missing Markdown page offset.')
    starts.push(offset)
  }
  if (starts.length !== entries.length)
    throw new Error(
      `Vocs full export has ${starts.length} page headings for ${entries.length} entries.`,
    )
  const pages = new Map(
    entries.map((entry, index) => [
      entry.route,
      renderAiPage(
        body.slice(index === 0 ? 0 : starts[index], starts[index + 1]).trim(),
        entry.route,
      ),
    ]),
  )
  return renderAiFull(renderAiIndex(sitemap[1]), pages)
}

/** Attribute development Markdown without touching HTML, RSC, or unrelated responses. */
export function aiDocsDevMiddleware(root: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (pathname === '/SKILL.md') {
      void readFile(path.join(root, 'SKILL.md'), 'utf8').then((skill) => {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        res.end(req.method === 'HEAD' ? undefined : skill)
      }, next)
      return
    }
    if (req.method === 'HEAD') return next()
    const index = pathname === '/llms.txt'
    const full = pathname === '/llms-full.txt'
    const asset = pathname.startsWith('/assets/md/') && pathname.endsWith('.md')
    const page = /^(?:\/|\/index\.md|\/get-started(?:\.md|\/.*)?|\/docs(?:\.md|\/.*)?)$/.test(
      pathname,
    )
    if (!index && !full && !asset && !page) return next()

    const original = {
      write: res.write,
      end: res.end,
      writeHead: res.writeHead,
      flushHeaders: res.flushHeaders,
    }
    const chunks: Buffer[] = []
    const restore = () => Object.assign(res, original)
    const eligible = (contentType = res.getHeader('Content-Type'), status = res.statusCode) => {
      if (status < 200 || status >= 300 || res.getHeader('Content-Encoding')) return false
      const type = String(contentType ?? '')
        .split(';')[0]
        .trim()
        .toLowerCase()
      return type === 'text/markdown' || ((index || full) && type === 'text/plain')
    }
    const append = (chunk: unknown, encoding?: unknown) => {
      if (typeof chunk === 'string')
        chunks.push(
          Buffer.from(chunk, typeof encoding === 'string' ? (encoding as BufferEncoding) : 'utf8'),
        )
      else if (chunk instanceof Uint8Array) chunks.push(Buffer.from(chunk))
    }
    res.writeHead = ((
      status: number,
      messageOrHeaders?: string | OutgoingHttpHeaders | string[],
      headers?: OutgoingHttpHeaders | string[],
    ) => {
      const values = typeof messageOrHeaders === 'string' ? headers : messageOrHeaders
      const pairs = Array.isArray(values)
        ? Array.from(
            { length: values.length / 2 },
            (_, i) => [values[i * 2], values[i * 2 + 1]] as const,
          )
        : Object.entries(values ?? {})
      const type = pairs.find(([name]) => name.toLowerCase() === 'content-type')?.[1]
      const encoding = pairs.find(([name]) => name.toLowerCase() === 'content-encoding')?.[1]
      if (!eligible(type ?? res.getHeader('Content-Type'), status) || encoding) {
        restore()
        return Reflect.apply(original.writeHead, res, [status, messageOrHeaders, headers])
      }
      res.statusCode = status
      if (typeof messageOrHeaders === 'string') res.statusMessage = messageOrHeaders
      for (const [name, value] of pairs) if (value !== undefined) res.setHeader(name, value)
      return res
    }) as typeof res.writeHead
    res.flushHeaders = () => {
      if (!eligible()) {
        restore()
        original.flushHeaders.call(res)
      }
    }
    res.write = ((
      chunk: unknown,
      encoding?: unknown,
      callback?: (error?: Error | null) => void,
    ) => {
      if (!eligible()) {
        restore()
        return Reflect.apply(original.write, res, [chunk, encoding, callback])
      }
      append(chunk, encoding)
      const done = typeof encoding === 'function' ? encoding : callback
      if (done) queueMicrotask(() => done())
      return true
    }) as typeof res.write
    res.end = ((chunk?: unknown, encoding?: unknown, callback?: () => void) => {
      if (!eligible()) {
        restore()
        return Reflect.apply(original.end, res, [chunk, encoding, callback])
      }
      append(chunk, encoding)
      const done =
        typeof chunk === 'function' ? chunk : typeof encoding === 'function' ? encoding : callback
      restore()
      try {
        const body = Buffer.concat(chunks).toString('utf8')
        const output = full
          ? renderAiDevFull(body)
          : index || pathname === '/'
            ? renderAiIndex(body)
            : renderAiPage(body, asset ? pathname.slice('/assets/md'.length) : pathname)
        res.removeHeader('Content-Length')
        res.removeHeader('ETag')
        return original.end.call(res, output, 'utf8', done as (() => void) | undefined)
      } catch (error) {
        res.removeHeader('Content-Length')
        next(error)
        return res
      }
    }) as typeof res.end
    next()
  }
}
