import fs from 'node:fs/promises'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'
import { defineConfig, type Plugin } from 'vite'
import { type CategorySlug, categoryBySlug } from './src/marketing/app/blog/_lib/categories'
import { blogPostsPlugin, loadRenderedPosts } from './src/marketing/blogPlugin'
import { marketingSearchIndexPlugin } from './src/marketing/searchIndexPlugin'
import {
  absoluteUrl,
  blogPostJsonLd,
  ogImageUrl,
  type PostSeo,
  resolveBaseUrl,
} from './src/marketing/seo'

const siteBaseUrl = resolveBaseUrl()

const staticRouteCopies = [
  'build',
  'build/tempo-transactions',
  'build/tip20-tokens',
  'blog',
  'performance',
]

// Per-post metadata for the blog post routes, populated from the rendered
// markdown so each static copy gets the right title/description/OG.
const blogRouteMetadata = new Map<string, { title: string; description: string }>()
// Raw post data per blog route (keyed `blog/<slug>`), used to emit article
// OpenGraph tags and JSON-LD structured data for each post.
const blogPostByRoute = new Map<string, PostSeo>()

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
      await fs.writeFile(rootHtml, applyMarketingMetadata(html, '/'))

      // Each route copy is derived from the raw template (not the processed
      // homepage HTML) so the injected canonical/og:url/article tags — which
      // have no placeholder to overwrite — don't accumulate across routes.
      await Promise.all(
        (await marketingRouteCopiesForBuild()).map(async (route) => {
          const routeDir = path.join(root, route)
          await fs.mkdir(routeDir, { recursive: true })
          await fs.writeFile(path.join(routeDir, 'index.html'), applyMarketingMetadata(html, route))
        }),
      )
    },
  }
}

async function marketingRouteCopiesForBuild() {
  const posts = await loadRenderedPosts()
  blogRouteMetadata.clear()
  blogPostByRoute.clear()
  for (const post of posts) {
    blogRouteMetadata.set(`blog/${post.slug}`, {
      title: post.title,
      description: post.excerpt,
    })
    blogPostByRoute.set(`blog/${post.slug}`, {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      category: post.category as CategorySlug,
    })
  }
  return [...staticRouteCopies, ...posts.map((post) => `blog/${post.slug}`)]
}

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Tempo',
    description:
      'The only blockchain designed for payments. Sub-second transactions, sub-cent fees.',
  },
  build: {
    title: 'Build on Tempo',
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
    title: 'Performance',
    description:
      'Nightly benchmarks on Tempo throughput, block times, execution rates, and uptime.',
  },
  blog: {
    title: 'Blog',
    description:
      'Engineering deep dives, network upgrades, events, and case studies from the Tempo team.',
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
    blogRouteMetadata.get(route) ??
    routeMetadata[route] ?? {
      title: `${titleCaseRoute(route)} ⋅ Tempo`,
      description: 'Build payment products on Tempo with stablecoins and predictable settlement.',
    }
  )
}

function escapeHtmlAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

function canonicalPath(route: string) {
  return route === '/' ? '/' : `/${route}`
}

// Extra <head> tags that have no placeholder in index.html: canonical, og:url,
// and (for blog posts) the article OpenGraph tags plus JSON-LD structured data.
function marketingHeadExtras(route: string, ogImage: string) {
  const canonical = absoluteUrl(siteBaseUrl, canonicalPath(route))
  const tags: string[] = [`<meta property="og:url" content="${escapeHtmlAttribute(canonical)}" />`]
  if (siteBaseUrl) {
    tags.push(`<link rel="canonical" href="${escapeHtmlAttribute(canonical)}" />`)
  }

  const post = blogPostByRoute.get(route)
  if (post) {
    tags.push(
      `<meta property="article:published_time" content="${escapeHtmlAttribute(post.date)}" />`,
      `<meta property="article:section" content="${escapeHtmlAttribute(
        categoryBySlug(post.category).label,
      )}" />`,
      `<script type="application/ld+json">${blogPostJsonLd(siteBaseUrl, post, ogImage)}</script>`,
    )
  }
  return tags.join('\n    ')
}

function applyMarketingMetadata(html: string, route: string) {
  const metadata = marketingMetadata(route)
  const ogImage = marketingOgImage(route, metadata)
  const isPost = blogPostByRoute.has(route)
  return html
    .replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`)
    .replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:type" content="${isPost ? 'article' : 'website'}" />`,
    )
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
    .replace('</head>', `  ${marketingHeadExtras(route, ogImage)}\n  </head>`)
}

function marketingOgImage(route: string, metadata: { title: string; description: string }) {
  const sections: Record<string, string> = {
    performance: 'PERFORMANCE',
    blog: 'BLOG',
  }
  const section = route.startsWith('blog/') ? 'BLOG' : sections[route] || 'BUILD'
  return ogImageUrl(siteBaseUrl, {
    title: metadata.title,
    description: metadata.description,
    section,
  })
}

export default defineConfig({
  root: 'src/marketing',
  publicDir: path.resolve(process.cwd(), 'public'),
  plugins: [
    blogPostsPlugin(),
    marketingSearchIndexPlugin({ source: 'dist' }),
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
