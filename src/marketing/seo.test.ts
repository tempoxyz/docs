import { describe, expect, it } from 'vitest'
import { docsStructuredDataHead } from '../lib/docs-structured-data'
import { blogPostImageUrl, blogPostJsonLd, ogImageUrl, type PostSeo } from './seo'

const post: PostSeo = {
  slug: 'inside-tempo-zones',
  title: 'Inside Tempo Zones',
  excerpt: 'Private payments on Tempo.',
  date: '2026-09-23',
  category: 'technical',
  authors: 'Varun',
  ogImage: '/blog/inside-tempo-zones-og.png',
}

describe('blog social images', () => {
  it.each([
    '',
    'https://tempo.xyz/developers',
  ])('uses the same custom asset in Vocs metadata and JSON-LD with base %s', (base) => {
    const image = blogPostImageUrl(base, post)
    const expected = `${base}/blog/inside-tempo-zones-og.png`
    const head = docsStructuredDataHead(`/blog/${post.slug}`, {
      frontmatter: { title: post.title, ogImage: image },
    })

    expect(image).toBe(expected)
    expect(head?.meta.ogImage).toBe(expected)
    expect(JSON.parse(blogPostJsonLd(base, post, image)).image).toBe(expected)
  })

  it('keeps generated social cards for posts without a custom asset', () => {
    const withoutImage = { ...post, ogImage: undefined }
    expect(blogPostImageUrl('', withoutImage)).toBe(
      ogImageUrl('', { title: post.title, section: 'BLOG' }),
    )
    expect(
      docsStructuredDataHead('/blog/another-post', { frontmatter: { title: 'Another post' } }),
    ).toBeUndefined()
  })
})
