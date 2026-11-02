import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'
import { rewriteVocsSkipLink, vocsSkipLinkPath } from '../../scripts/vocs-skip-link-plugin'

test('changes only the installed native skip-link destination', async () => {
  const source = await readFile(vocsSkipLinkPath, 'utf8')
  const rewritten = rewriteVocsSkipLink(source)
  expect(rewritten).toContain("href: '#vocs-content'")
  expect(rewritten).toBe(source.replace(/href: `[^`]*`/, "href: '#vocs-content'"))
})

test.each([
  '',
  'href: path',
  "href: '#vocs-content'",
])('fails visibly when the upstream skip-link source changes: %s', (source) => {
  expect(() => rewriteVocsSkipLink(source)).toThrow('Vocs skip-link source changed')
})
