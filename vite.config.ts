import fs from 'node:fs/promises'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { vocs } from 'vocs/vite'

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
      marketingPages(),
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

const marketingRoutes = ['/', '/build', '/diagrams', '/performance']

function isMarketingPath(pathname: string) {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return marketingRoutes.includes(normalized) || normalized.startsWith('/build/')
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
  '> Feedback: If these docs are stale, missing, or confusing, post sanitized feedback to `https://docs.tempo.xyz/api/feedback` with `source: "mcp"`, a short `message`, and any relevant `toolName`, `relatedResource`, or `client`.',
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
