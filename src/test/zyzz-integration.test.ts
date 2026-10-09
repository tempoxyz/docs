import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { build, createServer, type HMRPayload } from 'vite'
import { expect, it, vi } from 'vitest'
import { zyzz } from 'zyzz/vite'

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'tempo-zyzz-'))
  await symlink(path.resolve('node_modules'), path.join(root, 'node_modules'), 'junction')
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ name: 'zyzz-fixture', type: 'module' }),
  )
  await mkdir(path.join(root, 'snippets'))
  await mkdir(path.join(root, 'snippets-live'))
  await writeFile(
    path.join(root, 'snippets', 'fragment.ts'),
    await readFile('src/snippets/wagmi.config.ts', 'utf8'),
  )
  await writeFile(
    path.join(root, 'snippets-live', 'card.ts'),
    "import { style } from 'zyzz'; export const card = style({ color: 'red' });",
  )
  await writeFile(path.join(root, 'main.ts'), "export { card } from './snippets-live/card'")
  return root
}

it('excludes documentation fragments without excluding similarly named source directories', async () => {
  const root = await fixture()
  try {
    const compile = (exclude?: string[]) =>
      build({
        configFile: false,
        root,
        logLevel: 'silent',
        plugins: [zyzz({ exclude, script: false })],
        build: {
          write: false,
          minify: false,
          lib: { entry: path.join(root, 'main.ts'), formats: ['es'] },
        },
      })

    // The real multi-region documentation source is not one runnable module.
    await expect(compile()).rejects.toThrow()
    const result = await compile(['snippets'])
    const outputs = (Array.isArray(result) ? result : [result]).flatMap((bundle) =>
      'output' in bundle ? bundle.output : [],
    )
    const css = outputs
      .filter((output) => output.type === 'asset' && output.fileName.endsWith('.css'))
      .map((output) => (output.type === 'asset' ? String(output.source) : ''))
      .join('\n')
    expect(css).toMatch(/color:\s*(?:red|#f00)/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}, 30_000)

it('serves server-compiled CSS to the browser without compiling its owner in the client', async () => {
  const root = await fixture()
  const server = await createServer({
    configFile: false,
    root,
    logLevel: 'silent',
    plugins: [zyzz({ exclude: ['snippets'], script: false })],
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true },
  })
  try {
    const source = path.join(root, 'snippets-live/card.ts')
    await server.environments.ssr.transformRequest('/snippets-live/card.ts')
    const module =
      await server.environments.ssr.moduleGraph.getModuleByUrl('/snippets-live/card.ts')
    const cssIds = [...(module?.importedModules ?? [])]
      .map((dependency) => dependency.id)
      .filter((id): id is string => !!id && id.startsWith('\0zyzz:') && id !== '\0zyzz:shared.css')
    expect(cssIds).toHaveLength(1)
    expect(server.environments.client.moduleGraph.getModuleById(source)).toBeUndefined()
    const css = await server.environments.client.pluginContainer.load(cssIds[0])
    expect(typeof css === 'string' ? css : css?.code).toMatch(/color:\s*(?:red|#f00)/)
    expect(server.environments.client.moduleGraph.getModuleById(source)).toBeUndefined()

    // A browser stylesheet must also update when only its server owner changes.
    await server.environments.client.transformRequest(`${cssIds[0]}?direct`)
    const send = vi.spyOn(server.environments.client.hot, 'send')
    for (const [color, pattern] of [
      ['blue', /color:\s*(?:blue|#00f)/],
      ['red', /color:\s*(?:red|#f00)/],
    ] as const) {
      send.mockClear()
      await writeFile(
        source,
        `import { style } from 'zyzz'; export const card = style({ color: '${color}' });`,
      )
      await vi.waitFor(() => {
        expect(
          (send.mock.calls as unknown as [HMRPayload][]).some(
            ([payload]) =>
              typeof payload === 'object' &&
              payload.type === 'update' &&
              payload.updates.some(
                (update) => update.type === 'css-update' && update.path.includes('zyzz:'),
              ),
          ),
        ).toBe(true)
      })
      const updated = await server.environments.client.pluginContainer.load(cssIds[0])
      expect(typeof updated === 'string' ? updated : updated?.code).toMatch(pattern)
    }
  } finally {
    await server.close()
    await rm(root, { recursive: true, force: true })
  }
}, 30_000)
