import { blogPostImageUrl } from '../../../seo'
import { developersPath } from '../../_lib/developersPaths'
import type { PostMeta } from '../_lib/categories'

export default function PostImage({
  post,
  priority = false,
  thumbnail = false,
}: {
  post: PostMeta
  priority?: boolean
  thumbnail?: boolean
}) {
  return (
    <img
      src={developersPath(blogPostImageUrl('', post))}
      alt=""
      width={1200}
      height={657}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={
        thumbnail
          ? 'absolute inset-0 h-full w-full object-contain'
          : 'aspect-[1200/657] w-full object-contain'
      }
    />
  )
}
