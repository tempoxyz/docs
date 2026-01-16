import * as fs from 'node:fs'
import * as path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { vocs } from 'vocs/vite'

function getTipsData() {
  const tipsDir = path.join(process.cwd(), 'src/pages/protocol/tips')
  if (!fs.existsSync(tipsDir)) return []

  const files = fs
    .readdirSync(tipsDir)
    .filter((file) => file.match(/^tip-\d+\.mdx$/))
    .sort((a, b) => {
      const numA = Number.parseInt(a.match(/tip-(\d+)/)?.[1] ?? '0', 10)
      const numB = Number.parseInt(b.match(/tip-(\d+)/)?.[1] ?? '0', 10)
      return numA - numB
    })

  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(tipsDir, file), 'utf-8')
      const lines = content.split('\n')

      let title = ''
      let tipId = ''
      let status = 'Draft'

      for (const line of lines) {
        const headingMatch = line.match(/^#\s+(?:TIP-\d+:\s*)?(.+)$/)
        if (headingMatch?.[1] && !title) title = headingMatch[1].trim()

        const tipIdMatch = line.match(/\*\*TIP ID\*\*:\s*(TIP-\d+)/)
        if (tipIdMatch?.[1]) tipId = tipIdMatch[1]

        const statusMatch = line.match(/\*\*Status\*\*:\s*(\w+)/)
        if (statusMatch?.[1]) status = statusMatch[1]
      }

      if (!tipId) {
        const m = file.match(/tip-(\d+)/)
        if (m) tipId = `TIP-${m[1]}`
      }

      return {
        id: tipId,
        title,
        status,
        fileName: file,
      }
    })
    .filter((t) => t.id && t.title)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'virtual-tips',
      resolveId(id) {
        if (id === 'virtual:tips-data') return '\0virtual:tips-data'
        return undefined
      },
      load(id) {
        if (id === '\0virtual:tips-data') {
          const tips = getTipsData()
          return `export const tips = ${JSON.stringify(tips)}`
        }
        return undefined
      },
    },
    vocs(),
    react(),
  ],
})
