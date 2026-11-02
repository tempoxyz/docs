import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { earnScenes } from './earn.mjs'
import { interfaceScenes } from './interface.mjs'
import { lineworkScenes } from './linework.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const outputs = {
  'public/illustrations/docs': { ...interfaceScenes, ...lineworkScenes },
  'public/illustrations/earn': earnScenes,
}
for (const [directory, scenes] of Object.entries(outputs)) {
  const output = path.join(root, directory)
  await mkdir(output, { recursive: true })
  for (const [id, svg] of Object.entries(scenes)) {
    const destination = path.join(output, `${id}.svg`)
    await writeFile(destination, svg)
    console.log(path.relative(root, destination))
  }
}
