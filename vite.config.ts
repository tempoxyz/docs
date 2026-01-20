import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import { defineConfig, type Plugin } from 'vite'
import { vocs } from 'vocs/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [syncTips(), vocs(), react(), tempoNode()],
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
        const content = await fetch(file.download_url).then((r) => r.text())
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
