'use client'

import Link from 'next/link'
import { useState } from 'react'
import Reveal from '../../_components/Reveal'
import { developersPath } from '../../_lib/developersPaths'
import { categories, categoryBySlug, isNew, type PostMeta } from '../_lib/categories'

const filters = [{ slug: 'all' as const, label: 'All' }, ...categories]

type Filter = (typeof filters)[number]['slug']

export default function PostExplorer({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState<Filter>('all')
  const visible = active === 'all' ? posts : posts.filter((p) => p.category === active)

  return (
    <section>
      <div
        className="flex flex-wrap gap-2 px-5 lg:px-8"
        role="tablist"
        aria-label="Filter posts by category"
      >
        {filters.map((filter) => (
          <button
            key={filter.slug}
            type="button"
            role="tab"
            aria-selected={active === filter.slug}
            onClick={() => setActive(filter.slug)}
            className={`h-9 whitespace-nowrap border px-4 font-sans text-[13px] tracking-[0] transition-colors ${
              active === filter.slug
                ? 'border-foreground bg-foreground text-background'
                : 'border-line-strong text-foreground/50 hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ul className="mt-8 border-line border-t">
        {visible.map((post, i) => (
          <li key={post.slug}>
            <Reveal delay={Math.min(i, 6) * 40}>
              <Link
                href={developersPath(`/blog/${post.slug}`)}
                className="group flex flex-col gap-2.5 border-line border-b px-5 py-6 transition-colors hover:bg-surface-block lg:px-8"
              >
                <span className="flex flex-wrap items-center gap-3">
                  <span className="whitespace-nowrap border border-line-strong px-2.5 py-[3px] font-mono text-[11px] text-foreground/50 uppercase tracking-[0.02em]">
                    {categoryBySlug(post.category).badge}
                  </span>
                  {isNew(post.date) && (
                    <span className="whitespace-nowrap border border-indicator-green px-2.5 py-[3px] font-mono text-[11px] text-indicator-green uppercase tracking-[0.02em]">
                      New
                    </span>
                  )}
                  <span className="font-sans text-[16px] text-foreground tracking-[0]">
                    {post.title}
                  </span>
                </span>
                <span className="max-w-[640px] font-sans text-[14px] text-foreground/50 leading-[1.5] tracking-[0] transition-colors group-hover:text-foreground/70">
                  {post.excerpt}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
