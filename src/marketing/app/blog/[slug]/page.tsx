import Link from 'next/link'
import Footer from '../../_components/Footer'
import Header from '../../_components/Header'
import Reveal from '../../_components/Reveal'
import { developersPath } from '../../_lib/developersPaths'
import MicroHeader from '../_components/MicroHeader'
import PostByline from '../_components/PostByline'
import PostLabels from '../_components/PostLabels'
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
        <MicroHeader title={post.title} />

        <article className="mx-auto w-full max-w-[760px] px-5 pt-14 lg:pt-20" data-blog-article>
          <Reveal>
            <Link
              href={developersPath('/blog')}
              className="font-mono text-[12px] text-foreground/40 uppercase tracking-[0.02em] transition-colors hover:text-foreground"
            >
              ← Blog
            </Link>

            <div className="mt-8">
              <PostLabels post={post} />
            </div>

            <h1
              className="mt-5 font-sans text-[clamp(2rem,5vw,3rem)] text-foreground leading-[1.1] tracking-[-0.02em] antialiased"
              data-blog-title
            >
              {post.title}
            </h1>

            <p className="mt-5 font-sans text-[17px] text-foreground/60 leading-[1.55] tracking-[0]">
              {post.excerpt}
            </p>
            <div className="mt-5">
              <PostByline post={post} />
            </div>
          </Reveal>

          {/* Post content is dev-authored markdown from the repo, rendered to
              HTML at build time, so raw HTML injection here is trusted. */}
          <Reveal delay={100} className="blog-prose mt-12 border-line border-t pt-10">
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted build-time markdown */}
            <div data-blog-content dangerouslySetInnerHTML={{ __html: post.html }} />
          </Reveal>
        </article>

        <div className="mt-[140px]">
          <Footer />
        </div>
      </div>
    </main>
  )
}
