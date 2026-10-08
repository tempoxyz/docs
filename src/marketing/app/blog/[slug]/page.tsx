import { Link } from 'waku'
import DocsHeader from '../../../../components/DocsHeader'
import BlogFooter from '../_components/BlogFooter'
import MicroHeader from '../_components/MicroHeader'
import PostByline from '../_components/PostByline'
import PostLabels from '../_components/PostLabels'
import { getPost } from '../_lib/posts'
import '../BlogShell.css'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)

  if (!post) {
    return (
      <div className="tempo-blog">
        <DocsHeader surface="blog" />
        <main id="blog-content" className="tempo-blog-not-found">
          <h1>Post not found</h1>
          <Link to="/blog">← Back to the blog</Link>
        </main>
        <BlogFooter />
      </div>
    )
  }

  return (
    <div className="tempo-blog tempo-blog-post">
      <DocsHeader surface="blog" />
      <MicroHeader title={post.title} />
      <main id="blog-content">
        <article className="tempo-blog-article" data-blog-article>
          <header className="tempo-blog-article-header">
            <Link to="/blog" className="tempo-blog-back">
              ← All posts
            </Link>
            <PostLabels post={post} />
            <h1 data-blog-title>{post.title}</h1>
            <p className="tempo-blog-article-lede">{post.excerpt}</p>
            <PostByline post={post} />
          </header>

          <div className="blog-prose tempo-blog-article-body">
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted build-time repository markdown */}
            <div data-blog-content dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          <div className="tempo-blog-article-end">
            <Link to="/blog">← More posts</Link>
            <Link to="/docs">
              Documentation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </main>
      <BlogFooter />
    </div>
  )
}
