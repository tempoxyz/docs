import fs from 'node:fs/promises'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { vocs } from 'vocs/vite'
import { blogPostsPlugin } from './src/marketing/blogPlugin'
import { marketingSearchIndexPlugin } from './src/marketing/searchIndexPlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (!(key in process.env)) process.env[key] = env[key]
  }

  const useHttp = process.env.CI === 'true' || process.env.VITE_USE_HTTP === 'true'
  const proxy = {
    '/api/mcp': {
      changeOrigin: true,
      rewrite: () => '/',
      secure: true,
      target: 'https://mcp.tempo.xyz',
    },
  }

  return {
    plugins: [
      blogPostsPlugin(),
      marketingSearchIndexPlugin({ source: 'vocs' }),
      marketingPages(),
      developersProxyRouteNormalization(),
      vocs(),
      Icons({ compiler: 'jsx', jsx: 'react' }),
      react(),
      ...(useHttp ? [] : [mkcert()]),
      tempoNode(),
      llmsFeedbackPreamble(),
    ],
    resolve: {
      alias: [
        {
          find: 'next/image',
          replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx'),
        },
        {
          find: 'next/link',
          replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx'),
        },
        {
          find: 'next/navigation',
          replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx'),
        },
        { find: 'next', replacement: path.resolve(process.cwd(), 'src/marketing/next-shims.tsx') },
      ],
    },
    server: {
      ...(useHttp ? { host: 'localhost' } : {}),
      proxy,
    },
  }
})

const marketingRoutes = ['/', '/build', '/blog', '/performance']

function developersProxyRouteNormalization(): Plugin {
  return {
    name: 'tempo-developers-proxy-route-normalization',
    enforce: 'post',
    transform(code, id) {
      if (id !== '\0virtual:vite-rsc-waku/client-entry') return

      return code
        .replace(
          "import { Router } from 'waku/router/client';",
          "import { Router, unstable_parseRoute } from 'waku/router/client';",
        )
        .replace(
          'const rootElement = createElement(StrictMode, null, createElement(Router));',
          `const developersPrefix = '/developers';
const shouldUseDevelopersPrefix = () => window.location.pathname === developersPrefix || window.location.pathname.startsWith(developersPrefix + '/');
const publicDevelopersPath = (path) => {
  if (path === '/') return developersPrefix;
  if (path.startsWith(developersPrefix + '/')) return path;
  return developersPrefix + path;
};
const normalizeDevelopersRoute = (route) => {
  if (route.path === '/developers') return { ...route, path: '/' };
  if (route.path.startsWith('/developers/')) {
    return { ...route, path: route.path.slice('/developers'.length) || '/' };
  }
  return route;
};
const getUnprefixedInternalLink = (event) => {
  if (!shouldUseDevelopersPrefix()) return;
  const link = event.target instanceof Element ? event.target.closest('a[href^="/"]') : null;
  if (!(link instanceof HTMLAnchorElement)) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('//') || href.startsWith(developersPrefix + '/')) return;
  if (href.startsWith('/assets/') || href.startsWith('/fonts/') || href.startsWith('/RSC/')) return;
  return { link, href };
};
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  if (!shouldUseDevelopersPrefix()) return response;
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  if (!requestUrl.includes('/RSC/')) return response;
  const clone = response.clone();
  const contentType = clone.headers.get('content-type') || '';
  if (!contentType.includes('text/plain')) return response;
  const text = await clone.text();
  const normalized = text
    .replaceAll('route:/developers/', 'route:/')
    .replaceAll('route:/developers"', 'route:/"')
    .replaceAll('route:/developers,', 'route:/,')
    .replaceAll('route:/developers\\n', 'route:/\\n');
  if (normalized === text) return response;
  return new Response(normalized, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};
document.addEventListener(
  'click',
  (event) => {
    const target = getUnprefixedInternalLink(event);
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(publicDevelopersPath(target.href));
  },
  true,
);
for (const eventName of ['pointerover', 'mouseover']) {
  document.addEventListener(
    eventName,
    (event) => {
      if (!getUnprefixedInternalLink(event)) return;
      event.stopImmediatePropagation();
    },
    true,
  );
}

const initialRoute = normalizeDevelopersRoute(unstable_parseRoute(new URL(window.location.href)));
const rootElement = createElement(
  StrictMode,
  null,
  createElement(Router, {
    initialRoute,
    unstable_routeInterceptor: normalizeDevelopersRoute,
  }),
);`,
        )
    },
  }
}

