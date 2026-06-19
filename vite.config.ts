import fs from 'node:fs/promises'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { vocs } from 'vocs/vite'
import { moderatoZoneRpcUrls } from './src/lib/private-zones.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (!(key in process.env)) process.env[key] = env[key]
  }

  const isE2E = process.env.VITE_E2E === 'true' || env.VITE_E2E === 'true'
  const useHttp = process.env.CI === 'true' || process.env.VITE_USE_HTTP === 'true'
  const e2eZoneProxy = isE2E ? getE2EZoneProxy() : undefined
  const proxy = {
    '/api/mcp': {
      changeOrigin: true,
      rewrite: () => '/',
      secure: true,
      target: 'https://mcp.tempo.xyz',
    },
    ...e2eZoneProxy,
  }

  return {
    plugins: [vocs(), react(), ...(useHttp ? [] : [mkcert()]), tempoNode(), llmsFeedbackPreamble()],
    server: {
      ...(useHttp ? { host: 'localhost' } : {}),
      proxy,
    },
  }
})

function getE2EZoneProxy() {
  return Object.fromEntries(
    Object.entries(moderatoZoneRpcUrls).map(([zoneId, rpcUrl]) => {
      const parsedUrl = new URL(rpcUrl)
      const authorization = `Basic ${Buffer.from(
        `${decodeURIComponent(parsedUrl.username)}:${decodeURIComponent(parsedUrl.password)}`,
      ).toString('base64')}`
      parsedUrl.username = ''
      parsedUrl.password = ''

      return [
        `/__e2e_zone_rpc/${zoneId}`,
        {
          changeOrigin: true,
          headers: { authorization },
          rewrite: () => '/',
          secure: true,
          target: parsedUrl.toString(),
        },
      ]
    }),
  )
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
