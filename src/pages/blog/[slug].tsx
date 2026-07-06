import { posts } from 'virtual:blog-posts'
import { type CategorySlug, categoryBySlug } from '../../marketing/app/blog/_lib/categories'
import BlogPostRoute from '../../marketing/BlogPostRoute'
import { routeMetadata } from '../../marketing/routeMetadata'
import { blogPostJsonLd, ogImageUrl, type PostSeo, resolveBaseUrl } from '../../marketing/seo'

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

  const title = post ? post.title : routeMetadata['/blog'].title
  const description = post?.excerpt ?? routeMetadata['/blog'].description

  return (
    <BlogPostRoute
      slug={slug}
      metadata={{ title, description }}
      head={
        post ? (
          <>
            <meta property="og:type" content="article" />
            <meta property="article:published_time" content={post.date} />
            <meta property="article:section" content={categoryBySlug(post.category).label} />
            <script
              type="application/ld+json"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time, trusted JSON-LD
              dangerouslySetInnerHTML={{
                __html: blogPostJsonLd(
                  base,
                  post,
                  ogImageUrl(base, { title: post.title, section: 'BLOG' }),
                ),
              }}
            />
          </>
        ) : undefined
      }
    />
  )
}
