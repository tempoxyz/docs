import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function mdxFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filepath = path.join(directory, entry.name)
    if (entry.isDirectory()) return mdxFiles(filepath)
    return entry.isFile() && filepath.endsWith('.mdx') ? [filepath] : []
  })
}

describe('docs asset paths', () => {
  it('uses the developers mount for root-relative public image assets', () => {
    const files = mdxFiles(path.resolve('src/pages/docs'))
    const unprefixedImages = files.flatMap((file) => {
      const text = fs.readFileSync(file, 'utf8')
      const markdownImages = [...text.matchAll(/!\[[^\]]*\]\(\/(?!developers\/)[^)]+\)/g)]
      const htmlImages = [
        ...text.matchAll(/<img\b[^>]*\bsrc=["']\/(?!developers\/)[^"']+["'][^>]*>/g),
      ]
      return [...markdownImages, ...htmlImages].map((match) => `${file}:${match[0]}`)
    })

    expect(unprefixedImages).toEqual([])
  })
})
