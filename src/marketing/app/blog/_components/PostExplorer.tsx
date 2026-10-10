'use client'

import { useEffect, useState } from 'react'
import { Link } from 'waku'
import { categories, type PostMeta } from '../_lib/categories'
import {
  tempoBlogEmpty,
  tempoBlogExcerpt,
  tempoBlogExplorer,
  tempoBlogExplorerHeading,
  tempoBlogFilters,
  tempoBlogPostArrow,
  tempoBlogPostCopy,
  tempoBlogPostList,
  tempoBlogPostRow,
  tempoBlogPostThumbnail,
} from '../BlogShell.styles'
import PostByline from './PostByline'
import * as ui from './PostExplorer.recipes'
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
    <section
      className={`tempo-blog-explorer ${tempoBlogExplorer().className}`}
      aria-labelledby="latest-posts"
    >
      <div className={`tempo-blog-explorer-heading ${tempoBlogExplorerHeading().className}`}>
        <h2 id="latest-posts">Articles</h2>
        <span role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'post' : 'posts'}
        </span>
      </div>
      <fieldset className={`tempo-blog-filters ${tempoBlogFilters().className}`}>
        <legend {...ui.legend()}>Filter posts by category</legend>
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

      <ul className={`tempo-blog-post-list ${tempoBlogPostList().className}`}>
        {visible.map((post) => (
          <li key={post.slug}>
            <Link
              to={`/blog/${post.slug}`}
              className={`tempo-blog-post-row ${tempoBlogPostRow().className}`}
            >
              <div className={`tempo-blog-post-copy ${tempoBlogPostCopy().className}`}>
                <PostLabels post={post} />
                <h3>{post.title}</h3>
                <p className={`tempo-blog-excerpt ${tempoBlogExcerpt().className}`}>
                  {post.excerpt}
                </p>
                <PostByline post={post} />
              </div>
              <span className={`tempo-blog-post-thumbnail ${tempoBlogPostThumbnail().className}`}>
                <PostImage post={post} />
              </span>
              <span
                className={`tempo-blog-post-arrow ${tempoBlogPostArrow().className}`}
                aria-hidden="true"
              >
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className={`tempo-blog-empty ${tempoBlogEmpty().className}`}>
          No posts in this category yet. Choose another category or view all posts.
        </p>
      ) : null}
    </section>
  )
}
