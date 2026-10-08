'use client'

import { useEffect, useState } from 'react'
import { Link } from 'waku'
import { categories, type PostMeta } from '../_lib/categories'
import PostByline from './PostByline'
import PostImage from './PostImage'
import PostLabels from './PostLabels'

const filters = [{ slug: 'all' as const, label: 'All posts' }, ...categories]
type Filter = (typeof filters)[number]['slug']

export default function PostExplorer({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState<Filter>('all')
  const [mounted, setMounted] = useState(false)
  const visible =
    active === 'all' ? posts : posts.filter((post) => post.categories.includes(active))

  useEffect(() => setMounted(true), [])

  return (
    <section className="tempo-blog-explorer" aria-labelledby="latest-posts">
      <div className="tempo-blog-explorer-heading">
        <h2 id="latest-posts">Articles</h2>
        <span role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'post' : 'posts'}
        </span>
      </div>
      <fieldset className="tempo-blog-filters">
        <legend className="sr-only">Filter posts by category</legend>
        {filters.map((filter) => (
          <button
            key={filter.slug}
            type="button"
            aria-pressed={active === filter.slug}
            onClick={() => setActive(filter.slug)}
            disabled={!mounted}
          >
            {filter.label}
          </button>
        ))}
      </fieldset>

      <ul className="tempo-blog-post-list">
        {visible.map((post) => (
          <li key={post.slug}>
            <Link to={`/blog/${post.slug}`} className="tempo-blog-post-row">
              <div className="tempo-blog-post-copy">
                <PostLabels post={post} />
                <h3>{post.title}</h3>
                <p className="tempo-blog-excerpt">{post.excerpt}</p>
                <PostByline post={post} />
              </div>
              <span className="tempo-blog-post-thumbnail">
                <PostImage post={post} />
              </span>
              <span className="tempo-blog-post-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="tempo-blog-empty">
          No posts in this category yet. Choose another category or view all posts.
        </p>
      ) : null}
    </section>
  )
}
