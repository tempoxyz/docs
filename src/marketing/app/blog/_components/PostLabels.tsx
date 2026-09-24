import { categoryBySlug, isNew, type PostMeta } from '../_lib/categories'

export default function PostLabels({ post }: { post: PostMeta }) {
  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.02em]">
      {post.categories.map((category) => (
        <span
          key={category}
          className="whitespace-nowrap border border-line-strong px-2.5 py-[3px] text-foreground/60"
        >
          {categoryBySlug(category).badge}
        </span>
      ))}
      {isNew(post.date) && (
        <span className="whitespace-nowrap border border-indicator-green px-2.5 py-[3px] text-indicator-green">
          New
        </span>
      )}
    </div>
  )
}
