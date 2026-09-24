import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { getLastModified } from '../../node_modules/vocs/dist/internal/git.js'

const root = path.resolve(import.meta.dirname, '../..')
const pagesDir = path.join(root, 'src/pages')
const trackedPages = execFileSync('git', ['ls-files', '--', 'src/pages'], {
  cwd: root,
  encoding: 'utf-8',
})
  .split('\n')
  .filter((file) => /\.(md|mdx|tsx)$/.test(file))
const stride = Math.max(1, Math.floor(trackedPages.length / 12))
const sampledPages = trackedPages.filter((_, index) => index % stride === 0).slice(0, 12)

describe('Vocs Git last modified dates', () => {
  test.each(sampledPages)('matches per-file Git history for %s', (file) => {
    const expected = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: root,
      encoding: 'utf-8',
    }).trim()

    expect(getLastModified(path.join(root, file), pagesDir)).toBe(expected)
  })

  test('returns undefined for an untracked page', () => {
    expect(
      getLastModified(path.join(pagesDir, '__untracked-vocs-test.mdx'), pagesDir),
    ).toBeUndefined()
  })
})
