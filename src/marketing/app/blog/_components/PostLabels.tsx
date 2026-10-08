import { categoryBySlug, type PostMeta } from '../_lib/categories'

export default function PostLabels({ post }: { post: PostMeta }) {
  return (
    <div className="tempo-blog-labels">
      {post.categories.map((category) => (
        <span key={category}>{categoryBySlug(category).badge}</span>
      ))}
    </div>
  )
}
