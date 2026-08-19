import { describe, expect, it } from 'vitest'
import { makeBlogAssetUrlsMountSafe } from './blogPlugin'

describe('makeBlogAssetUrlsMountSafe', () => {
  it('keeps blog media under the current mount path', () => {
    const html = [
      '<img src="/blog/example.png">',
      '<video><source src="/blog/example.mp4"></video>',
      '<a href="/blog/example.mp4">Watch the video</a>',
      '<a href="/docs">Read the docs</a>',
    ].join('')

    expect(makeBlogAssetUrlsMountSafe(html)).toBe(
      [
        '<img src="./example.png">',
        '<video><source src="./example.mp4"></video>',
        '<a href="./example.mp4">Watch the video</a>',
        '<a href="/docs">Read the docs</a>',
      ].join(''),
    )
  })
})
