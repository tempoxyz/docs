import { mkdtemp, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, it } from 'vitest'
import { resolveConfig } from 'vocs/config'

// Vocs dev middleware resolves the config on every request, and each Vite load
// imports the bundled config as a new module that Node never frees.
// patches/vocs@2.8.5.patch reuses a load until a file it bundled changes.
it('reuses a config load until the config or a file it imports changes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'tempo-vocs-config-'))
  const cwd = process.cwd()
  try {
    await writeFile(
      path.join(root, 'vocs.config.ts'),
      "import { title } from './title'\nexport default { title }\n",
    )
    await writeFile(path.join(root, 'title.ts'), "export const title = 'First'\n")
    // Vocs finds the config relative to the working directory.
    process.chdir(root)

    const first = await resolveConfig({ rootDir: root })
    expect(first.title).toBe('First')
    expect(await resolveConfig({ rootDir: root, server: true })).toBe(first)

    await writeFile(path.join(root, 'title.ts'), "export const title = 'Second'\n")
    const later = new Date(Date.now() + 60_000)
    await utimes(path.join(root, 'title.ts'), later, later)

    const second = await resolveConfig({ rootDir: root })
    expect(second.title).toBe('Second')
    expect(await resolveConfig({ rootDir: root })).toBe(second)
  } finally {
    process.chdir(cwd)
    await rm(root, { force: true, recursive: true })
  }
})
