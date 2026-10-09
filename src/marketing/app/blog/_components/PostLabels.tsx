import { categoryBySlug, type PostMeta } from '../_lib/categories'
import { tempoBlogLabels } from '../BlogShell.styles'

export default function PostLabels({ post }: { post: PostMeta }) {
  return (
    <div className={`tempo-blog-labels ${tempoBlogLabels().className}`}>
      {post.categories.map((category) => (
        <span key={category}>{categoryBySlug(category).badge}</span>
      ))}
    </div>
  )
}
