import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const basePath =
  process.env.VITE_BASE_PATH || (process.env.VERCEL_ENV === 'preview' ? '/developers' : '/')

const normalizedBase = basePath.replace(/^\/+|\/+$/g, '')
if (!normalizedBase) process.exit(0)

const publicDir = join(process.cwd(), 'dist', 'public')
if (!existsSync(publicDir)) process.exit(0)

const baseDir = join(publicDir, normalizedBase)
mkdirSync(baseDir, { recursive: true })

for (const entry of ['assets', 'docs', 'fonts', 'images', 'RSC']) {
  const source = join(publicDir, entry)
  if (!existsSync(source)) continue

  const destination = join(baseDir, entry)
  rmSync(destination, { force: true, recursive: true })
  cpSync(source, destination, { recursive: true })
}
