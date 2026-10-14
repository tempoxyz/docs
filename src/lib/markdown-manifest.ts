import fs from 'node:fs/promises'
import path from 'node:path'
import { MarkdownOutput } from 'vocs/server'

/** Validate and fingerprint the final bytes after Tempo adds provenance and canonical links. */
export async function finalizeMarkdownManifest(directory: string, validation?: 'warn' | 'fail') {
  const manifestPath = path.join(directory, 'markdown-manifest.json')
  const previous = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as {
    version: number
    files: Record<string, string>
  }
  if (previous.version !== 1) throw new Error('Unsupported Markdown manifest version.')
  const files: Record<string, string> = {}
  for (const route of Object.keys(previous.files)) {
    // Routes come from the framework inventory, not a second filesystem discovery.
    const relative = route.endsWith('.md') ? `assets/md${route}` : route.slice(1)
    const file = path.resolve(directory, relative)
    if (!file.startsWith(`${path.resolve(directory)}${path.sep}`))
      throw new Error(`Invalid Markdown manifest route: ${route}`)
    files[route] = await fs.readFile(file, 'utf8')
  }
  const diagnostics = Object.entries(files).flatMap(([route, content]) =>
    MarkdownOutput.inspect(content, route),
  )
  const mode = MarkdownOutput.resolveValidation({ config: validation })
  if (diagnostics.length) {
    const message = MarkdownOutput.format({ ...mode, diagnostics })
    if (mode.validation === 'fail') throw new Error(message)
    console.warn(message)
  }
  await fs.writeFile(manifestPath, JSON.stringify(MarkdownOutput.manifest(files), null, 2))
}
