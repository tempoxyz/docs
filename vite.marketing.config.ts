import fs from 'node:fs/promises'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'
import { defineConfig, type Plugin } from 'vite'

const staticRouteCopies = [
  'build',
  'build/tempo-transactions',
  'build/tip20-tokens',
  'diagrams',
  'performance',
]

function marketingRouteCopies(): Plugin {
  return {
    name: 'tempo-marketing-route-copies',
    async closeBundle() {
      const root = path.resolve(process.cwd(), 'dist/public')
      const rootHtml = path.join(root, 'index.html')
      const nestedHtml = path.join(root, 'src/marketing/index.html')
      const html = await fs.readFile(rootHtml, 'utf-8').catch(async () => {
        const nested = await fs.readFile(nestedHtml, 'utf-8')
        await fs.writeFile(rootHtml, nested)
        return nested
      })
      const marketingHtml = applyMarketingMetadata(html, '/')
      await fs.writeFile(rootHtml, marketingHtml)

      await Promise.all(
        (await marketingRouteCopiesForBuild()).map(async (route) => {
          const routeDir = path.join(root, route)
          await fs.mkdir(routeDir, { recursive: true })
          await fs.writeFile(
            path.join(routeDir, 'index.html'),
            applyMarketingMetadata(marketingHtml, route),
          )
        }),
      )
    },
  }
}

async function marketingRouteCopiesForBuild() {
  return staticRouteCopies
}

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Tempo',
    description:
      'The only blockchain designed for payments. Sub-second transactions, sub-cent fees.',
  },
  build: {
    title: 'Tempo',
    description:
      'Build payment products on Tempo with stablecoins, fast settlement, and predictable fees.',
  },
  'build/tempo-transactions': {
    title: 'Tempo Transactions',
    description: 'Batch, sponsor, schedule, and parallelize payments with Tempo Transactions.',
  },
  'build/tip20-tokens': {
    title: 'TIP-20 Tokens',
    description:
      'Stablecoin-first Tempo Tokens for payments, fees, memos, policies, and liquidity.',
  },
  performance: {
    title: 'Tempo Performance',
    description:
      'Nightly benchmarks on Tempo throughput, block times, execution rates, and uptime.',
  },
  diagrams: {
    title: 'Tempo Diagrams',
    description: 'A playground for Tempo diagrams, product visuals, and house-style SVG exports.',
  },
}

function titleCaseRoute(route: string) {
  const acronyms: Record<string, string> = { api: 'API', mpp: 'MPP', sdk: 'SDK', sdks: 'SDKs' }
  return route
    .split('/')
    .pop()
    ?.split('-')
    .filter(Boolean)
    .map((word) => acronyms[word] ?? word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
}

function marketingMetadata(route: string) {
  return (
    routeMetadata[route] ?? {
      title: `${titleCaseRoute(route)} ⋅ Tempo`,
      description: 'Build payment products on Tempo with stablecoins and predictable settlement.',
    }
  )
}

function escapeHtmlAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

function applyMarketingMetadata(html: string, route: string) {
  const metadata = marketingMetadata(route)
  const ogImage = marketingOgImage(route, metadata)
  return html
    .replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${escapeHtmlAttribute(metadata.description)}" />`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${escapeHtmlAttribute(metadata.title)}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${escapeHtmlAttribute(metadata.description)}" />`,
    )
    .replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${escapeHtmlAttribute(ogImage)}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${escapeHtmlAttribute(metadata.title)}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${escapeHtmlAttribute(metadata.description)}" />`,
    )
    .replace(
      /<meta property="twitter:image" content="[^"]*" \/>/,
      `<meta property="twitter:image" content="${escapeHtmlAttribute(ogImage)}" />`,
    )
}

function marketingOgImage(route: string, metadata: { title: string; description: string }) {
  const sections: Record<string, string> = {
    performance: 'PERFORMANCE',
    diagrams: 'DIAGRAMS',
  }
  const section = sections[route] || 'BUILD'
  return `/api/og?${new URLSearchParams({
    title: metadata.title,
    description: metadata.description,
    section,
  }).toString()}`
}

export default defineConfig({
  root: 'src/marketing',
  publicDir: path.resolve(process.cwd(), 'public'),
  plugins: [
    tailwindcss(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
    react(),
    marketingRouteCopies(),
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
  build: {
    emptyOutDir: false,
    outDir: '../../dist/public',
    rollupOptions: {
      input: 'index.html',
    },
  },
})
