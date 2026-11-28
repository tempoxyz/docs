import {
  prefersMarkdown,
  representationVary,
  searchEngineUserAgents,
  terminalUserAgents,
} from '../node_modules/vocs/dist/internal/markdown-negotiation.js'

type Assets = { fetch(request: Request): Promise<Response> }

function fetchAt(assets: Assets, url: URL, pathname: string, method: string) {
  const target = new URL(url)
  target.pathname = pathname
  return assets.fetch(new Request(target, { method }))
}

function withVary(response: Response, contentType?: string) {
  const headers = new Headers(response.headers)
  headers.append('Vary', representationVary)
  if (contentType) headers.set('Content-Type', contentType)
  return new Response(response.body, { status: response.status, headers })
}

export async function serveAsset(request: Request, assets: Assets) {
  const url = new URL(request.url)
  const { pathname } = url
  const method = request.method
  const explicitMarkdown = pathname.endsWith('.md')
  const cleanPath = !pathname.split('/').at(-1)?.includes('.')
  if (explicitMarkdown) {
    // A file explicitly published at this URL (for example, SKILL.md) wins.
    const exact = await assets.fetch(request)
    if (exact.status !== 404) return exact
    await exact.body?.cancel()
  }

  if ((explicitMarkdown || cleanPath) && !pathname.startsWith('/assets/')) {
    const accept = request.headers.get('accept') ?? ''
    const userAgent = request.headers.get('user-agent') ?? ''
    if (prefersMarkdown({ pathname, accept, userAgent })) {
      const isRootText =
        pathname === '/' &&
        !searchEngineUserAgents.some((agent) => userAgent.includes(agent)) &&
        (accept.includes('text/markdown') ||
          terminalUserAgents.some((agent) => userAgent.includes(agent)))
      const markdownPath = isRootText
        ? '/llms.txt'
        : `/assets/md${explicitMarkdown ? pathname : `${pathname.replace(/\/$/, '') || '/index'}.md`}`
      const markdown = await fetchAt(assets, url, markdownPath, method)
      if (markdown.ok) return withVary(markdown, 'text/markdown; charset=utf-8')
      await markdown.body?.cancel()
    }
  }

  if (!explicitMarkdown) {
    const response = await assets.fetch(request)
    if (response.status !== 404) return cleanPath ? withVary(response) : response
    await response.body?.cancel()
  }

  const notFound = await fetchAt(assets, url, '/404', method)
  return withVary(new Response(notFound.body, { status: 404, headers: notFound.headers }))
}
