import path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { zyzz } from 'zyzz/vite'
import { graphiteRelatedDocsPlugin } from './scripts/graphite-related-docs-plugin'
import { vocsSkipLinkPlugin } from './scripts/vocs-skip-link-plugin'
import { vocsWithZyzz } from './scripts/zyzz-mdx-resources'
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
          'src/snippets/**',
          'src/test/**',
          'src/pages/_api/**',
          'src/marketing/blogPlugin.ts',
          'scripts/**',
          'e2e/**',
          'search-benchmark/**',
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
      vocsSkipLinkPlugin(),
      vocsWithZyzz(),
      Icons({ compiler: 'jsx', jsx: 'react' }),
      react(),
      ...(useHttp ? [] : [mkcert()]),
      tempoNode(),
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
