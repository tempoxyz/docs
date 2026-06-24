import Link from 'next/link'
import FeaturedVisual from '../blog/_components/FeaturedVisual'
import { formatDate } from '../blog/_lib/categories'
import { getAllPosts, getFeaturedPost } from '../blog/_lib/posts'
import EdgeMarkers from './EdgeMarkers'
import Reveal from './Reveal'

export default function BlogSection() {
  const posts = getAllPosts()
  const featured = getFeaturedPost(posts)
  const latest = posts.filter((p) => p.slug !== featured.slug).slice(0, 4)

  return (
    <section>
      <Reveal className="flex flex-col items-center px-5 text-center">
        <h2 className="font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.1] tracking-[-0.02em] antialiased">
          Dive deeper into Tempo&apos;s engineering
        </h2>
        <p className="mt-6 max-w-[560px] font-sans text-[16px] text-foreground/50 leading-[1.4] tracking-[0] lg:text-[20px]">
          Engineering deep dives, network upgrades, events, and case studies{' '}
          <span className="text-foreground">from the team building Tempo.</span>
        </p>
      </Reveal>

      <Reveal className="mt-16">
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid border border-line transition-colors hover:bg-surface-block lg:grid-cols-2"
        >
          <div className="relative h-[200px] overflow-hidden border-line border-b lg:order-2 lg:h-auto lg:min-h-[280px] lg:border-b-0 lg:border-l">
            <FeaturedVisual />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 lg:order-1 lg:p-10">
            <h3 className="max-w-[480px] font-sans text-[clamp(1.5rem,3.5vw,2.125rem)] text-foreground leading-[1.15] tracking-[-0.02em] antialiased">
              {featured.title}
            </h3>
            <p className="max-w-[480px] font-sans text-[15px] text-foreground/50 leading-[1.55] tracking-[0]">
              {featured.excerpt}
            </p>
            <p className="font-mono text-[12px] text-foreground/40 uppercase tracking-[0.02em]">
              {formatDate(featured.date)}
            </p>
          </div>
        </Link>
      </Reveal>

      <div className="relative -mt-px border-line border-t">
        <EdgeMarkers wideOnly />
        <ul>
          {latest.map((post, i) => (
            <li key={post.slug}>
              <Reveal delay={i * 50}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-2 border-line border-b px-5 py-5 transition-colors hover:bg-surface-block lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8"
                >
                  <span className="font-sans text-[16px] text-foreground tracking-[0] transition-colors">
                    {post.title}
                  </span>
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="whitespace-nowrap font-mono text-[12px] text-foreground/40 uppercase tracking-[0.02em]">
                      {formatDate(post.date)}
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal>
          <Link
            href="/blog"
            className="flex items-center justify-center border-line border-b px-5 py-5 font-sans text-[16px] text-foreground tracking-[0] transition-colors hover:bg-surface-block lg:px-8"
          >
            View all blogs
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
