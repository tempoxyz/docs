import { describe, expect, it } from 'vitest'
import { makeBlogAssetUrlsMountSafe, renderHeroImage } from './blogPlugin'

describe('renderHeroImage', () => {
  it('keeps posts without hero images unchanged', () => {
    expect(renderHeroImage()).toBe('')
  })

  it('inlines theme-aware SVGs with selectable text and accessible alt text', () => {
    const html = renderHeroImage('/blog/inside-tempo-zones/overview.svg', 'Zones & wallets')
    expect(html).toContain('class="blog-diagram"')
    expect(html).toContain('aria-label="Zones &amp; wallets"')
    expect(html).toContain('<text')
    expect(html).toContain('var(--diagram-box)')
    expect(html).not.toContain('<img')
  })

  it('rejects missing assets and missing alt text', () => {
    expect(() => renderHeroImage('/blog/missing-hero.svg', 'Hero')).toThrow('not found')
    expect(() => renderHeroImage('/blog/inside-tempo-zones/overview.svg')).toThrow('heroImageAlt')
  })
})

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
