import { posts } from 'virtual:blog-posts'
import { type CategorySlug, categoryBySlug } from '../../marketing/app/blog/_lib/categories'
import BlogPostRoute from '../../marketing/BlogPostRoute'
import {
  absoluteUrl,
  blogPostJsonLd,
  ogImageUrl,
  type PostSeo,
  resolveBaseUrl,
} from '../../marketing/seo'

const BLOG_TITLE = 'Blog'
const BLOG_DESCRIPTION =
  'Engineering deep dives, network upgrades, events, and case studies from the Tempo team.'

const postBySlug = new Map<string, PostSeo>(
  posts.map((post) => [
    post.slug,
    {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      category: post.category as CategorySlug,
    },
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
  const base = resolveBaseUrl()
  const post = postBySlug.get(slug)

  const title = post ? post.title : BLOG_TITLE
  const description = post?.excerpt ?? BLOG_DESCRIPTION
  const canonical = absoluteUrl(base, post ? `/blog/${slug}` : '/blog')
  const ogImage = ogImageUrl(base, { title, description, section: 'BLOG' })

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {base ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:type" content={post ? 'article' : 'website'} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      {post ? <meta property="article:published_time" content={post.date} /> : null}
      {post ? (
        <meta property="article:section" content={categoryBySlug(post.category).label} />
      ) : null}
      {post ? (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time, trusted JSON-LD
          dangerouslySetInnerHTML={{ __html: blogPostJsonLd(base, post, ogImage) }}
        />
      ) : null}
      <BlogPostRoute slug={slug} metadata={{ title, description }} />
    </>
  )
}
