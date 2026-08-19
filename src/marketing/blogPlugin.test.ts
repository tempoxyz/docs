import { describe, expect, it } from 'vitest'
import { makeBlogAssetUrlsMountSafe } from './blogPlugin'

describe('makeBlogAssetUrlsMountSafe', () => {
  const html = [
    '<img src="/blog/example.png">',
    '<video><source src="/blog/example.mp4"></video>',
    '<a href="/blog/example.mp4">Watch the video</a>',
    '<a href="/docs">Read the docs</a>',
  ].join('')

  it('uses the developers mount in production', () => {
    expect(makeBlogAssetUrlsMountSafe(html, 'production')).toBe(
      [
        '<img src="/developers/blog/example.png">',
        '<video><source src="/developers/blog/example.mp4"></video>',
        '<a href="/developers/blog/example.mp4">Watch the video</a>',
        '<a href="/docs">Read the docs</a>',
      ].join(''),
    )
  })

  it('uses root blog paths in previews', () => {
    expect(makeBlogAssetUrlsMountSafe(html, 'preview')).toBe(
      [
        '<img src="/blog/example.png">',
        '<video><source src="/blog/example.mp4"></video>',
        '<a href="/blog/example.mp4">Watch the video</a>',
        '<a href="/docs">Read the docs</a>',
      ].join(''),
    )
  })
})
