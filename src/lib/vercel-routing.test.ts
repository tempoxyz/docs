import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

type VercelConfig = {
  rewrites?: Array<{ source: string; destination: string }>
}

describe('Vercel routing', () => {
  it('normalizes doubled /developers RSC routes at the edge', () => {
    const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as VercelConfig
    const rewrites = config.rewrites ?? []

    expect(rewrites.slice(0, 4)).toEqual([
      {
        source: '/developers/RSC/R/developers.txt',
        destination: '/developers/RSC/R/_root.txt',
      },
      {
        source: '/developers/RSC/R/developers/:path(.*)',
        destination: '/developers/RSC/R/:path',
      },
      {
        source: '/RSC/R/developers.txt',
        destination: '/RSC/R/_root.txt',
      },
      {
        source: '/RSC/R/developers/:path(.*)',
        destination: '/RSC/R/:path',
      },
    ])
  })
})

type VercelHeaderRule = {
  source: string
  headers: Array<{ key: string; value: string }>
}

/**
 * Compiles the subset of Vercel's path-to-regexp source syntax that the header
 * rules use: literals, `\\` escapes, unnamed groups, and `:name(pattern)` params.
 */
function compileVercelSource(source: string) {
  let pattern = ''
  const names: string[] = []
  const group = (start: number) => {
    let depth = 0
    for (let index = start; index < source.length; index++) {
      if (source[index] === '\\') index++
      else if (source[index] === '(') depth++
      else if (source[index] === ')' && --depth === 0) return index
    }
    throw new Error(`Unbalanced group in ${source}`)
  }
  for (let index = 0; index < source.length; index++) {
    const char = source[index] as string
    if (char === '\\') {
      pattern += `\\${source[++index]}`
    } else if (char === ':') {
      const name = /^\w+/.exec(source.slice(index + 1))?.[0]
      if (!name) throw new Error(`Unnamed parameter in ${source}`)
      index += name.length
      names.push(name)
      if (source[index + 1] === '(') {
        const end = group(index + 1)
        pattern += `(${source.slice(index + 2, end)})`
        index = end
      } else pattern += '([^/]+)'
    } else if (char === '(') {
      const end = group(index)
      pattern += source.slice(index, end + 1)
      index = end
    } else pattern += char.replace(/[.*+?^${}|[\]/]/g, '\\$&')
  }
  return { names, regex: new RegExp(`^${pattern}$`) }
}

function responseHeaders(rules: VercelHeaderRule[], pathname: string) {
  const headers: Record<string, string[]> = {}
  for (const rule of rules) {
    const { names, regex } = compileVercelSource(rule.source)
    const match = regex.exec(pathname)
    if (!match) continue
    for (const { key, value } of rule.headers) {
      const resolved = names.reduce(
        (result, name, index) => result.replaceAll(`:${name}`, match[index + 1] ?? ''),
        value,
      )
      headers[key] = [...(headers[key] ?? []), resolved]
    }
  }
  return headers
}

describe('Vercel Markdown twin headers', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8')) as {
    headers?: VercelHeaderRule[]
  }
  const rules = config.headers ?? []
  const canonical = (url: string) => [`<${url}>; rel="canonical"`]

  it.each([
    ['/index.md', 'https://tempo.xyz/developers'],
    ['/developers/index.md', 'https://tempo.xyz/developers'],
    ['/assets/md/index.md', 'https://tempo.xyz/developers'],
    ['/developers/assets/md/index.md', 'https://tempo.xyz/developers'],
    ['/get-started.md', 'https://tempo.xyz/developers/get-started'],
    ['/docs/accounts/access-keys.md', 'https://tempo.xyz/developers/docs/accounts/access-keys'],
    ['/developers/docs/accounts.md', 'https://tempo.xyz/developers/docs/accounts'],
    ['/assets/md/docs/api/fee-payer.md', 'https://tempo.xyz/developers/docs/api/fee-payer'],
    [
      '/developers/assets/md/docs/protocol/tips/tip-1000.md',
      'https://tempo.xyz/developers/docs/protocol/tips/tip-1000',
    ],
  ])('points %s at its HTML page with one canonical Link header', (pathname, url) => {
    expect(responseHeaders(rules, pathname)).toEqual({ Link: canonical(url) })
  })

  it.each([
    '/SKILL.md',
    '/developers/SKILL.md',
    '/docs/accounts',
    '/llms.txt',
  ])('leaves %s without a canonical Link header', (pathname) => {
    expect(responseHeaders(rules, pathname)).toEqual({})
  })
})
