import { canonicalDevelopersOrigin } from '../../../../lib/docs-routing'
import { blogPostImageUrl } from '../../../seo'
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
  // Production serves this page on developers.tempo.xyz and under tempo.xyz/developers, but
  // /developers/api/og only resolves on tempo.xyz, and SSR can't tell which mount the browser
  // is on. The canonical absolute URL works from both and matches the og:image cache key.
  const base = import.meta.env.VERCEL_ENV === 'production' ? canonicalDevelopersOrigin : ''
  return (
    <img
      src={blogPostImageUrl(base, post)}
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
