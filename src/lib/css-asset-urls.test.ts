import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// tempo.xyz serves the docs under /developers but proxies only some public folders from the
// site root. CSS urls are not rewritten for the mount, so a root-relative url into one of
// these folders loads locally and on previews but 404s in production.
const unmountedFolders = ['blog', 'diagrams', 'icons', 'illustrations', 'learn', 'partners']
const rootUrl = new RegExp(`url\\(\\s*["']?/(${unmountedFolders.join('|')})/`, 'g')

function styleSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return styleSources(path)
    return /\.(ts|tsx|css)$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : []
  })
}

describe('CSS asset urls', () => {
  it('only reference public folders that tempo.xyz serves from the site root', () => {
    const offenders = styleSources(join(process.cwd(), 'src')).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(rootUrl)].map(
        (match) => `${file.replace(`${process.cwd()}/`, '')}: ${match[0]}`,
      ),
    )
    expect(offenders).toEqual([])
  })
})
