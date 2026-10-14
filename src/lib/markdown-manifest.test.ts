import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { finalizeMarkdownManifest } from './markdown-manifest'

const directories: string[] = []
afterEach(async () => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  await Promise.all(
    directories.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })),
  )
})
async function fixture(content: string) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tempo-markdown-'))
  directories.push(directory)
  await fs.mkdir(path.join(directory, 'assets/md'), { recursive: true })
  await fs.writeFile(path.join(directory, 'assets/md/index.md'), content)
  await fs.writeFile(path.join(directory, 'llms.txt'), '# Index\n')
  await fs.writeFile(
    path.join(directory, 'markdown-manifest.json'),
    JSON.stringify({
      version: 1,
      files: { '/index.md': 'old', '/llms.txt': 'old' },
    }),
  )
  return directory
}
describe('final Markdown manifest', () => {
  it('hashes final bytes using the original inventory', async () => {
    const content = '# Page\n\n> Source: Tempo\n'
    const directory = await fixture(content)
    await finalizeMarkdownManifest(directory, 'fail')
    const manifest = JSON.parse(
      await fs.readFile(path.join(directory, 'markdown-manifest.json'), 'utf8'),
    )
    expect(Object.keys(manifest.files)).toEqual(['/index.md', '/llms.txt'])
    expect(manifest.files['/index.md']).toBe(createHash('sha256').update(content).digest('hex'))
  })
  it('rejects JSX introduced by a final transform without updating hashes', async () => {
    const directory = await fixture('# Page\n\n<Missing />\n')
    await expect(finalizeMarkdownManifest(directory, 'fail')).rejects.toThrow('Missing')
    expect(await fs.readFile(path.join(directory, 'markdown-manifest.json'), 'utf8')).toContain(
      'old',
    )
  })
  it('warns about the same issue when explicitly overridden', async () => {
    vi.stubEnv('VOCS_MARKDOWN_VALIDATION', 'warn')
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const directory = await fixture('# Page\n\n<Missing />\n')
    await finalizeMarkdownManifest(directory, 'fail')
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Missing'))
    expect(await fs.readFile(path.join(directory, 'markdown-manifest.json'), 'utf8')).not.toContain(
      'old',
    )
  })
  it('does not silently omit missing files', async () => {
    const directory = await fixture('# Page\n')
    await fs.unlink(path.join(directory, 'assets/md/index.md'))
    await expect(finalizeMarkdownManifest(directory, 'warn')).rejects.toThrow()
  })
})
