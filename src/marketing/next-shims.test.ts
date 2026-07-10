import { describe, expect, it } from 'vitest'
import { isClientRoutedBlogHref, normalizeMarketingPathname } from './next-shims'

describe('isClientRoutedBlogHref', () => {
  it.each([
    undefined,
    null,
    '',
    '/docs',
    '/developers/docs',
    'https://tempo.xyz/developers/blog',
  ])('returns false for %j', (href) => {
    expect(isClientRoutedBlogHref(href)).toBe(false)
  })

  it.each([
    '/blog',
    '/blog/t7-network-upgrade',
    '/developers/blog',
    '/developers/blog/t7-network-upgrade',
  ])('recognizes %s as a client-routed blog path', (href) => {
    expect(isClientRoutedBlogHref(href)).toBe(true)
  })
})

describe('normalizeMarketingPathname', () => {
  it.each([
    ['/developers', '/'],
    ['/developers/', '/'],
    ['/developers/build', '/build'],
    ['/developers/blog/t7-network-upgrade', '/blog/t7-network-upgrade'],
    ['/', '/'],
    ['/blog', '/blog'],
  ])('normalizes %s to %s', (pathname, expected) => {
    expect(normalizeMarketingPathname(pathname)).toBe(expected)
  })
})
