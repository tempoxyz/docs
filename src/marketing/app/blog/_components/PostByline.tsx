import { formatDate, type PostMeta } from '../_lib/categories'

export default function PostByline({ post }: { post: PostMeta }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 font-sans text-[13px] text-foreground/60 leading-[1.5] tracking-[0]">
      {post.authors && <span>By {post.authors}</span>}
      <time
        dateTime={post.date}
        className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.02em]"
      >
        {formatDate(post.date)}
      </time>
    </p>
  )
}
