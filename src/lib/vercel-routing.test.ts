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