function isMarketingPath(pathname: string) {
  const normalized = pathname.replace(/\/$/, '') || '/'
  // Let requests for actual files (e.g. /blog/foo.svg) fall through to Vite's
  // static asset serving instead of returning the marketing SPA shell.
  const lastSegment = normalized.split('/').pop() ?? ''
  if (lastSegment.includes('.')) return false
  return (
    marketingRoutes.includes(normalized) ||
    normalized.startsWith('/build/') ||
    normalized.startsWith('/blog/')
  )
}

async function marketingHtml() {
  const html = await fs.readFile(path.resolve(process.cwd(), 'src/marketing/index.html'), 'utf-8')
  return html.replace('src="./main.tsx"', 'src="/src/marketing/main.tsx"')
}

function marketingPages(): Plugin {
  return {
    name: 'tempo-marketing-pages',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next()
        const url = new URL(req.url, 'http://localhost')
        if (!isMarketingPath(url.pathname)) return next()

        const html = await server.transformIndexHtml(url.pathname, await marketingHtml())
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        res.end(html)
      })
    },
  }
}

const llmsFeedbackNotice = [
  '> Feedback: If these docs are stale, missing, or confusing, post sanitized feedback to `https://tempo.xyz/developers/api/feedback` with `source: "mcp"`, a short `message`, and any relevant `toolName`, `relatedResource`, or `client`.',
  '',
].join('\n')

function llmsFeedbackPreamble(): Plugin {
  let viteConfig: ResolvedConfig

  return {
    name: 'tempo-llms-feedback-preamble',
    configResolved(config) {
      viteConfig = config
    },
    async closeBundle() {
      const publicDir = path.resolve(viteConfig.root, viteConfig.build.outDir, 'public')
      const candidates = [
        path.join(publicDir, 'llms.txt'),
        path.join(publicDir, 'llms-full.txt'),
        ...(await markdownFiles(path.join(publicDir, 'assets/md'))),
      ]

      await Promise.all(candidates.map(prependFeedbackNotice))
      await removeTemplateRoutesFromSitemap(path.join(publicDir, 'sitemap.xml'))
    },
  }
}

async function markdownFiles(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) return markdownFiles(entryPath)
        if (entry.isFile() && entry.name.endsWith('.md')) return [entryPath]
        return []
      }),
    )
    return files.flat()
  } catch {
    return []
  }
}

async function prependFeedbackNotice(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    if (content.startsWith(llmsFeedbackNotice)) return
    await fs.writeFile(filePath, `${llmsFeedbackNotice}${content}`, 'utf-8')
  } catch {
    return
  }
}

async function removeTemplateRoutesFromSitemap(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const filtered = content.replaceAll(
      /<url>\s*<loc>[^<]*\/\[[^\]]+\][^<]*<\/loc>[\s\S]*?<\/url>\s*/g,
      '',
    )
    if (filtered !== content) await fs.writeFile(filePath, filtered, 'utf-8')
  } catch {
    return
  }
}

function tempoNode(): Plugin {
  return {
    name: 'tempo-node',
    async configureServer(_server) {
      if (!('VITE_TEMPO_ENV' in process.env) || process.env.VITE_TEMPO_ENV !== 'localnet') return
      const instance = Instance.tempo({
        dev: { blockTime: '500ms' },
        port: 8545,
      })
      console.log('→ starting tempo node...')
      await instance.start()
      console.log('√ tempo node started on port 8545')
    },
  }
}
