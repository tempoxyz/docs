import { formatDate, type PostMeta } from '../_lib/categories'
import { tempoBlogByline } from '../BlogShell.styles'

export default function PostByline({ post }: { post: PostMeta }) {
  return (
    <p className={`tempo-blog-byline ${tempoBlogByline().className}`}>
      {post.authors ? <span>{post.authors}</span> : null}
      <time dateTime={post.date}>{formatDate(post.date)}</time>
    </p>
  )
}
