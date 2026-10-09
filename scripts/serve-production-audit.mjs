// Serve a VERCEL=1 build locally using its actual Node request handler.
// Public /developers URLs are exercised by e2e/production-mount.ts.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.VERCEL_ENV = 'production'
const { default: handler } = await import('../dist/serve-vercel.js')
const publicDirectory = path.resolve(
  fileURLToPath(new URL('../.vercel/output/static/', import.meta.url)),
)
const mimeTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
}
const port = Number(process.env.PORT ?? 5175)

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const file = path.resolve(publicDirectory, `.${pathname}`)
    const wantsMarkdown = request.headers.accept?.includes('text/markdown')
    if (!wantsMarkdown && (file === publicDirectory || file.startsWith(`${publicDirectory}/`))) {
      for (const candidate of [file, path.join(file, 'index.html')]) {
        const metadata = await stat(candidate).catch(() => null)
        if (!metadata?.isFile()) continue
        response.setHeader(
          'Content-Type',
          mimeTypes[path.extname(candidate)] ?? 'application/octet-stream',
        )
        response.setHeader('Content-Length', metadata.size)
        if (request.method === 'HEAD') response.end()
        else createReadStream(candidate).pipe(response)
        return
      }
    }
    handler(request, response)
  } catch (error) {
    console.error(error)
    response.writeHead(500).end('Production audit server error')
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Production audit server: http://127.0.0.1:${port}`)
})
