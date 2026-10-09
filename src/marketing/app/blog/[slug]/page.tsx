import { Link } from 'waku'
import DocsHeader from '../../../../components/DocsHeader'
import { blogProse } from '../../../../styles/surfaces.styles'
import BlogFooter from '../_components/BlogFooter'
import MicroHeader from '../_components/MicroHeader'
import PostByline from '../_components/PostByline'
import PostLabels from '../_components/PostLabels'
import { getPost } from '../_lib/posts'
import {
  tempoBlog,
  tempoBlogArticle,
  tempoBlogArticleBody,
  tempoBlogArticleEnd,
  tempoBlogArticleHeader,
  tempoBlogArticleLede,
  tempoBlogBack,
  tempoBlogNotFound,
  tempoBlogPost,
} from '../BlogShell.styles'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)

  if (!post) {
    return (
      <div className={`tempo-blog ${tempoBlog().className}`}>
        <DocsHeader surface="blog" />
        <main id="blog-content" className={`tempo-blog-not-found ${tempoBlogNotFound().className}`}>
          <h1>Post not found</h1>
          <Link to="/blog">← Back to the blog</Link>
        </main>
        <BlogFooter />
      </div>
    )
  }

  return (
    <div
      className={`tempo-blog tempo-blog-post ${tempoBlog().className + ' ' + tempoBlogPost().className}`}
    >
      <DocsHeader surface="blog" />
      <MicroHeader title={post.title} />
      <main id="blog-content">
        <article className={`tempo-blog-article ${tempoBlogArticle().className}`} data-blog-article>
          <header className={`tempo-blog-article-header ${tempoBlogArticleHeader().className}`}>
            <Link to="/blog" className={`tempo-blog-back ${tempoBlogBack().className}`}>
              ← All posts
            </Link>
            <PostLabels post={post} />
            <h1 data-blog-title>{post.title}</h1>
            <p className={`tempo-blog-article-lede ${tempoBlogArticleLede().className}`}>
              {post.excerpt}
            </p>
            <PostByline post={post} />
          </header>

          <div
            className={`blog-prose tempo-blog-article-body  ${blogProse().className} ${tempoBlogArticleBody().className}`}
          >
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted build-time repository markdown */}
            <div data-blog-content dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          <div className={`tempo-blog-article-end ${tempoBlogArticleEnd().className}`}>
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
