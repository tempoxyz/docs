import { blogPostImageUrl } from '../../../seo'
import { developersPath } from '../../_lib/developersPaths'
import type { PostMeta } from '../_lib/categories'
import * as ui from './PostImage.recipes'

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
      className={thumbnail ? ui.img().className : ui.img2().className}
    />
  )
}
