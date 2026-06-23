import { posts as renderedPosts } from 'virtual:blog-posts'
import type { CategorySlug, PostMeta } from './categories'

// Posts are read from the markdown files in /blogs and rendered to HTML at
// build time by the blog Vite plugin (see src/marketing/blogPlugin.ts). This
// module is the client-side view over that data.

export type Post = PostMeta & { html: string }

const posts: Post[] = renderedPosts.map((post) => ({
  ...post,
  category: post.category as CategorySlug,
}))

export function getAllPosts(): Post[] {
  return posts
}

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

// The pinned post for the hero card: an explicit `featured: true` wins,
// otherwise the most recent post.
export function getFeaturedPost(posts: Post[]): Post {
  return posts.find((p) => p.featured) ?? posts[0]
}
