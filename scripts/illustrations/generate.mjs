import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { interfaceScenes } from './interface.mjs'
import { lineworkScenes } from './linework.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const output = path.join(root, 'public/illustrations/docs')
await mkdir(output, { recursive: true })
for (const [id, svg] of Object.entries({ ...interfaceScenes, ...lineworkScenes })) {
  const destination = path.join(output, `${id}.svg`)
  await writeFile(destination, svg)
  console.log(path.relative(root, destination))
}
