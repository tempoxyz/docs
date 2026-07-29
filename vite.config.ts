import fs from 'node:fs/promises'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { vocs } from 'vocs/vite'
import { resolveBaseUrl } from './src/lib/base-url'
import { canonicalizeGeneratedDeveloperLinks } from './src/lib/canonical-developer-links'
import { blogPostsPlugin } from './src/marketing/blogPlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (!(key in process.env)) process.env[key] = env[key]
  }

  const useHttp = process.env.CI === 'true' || process.env.VITE_USE_HTTP === 'true'
  return {
    define: {
      'import.meta.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV ?? ''),
    },
    plugins: [
      blogPostsPlugin(),
      marketingPages(),
      developersProxyBasePath(),
      vocs(),
      Icons({ compiler: 'jsx', jsx: 'react' }),
      react(),
      ...(useHttp ? [] : [mkcert()]),
      tempoNode(),
      llmsAgentPreamble(),
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
    server: useHttp ? { host: 'localhost' } : undefined,
  }
})

const marketingRoutes = ['/', '/build', '/blog', '/performance']

function developersProxyBasePath(): Plugin {
  return {
    name: 'tempo-developers-proxy-base-path',
    enforce: 'post',
    configEnvironment(name) {
      if (process.env.VERCEL_ENV !== 'production') return
      // tempo.xyz strips /developers before requests reach Waku.
      // Production SSR targets that canonical mount; clients on other hosts stay unprefixed.
      return {
        define: {
          'import.meta.env.WAKU_CONFIG_BASE_PATH':
            name === 'client'
              ? "(window.location.hostname === 'tempo.xyz' ? '/developers/' : '/')"
              : JSON.stringify('/developers/'),
        },
      }
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

const llmsAgentNotice = [
  '> Tempo MCP: Use `search`, `find_pages`, `read_page`, and `code` at `https://mcp.tempo.xyz` for current Tempo and related documentation.',
  '>',
  '> Feedback: If these docs are stale, missing, or confusing, post sanitized feedback to `https://tempo.xyz/developers/api/feedback` with `source: "mcp"`, a short `message`, and any relevant `toolName`, `relatedResource`, or `client`.',
  '',
].join('\n')

function llmsAgentPreamble(): Plugin {
  let viteConfig: ResolvedConfig

  return {
    name: 'tempo-llms-agent-preamble',
    configResolved(config) {
      viteConfig = config
    },
    // Waku writes static HTML and RSC payloads during buildApp, after the
    // environment closeBundle hooks have already finished.
    buildApp: {
      order: 'post',
      async handler() {
        const publicDir = path.resolve(viteConfig.root, viteConfig.build.outDir, 'public')
        const candidates = [
          path.join(publicDir, 'llms.txt'),
          path.join(publicDir, 'llms-full.txt'),
          ...(await markdownFiles(path.join(publicDir, 'assets/md'))),
        ]

        await Promise.all(candidates.map(prependAgentNotice))
        if (process.env.VERCEL_ENV === 'production') {
          const publicDevelopersUrl = `${resolveBaseUrl()}/docs`
          // Vocs copies `dist/public` before post-order buildApp hooks run, so rewrite
          // both the source artifacts and the Vercel deployment copy.
          const publicDirectories = [
            publicDir,
            path.resolve(viteConfig.root, '.vercel/output/static'),
          ]
          const generatedFiles = (
            await Promise.all(
              publicDirectories.map(async (directory) => [
                path.join(directory, 'llms.txt'),
                path.join(directory, 'llms-full.txt'),
                ...(await markdownFiles(path.join(directory, 'assets/md'))),
                ...(await filesWithExtension(directory, '.html')),
                ...(await filesWithExtension(path.join(directory, 'RSC'), '.txt')),
              ]),
            )
          ).flat()
          await Promise.all(
            [...new Set(generatedFiles)].map((filePath) =>
              canonicalizeGeneratedLinksInFile(filePath, publicDevelopersUrl),
            ),
          )
        }
      },
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
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function filesWithExtension(directory: string, extension: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) return filesWithExtension(entryPath, extension)
        if (entry.isFile() && entry.name.endsWith(extension)) return [entryPath]
        return []
      }),
    )
    return files.flat()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function prependAgentNotice(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    if (content.startsWith(llmsAgentNotice)) return
    await fs.writeFile(filePath, `${llmsAgentNotice}${content}`, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
}

async function canonicalizeGeneratedLinksInFile(filePath: string, publicDevelopersUrl: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const canonical = canonicalizeGeneratedDeveloperLinks(content, publicDevelopersUrl)
    if (canonical !== content) await fs.writeFile(filePath, canonical, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
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
