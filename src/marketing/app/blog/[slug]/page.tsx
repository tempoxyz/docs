import Link from 'next/link'
import Footer from '../../_components/Footer'
import Header from '../../_components/Header'
import Reveal from '../../_components/Reveal'
import { developersPath } from '../../_lib/developersPaths'
import { categoryBySlug, formatDate, isNew } from '../_lib/categories'
import { getPost } from '../_lib/posts'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)

  if (!post) {
    return (
      <main className="min-h-screen w-full bg-surface-page">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col border-line border-x bg-surface-shell">
          <Header />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-32 text-center">
            <h1 className="font-sans text-[clamp(1.75rem,4vw,2.5rem)] text-foreground tracking-[-0.02em] antialiased">
              Post not found
            </h1>
            <Link
              href={developersPath('/blog')}
              className="font-mono text-[12px] text-foreground/40 uppercase tracking-[0.02em] transition-colors hover:text-foreground"
            >
              ← Blog
            </Link>
          </div>
          <Footer />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto w-full max-w-7xl border-line border-x bg-surface-shell">
        <Header />

        <article className="mx-auto w-full max-w-[760px] px-5 pt-14 lg:pt-20">
          <Reveal>
            <Link
              href={developersPath('/blog')}
              className="font-mono text-[12px] text-foreground/40 uppercase tracking-[0.02em] transition-colors hover:text-foreground"
            >
              ← Blog
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="whitespace-nowrap border border-line-strong px-2.5 py-[3px] font-mono text-[11px] text-foreground/50 uppercase tracking-[0.02em]">
                {categoryBySlug(post.category).badge}
              </span>
              <span className="font-mono text-[12px] text-foreground/40 uppercase tracking-[0.02em]">
                {formatDate(post.date)}
              </span>
              {isNew(post.date) && (
                <span className="whitespace-nowrap border border-indicator-green px-2.5 py-[3px] font-mono text-[11px] text-indicator-green uppercase tracking-[0.02em]">
                  New
                </span>
              )}
            </div>

            <h1 className="mt-5 font-sans text-[clamp(2rem,5vw,3rem)] text-foreground leading-[1.1] tracking-[-0.02em] antialiased">
              {post.title}
            </h1>

            <p className="mt-5 font-sans text-[17px] text-foreground/50 leading-[1.55] tracking-[0]">
              {post.excerpt}
            </p>
          </Reveal>

          {/* Post content is dev-authored markdown from the repo, rendered to
              HTML at build time, so raw HTML injection here is trusted. */}
          <Reveal delay={100} className="blog-prose mt-12 border-line border-t pt-10">
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted build-time markdown */}
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </Reveal>
        </article>

        <div className="mt-[140px]">
          <Footer />
        </div>
      </div>
    </main>
  )
}
