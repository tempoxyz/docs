'use client'

import { useEffect, useState } from 'react'
import { Link } from 'waku'
import { ChevronText } from '../../../../components/ChevronLink'
import { Tabs } from '../../../../components/Tabs'
import { categories, type PostMeta } from '../_lib/categories'
import {
  tempoBlogEmpty,
  tempoBlogExcerpt,
  tempoBlogExplorer,
  tempoBlogExplorerHeading,
  tempoBlogFilters,
  tempoBlogPostCard,
  tempoBlogPostCopy,
  tempoBlogPostList,
  tempoBlogPostThumbnail,
} from '../BlogShell.styles'
import PostByline from './PostByline'
import * as ui from './PostExplorer.recipes'
import PostImage from './PostImage'
import PostLabels from './PostLabels'

const filters = [{ slug: 'all' as const, label: 'All posts' }, ...categories]
type Filter = (typeof filters)[number]['slug']
const filterTabs = filters.map((filter) => ({ label: filter.label, value: filter.slug }))

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
      {/* The fieldset disables the tabs until hydration, so they never look usable early. */}
      <fieldset
        disabled={!mounted}
        className={`tempo-blog-filters ${tempoBlogFilters().className}`}
      >
        <legend {...ui.legend()}>Filter posts by category</legend>
        <Tabs
          aria-label="Post categories"
          controls="blog-posts"
          items={filterTabs}
          value={active}
          onValueChange={setActive}
        />
      </fieldset>

      <div
        id="blog-posts"
        role="tabpanel"
        aria-label={filters.find((filter) => filter.slug === active)?.label}
      >
        <ul className={`tempo-blog-post-list ${tempoBlogPostList().className}`}>
          {visible.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className={`tempo-blog-post-card ${tempoBlogPostCard().className}`}
              >
                <span className={`tempo-blog-post-thumbnail ${tempoBlogPostThumbnail().className}`}>
                  <PostImage post={post} />
                </span>
                <div className={`tempo-blog-post-copy ${tempoBlogPostCopy().className}`}>
                  <PostLabels post={post} />
                  <h3>
                    <ChevronText>{post.title}</ChevronText>
                  </h3>
                  <p className={`tempo-blog-excerpt ${tempoBlogExcerpt().className}`}>
                    {post.excerpt}
                  </p>
                  <PostByline post={post} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {visible.length === 0 ? (
          <p className={`tempo-blog-empty ${tempoBlogEmpty().className}`}>
            No posts in this category yet. Choose another category or view all posts.
          </p>
        ) : null}
      </div>
    </section>
  )
}
