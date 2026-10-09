import fs from 'node:fs/promises'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { zyzz } from 'zyzz/vite'
import { graphiteRelatedDocsPlugin } from './scripts/graphite-related-docs-plugin'
import { vocsWithZyzz } from './scripts/zyzz-mdx-resources'
import { markdownRoute, renderAiFull, renderAiIndex, renderAiPage } from './src/lib/ai-docs'
import { aiDocsDevMiddleware } from './src/lib/ai-docs-dev'
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
    // Gzip-size reporting compresses every output just for the build log.
    build: { reportCompressedSize: !process.env.CI },
    define: {
      'import.meta.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV ?? ''),
    },
    plugins: [
      // Example regions are not complete modules. Keep server tooling out of
      // the client discovery graph; Vocs owns the persisted color scheme.
      zyzz({
        exclude: [
          'src/snippets',
          'src/test',
          'src/pages/_api',
          'src/marketing/blogPlugin.ts',
          'scripts',
          'e2e',
          'search-benchmark',
          'playwright.config.ts',
          'playwright.zones.config.ts',
          'playwright.production.config.ts',
          'vocs.config.ts',
        ],
        script: false,
      }),
      blogPostsPlugin(),
      developersProxyBasePath(),
      graphiteRelatedDocsPlugin(),
      vocsWithZyzz(),
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

function developersProxyBasePath(): Plugin {
  return {
    name: 'tempo-developers-proxy-base-path',
    enforce: 'post',
    configureServer(server) {
      // Production mounts public learning assets and token icons under /developers.
      server.middlewares.use((req, _res, next) => {
        if (
          req.url?.startsWith('/developers/learn/') ||
          req.url?.startsWith('/developers/icons/')
        ) {
          req.url = req.url.slice('/developers'.length)
        }
        next()
      })
    },
    configEnvironment(name) {
      if (process.env.VERCEL_ENV !== 'production') return
      // tempo.xyz strips /developers before requests reach Waku.
      // Vercel serves at root. Only the browser on tempo.xyz uses the external mount.
      return {
        define: {
          'import.meta.env.WAKU_CONFIG_BASE_PATH':
            name === 'client'
              ? "(window.location.hostname === 'tempo.xyz' ? '/developers/' : '/')"
              : JSON.stringify('/'),
        },
      }
    },
  }
}

function llmsAgentPreamble(): Plugin {
  let viteConfig: ResolvedConfig

  return {
    name: 'tempo-ai-docs',
    enforce: 'pre',
    configResolved(config) {
      viteConfig = config
    },
    configureServer(server) {
      server.middlewares.use(aiDocsDevMiddleware(server.config.root))
    },
    // Waku writes static HTML and RSC payloads during buildApp, after the
    // environment closeBundle hooks have already finished.
    buildApp: {
      order: 'post',
      async handler() {
        const publicDir = path.resolve(viteConfig.root, viteConfig.build.outDir, 'public')
        // Vocs copies static output before this hook. Update both artifacts,
        // including preview deployments, rather than only the source directory.
        const publicDirectories = [
          publicDir,
          ...(process.env.VERCEL ? [path.resolve(viteConfig.root, '.vercel/output/static')] : []),
        ]
        for (const directory of publicDirectories)
          await writeAiDocumentation(directory, viteConfig.root)
        if (process.env.VERCEL_ENV === 'production') {
          const publicDevelopersUrl = `${resolveBaseUrl()}/docs`
          const generatedFiles = (
            await Promise.all(
              publicDirectories.map((directory) =>
                generatedContentFiles(directory, ['.md', '.html', '.txt']),
              ),
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

async function generatedContentFiles(directory: string, extensions = ['.md']): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) return generatedContentFiles(entryPath, extensions)
        if (entry.isFile() && extensions.includes(path.extname(entry.name))) return [entryPath]
        return []
      }),
    )
    return files.flat()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function writeAiDocumentation(directory: string, root: string) {
  let rawIndex: string
  try {
    rawIndex = await fs.readFile(path.join(directory, 'llms.txt'), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  const markdownDir = path.join(directory, 'assets/md')
  const pages = new Map<string, string>()
  await Promise.all(
    (await generatedContentFiles(markdownDir)).map(async (file) => {
      const route = markdownRoute(`/${path.relative(markdownDir, file)}`)
      const content = renderAiPage(await fs.readFile(file, 'utf8'), route)
      pages.set(route, content)
      await fs.writeFile(file, content, 'utf8')
    }),
  )
  const index = renderAiIndex(rawIndex)
  await Promise.all([
    fs.writeFile(path.join(directory, 'llms.txt'), index, 'utf8'),
    fs.writeFile(path.join(directory, 'llms-full.txt'), renderAiFull(index, pages), 'utf8'),
    fs.copyFile(path.join(root, 'SKILL.md'), path.join(directory, 'SKILL.md')),
  ])
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
