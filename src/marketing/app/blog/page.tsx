import Link from 'next/link'
import Footer from '../_components/Footer'
import Header from '../_components/Header'
import Reveal from '../_components/Reveal'
import { developersPath } from '../_lib/developersPaths'
import PostByline from './_components/PostByline'
import PostExplorer from './_components/PostExplorer'
import PostImage from './_components/PostImage'
import PostLabels from './_components/PostLabels'
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
    categories: post.categories,
    authors: post.authors,
    ogImage: post.ogImage,
    featured: post.featured,
  }))

  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col border-line border-x bg-surface-shell">
        <Header />

        <Reveal className="px-5 pt-8 lg:px-8 lg:pt-10">
          <Link
            href={developersPath(`/blog/${featured.slug}`)}
            className="group grid border border-line transition-colors hover:bg-surface-block focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-4 lg:grid-cols-2"
          >
            <div className="flex items-center overflow-hidden border-line border-b bg-surface-block lg:order-2 lg:border-b-0 lg:border-l">
              <PostImage post={featured} priority />
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 lg:order-1 lg:p-10">
              <PostLabels post={featured} />
              <h1 className="max-w-[480px] font-sans text-[clamp(1.75rem,4vw,2.5rem)] text-foreground leading-[1.15] tracking-[-0.02em] antialiased">
                {featured.title}
              </h1>
              <p className="max-w-[480px] font-sans text-[15px] text-foreground/60 leading-[1.55] tracking-[0]">
                {featured.excerpt}
              </p>
              <PostByline post={featured} />
            </div>
          </Link>
        </Reveal>

        <div className="mt-10 lg:mt-16">
          <PostExplorer posts={postMetas} />
        </div>

        <div className="mt-auto pt-[140px]">
          <Footer />
        </div>
      </div>
    </main>
  )
}
