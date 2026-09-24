'use client'

import Link from 'next/link'
import { useState } from 'react'
import Reveal from '../../_components/Reveal'
import { developersPath } from '../../_lib/developersPaths'
import { categories, type PostMeta } from '../_lib/categories'
import PostByline from './PostByline'
import PostImage from './PostImage'
import PostLabels from './PostLabels'

const filters = [{ slug: 'all' as const, label: 'All' }, ...categories]

type Filter = (typeof filters)[number]['slug']

export default function PostExplorer({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState<Filter>('all')
  const visible = active === 'all' ? posts : posts.filter((p) => p.categories.includes(active))

  return (
    <section>
      <fieldset className="flex min-w-0 flex-wrap gap-2 px-5 lg:px-8">
        <legend className="sr-only">Filter posts by category</legend>
        {filters.map((filter) => (
          <button
            key={filter.slug}
            type="button"
            aria-pressed={active === filter.slug}
            onClick={() => setActive(filter.slug)}
            className={`min-h-11 whitespace-nowrap border px-4 py-2 font-sans text-[13px] tracking-[0] transition-colors focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 ${
              active === filter.slug
                ? 'border-foreground bg-foreground text-background'
                : 'border-line-strong text-foreground/60 hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </fieldset>

      <ul className="mt-6 border-line border-t lg:mt-8">
        {visible.map((post, i) => (
          <li key={post.slug}>
            <Reveal delay={Math.min(i, 6) * 40}>
              <Link
                href={developersPath(`/blog/${post.slug}`)}
                className="group flex items-center gap-6 border-line border-b px-5 py-6 transition-colors hover:bg-surface-block focus-visible:outline-2 focus-visible:outline-foreground focus-visible:-outline-offset-2 lg:gap-8 lg:px-8"
              >
                <span className="hidden w-72 shrink-0 overflow-hidden border border-line bg-surface-block md:block lg:w-80">
                  <PostImage post={post} />
                </span>
                <div className="flex min-w-0 flex-col gap-2.5 md:gap-1.5">
                  <PostLabels post={post} />
                  <h2 className="font-sans text-[18px] text-foreground leading-[1.3] tracking-[-0.01em] antialiased lg:text-[20px]">
                    {post.title}
                  </h2>
                  <p className="max-w-[640px] font-sans text-[15px] text-foreground/60 leading-[1.55] tracking-[0] transition-colors group-hover:text-foreground/70 md:line-clamp-1 lg:line-clamp-2">
                    {post.excerpt}
                  </p>
                  <PostByline post={post} />
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <p
          role="status"
          className="border-line border-b px-5 py-12 font-sans text-[15px] text-foreground/60 leading-[1.55] lg:px-8"
        >
          No posts in this category yet. Choose another category or view all posts.
        </p>
      )}
    </section>
  )
}
