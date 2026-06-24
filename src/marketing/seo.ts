// Shared, isomorphic SEO helpers for the marketing/blog surface. Used both by
// the Vite marketing build (Node, see vite.marketing.config.ts) and by the
// Waku static blog-post route (src/pages/blog/[slug].tsx). Keep this free of
// node-only imports so it can run in either context.

import { type CategorySlug, categoryBySlug } from './app/blog/_lib/categories'

const OG_IMAGE_VERSION = '2'

export type PostSeo = {
  slug: string
  title: string // raw post title (no " — Tempo Developers" suffix)
  excerpt: string
  date: string // YYYY-MM-DD
  category: CategorySlug
}

// Mirrors the baseUrl resolution in vocs.config.ts so canonical and OG URLs are
// absolute in production and gracefully relative on preview/local builds
// (returning '' there, just like the docs site, to avoid leaking preview URLs).
export function resolveBaseUrl(): string {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return ''
  if (URL.canParse(process.env.VITE_BASE_URL ?? '')) {
    return (process.env.VITE_BASE_URL as string).replace(/\/$/, '')
  }
  if (process.env.VERCEL_ENV === 'production') return 'https://docs.tempo.xyz'
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (productionUrl) return `https://${productionUrl}`
  return ''
}

export function absoluteUrl(base: string, pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return base ? `${base}${normalized}` : normalized
}

export function ogImageUrl(
  base: string,
  params: { title: string; description: string; section: string },
): string {
  const query = new URLSearchParams({ ...params, v: OG_IMAGE_VERSION }).toString()
  return absoluteUrl(base, `/api/og?${query}`)
}

// schema.org BlogPosting payload for a post, serialized for a
// <script type="application/ld+json"> tag. `ogImage` should already be absolute.
export function blogPostJsonLd(base: string, post: PostSeo, ogImage: string): string {
  const url = absoluteUrl(base, `/blog/${post.slug}`)
  const publisher = {
    '@type': 'Organization',
    name: 'Tempo',
    url: base || 'https://tempo.xyz',
    logo: { '@type': 'ImageObject', url: absoluteUrl(base, '/icon-dark.png') },
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: ogImage,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: categoryBySlug(post.category).label,
    author: publisher,
    publisher,
  })
}
