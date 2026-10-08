import { Link } from 'waku'
import DocsHeader from '../../../components/DocsHeader'
import BlogFooter from './_components/BlogFooter'
import PostByline from './_components/PostByline'
import PostExplorer from './_components/PostExplorer'
import PostImage from './_components/PostImage'
import PostLabels from './_components/PostLabels'
import { getAllPosts, getFeaturedPost } from './_lib/posts'
import './BlogShell.css'

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
    <div className="tempo-blog">
      <DocsHeader surface="blog" />
      <main id="blog-content" className="tempo-blog-index">
        <header className="tempo-blog-intro">
          <h1>Blog</h1>
          <p>Engineering and product updates from Tempo.</p>
        </header>

        {featured ? (
          <Link to={`/blog/${featured.slug}`} className="tempo-blog-featured">
            <div className="tempo-blog-featured-copy">
              <PostLabels post={featured} />
              <h2>{featured.title}</h2>
              <p className="tempo-blog-excerpt">{featured.excerpt}</p>
              <PostByline post={featured} />
            </div>
            <div className="tempo-blog-featured-image">
              <PostImage post={featured} priority />
            </div>
          </Link>
        ) : null}

        <PostExplorer posts={postMetas} />
      </main>
      <BlogFooter />
    </div>
  )
}
