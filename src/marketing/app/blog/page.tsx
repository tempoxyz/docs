import Link from 'next/link'
import Footer from '../_components/Footer'
import Header from '../_components/Header'
import Reveal from '../_components/Reveal'
import FeaturedVisual from './_components/FeaturedVisual'
import PostExplorer from './_components/PostExplorer'
import { formatDate, isNew } from './_lib/categories'
import { getAllPosts, getFeaturedPost } from './_lib/posts'

export default function BlogPage() {
  const posts = getAllPosts()
  const featured = getFeaturedPost(posts)
  const postMetas = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    featured: post.featured,
  }))

  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col border-line border-x bg-surface-shell">
        <Header />

        <Reveal className="px-5 pt-10 lg:px-8">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid border border-line transition-colors hover:bg-surface-block lg:grid-cols-2"
          >
            <div className="relative h-[220px] overflow-hidden border-line border-b lg:order-2 lg:h-auto lg:min-h-[320px] lg:border-b-0 lg:border-l">
              <FeaturedVisual />
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 lg:order-1 lg:p-10">
              <h1 className="max-w-[480px] font-sans text-[clamp(1.75rem,4vw,2.5rem)] text-foreground leading-[1.15] tracking-[-0.02em] antialiased">
                {featured.title}
              </h1>
              <p className="max-w-[480px] font-sans text-[15px] text-foreground/50 leading-[1.55] tracking-[0]">
                {featured.excerpt}
              </p>
              <p className="flex flex-wrap items-center gap-3 font-mono text-[12px] text-foreground/40 uppercase tracking-[0.02em]">
                {formatDate(featured.date)}
                {isNew(featured.date) && (
                  <span className="whitespace-nowrap border border-indicator-green px-2.5 py-[3px] text-[11px] text-indicator-green">
                    New
                  </span>
                )}
              </p>
            </div>
          </Link>
        </Reveal>

        <div className="mt-16">
          <PostExplorer posts={postMetas} />
        </div>

        <div className="mt-auto pt-[140px]">
          <Footer />
        </div>
      </div>
    </main>
  )
}
