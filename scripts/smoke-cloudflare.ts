import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'

const origin = process.argv[2]
if (!origin) throw new Error('Pass the Worker URL')
const browser = { 'user-agent': 'Mozilla/5.0', accept: 'text/html' }
const get = (path: string, init?: RequestInit) =>
  fetch(new URL(path, origin), {
    redirect: 'manual',
    headers: browser,
    signal: AbortSignal.timeout(15_000),
    ...init,
  })

for (let attempt = 0; ; attempt++) {
  const response = await get('/SKILL.md').catch(() => undefined)
  await response?.body?.cancel()
  if (response?.ok) break
  if (attempt === 29) throw new Error(`Worker did not become ready at ${origin}`)
  await setTimeout(1_000)
}

async function expectResponse(path: string, status: number, init?: RequestInit) {
  const response = await get(path, init)
  assert.equal(response.status, status, `${path} returned ${response.status}`)
  return response
}

for (const route of ['/', '/docs/accounts', '/docs/api', '/docs/changelog']) {
  const page = await expectResponse(route, 200)
  assert.match(page.headers.get('content-type') ?? '', /text\/html/)
  assert.match(page.headers.get('vary') ?? '', /User-Agent/i)
  assert.ok((await page.text()).includes('https://tempo.com/developers'), `${route} canonical URL`)
}

for (const [route, headers] of [
  ['/docs/accounts.md', browser],
  ['/docs/accounts', { accept: 'text/markdown' }],
  ['/docs/accounts', { 'user-agent': 'ChatGPT-User' }],
] as const) {
  const response = await expectResponse(route, 200, { headers })
  assert.match(response.headers.get('content-type') ?? '', /text\/markdown/)
  assert.ok(/^# Tempo Accounts$/m.test(await response.text()), `${route} Markdown heading`)
}

const index = await expectResponse('/', 200, { headers: { accept: 'text/markdown' } })
assert.equal(await index.text(), await (await expectResponse('/llms.txt', 200)).text())

const rsc = await expectResponse('/RSC/R/docs/accounts.txt', 200)
const compatibilityRsc = await expectResponse('/developers/RSC/R/developers/docs/accounts.txt', 200)
assert.equal(await rsc.text(), await compatibilityRsc.text())

const redirect = await expectResponse('/developers/docs/hosted-services?ref=worker', 308)
assert.equal(redirect.headers.get('location'), 'https://tempo.com/developers/docs/api?ref=worker')
await redirect.body?.cancel()

const image = await expectResponse('/developers/api/og?title=Cloudflare', 200)
assert.equal(image.headers.get('content-type'), 'image/png')
assert.equal(
  Buffer.from(await image.arrayBuffer())
    .subarray(0, 8)
    .toString('hex'),
  '89504e470d0a1a0a',
)

const quote = await expectResponse('/api/routes-quote', 400, {
  method: 'POST',
  body: '{}',
  headers: { 'content-type': 'application/json' },
})
assert.equal((await quote.json()).error.code, 'param_invalid')

const missing = await expectResponse('/docs/missing-for-worker-smoke', 404)
assert.match(await missing.text(), /404|not found/i)

console.log(`Verified docs HTML, Markdown, RSC, redirects, API and OG image at ${origin}`)
