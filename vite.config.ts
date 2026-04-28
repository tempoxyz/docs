import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { vocs } from 'vocs/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (!(key in process.env)) process.env[key] = env[key]
  }

  const useHttp = process.env.CI === 'true' || process.env.VITE_USE_HTTP === 'true'

  return {
    plugins: [syncTips(), vocs(), react(), ...(useHttp ? [] : [mkcert()]), tempoNode()],
    server: useHttp
      ? {
          host: 'localhost',
        }
      : undefined,
  }
})

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

/**
 * Escape angle brackets in prose so MDX does not interpret them as JSX.
 * Preserves content inside fenced code blocks and inline code spans.
 */
function escapeAngleBrackets(source: string): string {
  const lines = source.split('\n')
  const result: string[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock
      result.push(line)
      continue
    }
    if (inCodeBlock) {
      result.push(line)
      continue
    }
    // Split by inline code spans to avoid escaping inside them
    const parts = line.split(/(`[^`]*`)/)
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Escape < > that would be misread as JSX. Use backslash escapes
        // which MDX/micromark supports.
        parts[i] = parts[i].replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }
    }
    result.push(parts.join(''))
  }

  return result.join('\n')
}

function syncTips(): Plugin {
  const repo = 'tempoxyz/tempo'
  const outputDir = 'src/pages/protocol/tips'

  let synced = false

  async function sync() {
    if (synced) return
    synced = true

    console.log('→ syncing TIPs from GitHub...')

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/tips`)
    if (!res.ok) {
      console.error('✗ failed to fetch TIPs directory:', res.statusText)
      return
    }

    const files = (await res.json()) as Array<{ name: string; download_url: string; type: string }>
    const tipFiles = files.filter((f) => f.type === 'file' && /^tip-\d+\.md$/.test(f.name))

    await fs.mkdir(outputDir, { recursive: true })

    await Promise.all(
      tipFiles.map(async (file) => {
        let content = await fetch(file.download_url).then((r) => r.text())
        // Strip stale Solidity interface links from upstream TIPs. The linked
        // files are no longer published, so keeping the link would surface dead
        // references in the docs UI and fail Vocs' dead-link checker.
        content = content.replace(
          /^- \[[^\]]+\.sol\]\(tips\/(?:ref-impls|verify)\/src\/interfaces\/[^)]+\)\n/gm,
          '',
        )
        content = content.replace(
          /\[([^\]]+\.sol)\]\(tips\/(?:ref-impls|verify)\/src\/interfaces\/[^)]+\)/g,
          '$1',
        )
        // tip-0000 links to `./tip_template.md`, which lives in the tempo
        // repo but not in the docs site.
        content = content.replace(
          /\(\.\/tip_template\.md\)/g,
          '(https://github.com/tempoxyz/tempo/blob/main/tips/tip_template.md)',
        )
        // Escape angle brackets outside of code blocks/inline code so MDX doesn't
        // treat them as JSX (e.g. `Mapping<B256, bool>` in prose).
        content = escapeAngleBrackets(content)
        const outputPath = path.join(outputDir, file.name.replace('.md', '.mdx'))
        await fs.writeFile(outputPath, content)
      }),
    )

    console.log(`√ synced ${tipFiles.length} TIPs`)
  }

  return {
    name: 'sync-tips',
    async buildStart() {
      await sync()
    },
    async configureServer() {
      await sync()
    },
  }
}
