import { readFile, writeFile } from 'node:fs/promises'

const configPath = '.vercel/output/config.json'

const developersRoutes = [
  {
    src: '^/developers/?$',
    dest: '/docs/',
  },
  {
    src: '^/developers/assets/(.*)$',
    dest: '/assets/$1',
  },
  {
    src: '^/developers/api/(.*)$',
    dest: '/api/$1',
  },
  {
    src: '^/developers/(.*)$',
    dest: '/docs/$1',
  },
]

const config = JSON.parse(await readFile(configPath, 'utf-8'))
const routes = Array.isArray(config.routes) ? config.routes : []

const withoutExisting = routes.filter(
  (route) => typeof route.src !== 'string' || !route.src.startsWith('^/developers'),
)
const fallbackIndex = withoutExisting.findIndex(
  (route) => route.src === '^/.*$' && route.status === 404,
)

if (fallbackIndex === -1) {
  throw new Error('Could not find Vercel 404 fallback route to patch')
}

config.routes = [
  ...withoutExisting.slice(0, fallbackIndex),
  ...developersRoutes,
  ...withoutExisting.slice(fallbackIndex),
]

await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)
