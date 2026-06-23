import { posts } from 'virtual:blog-posts'
import BlogPostRoute from '../../marketing/BlogPostRoute'

type Metadata = { title: string; description: string }

const metadataBySlug = new Map<string, Metadata>(
  posts.map((post) => [
    post.slug,
    { title: `${post.title} — Tempo Developers`, description: post.excerpt },
  ]),
)

// Statically pre-render one page per published post so each /blog/<slug> lands
// in the Vercel static output, instead of falling through to the SSR 404.
export const getConfig = () =>
  ({
    render: 'static',
    staticPaths: posts.map((post) => post.slug),
  }) as const

export default function Page({ slug }: { slug: string }) {
  const metadata = metadataBySlug.get(slug) ?? {
    title: 'Blog — Tempo Developers',
    description:
      'Engineering deep dives, network upgrades, events, and case studies from the Tempo team.',
  }

  const ogImage = `/api/og?${new URLSearchParams({
    title: metadata.title,
    description: metadata.description,
    section: 'BLOG',
  }).toString()}`

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta property="twitter:image" content={ogImage} />
      <BlogPostRoute slug={slug} metadata={metadata} />
    </>
  )
}
