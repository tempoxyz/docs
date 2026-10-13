import { readdir } from 'node:fs/promises'
import type { BrowserContext } from '@playwright/test'

export const productionDocsUrl = 'https://tempo.xyz/developers'

/** Exercise production URLs locally without contacting or mutating the live site. */
export async function proxyProductionMount(context: BrowserContext, upstream: string) {
  const errors: string[] = []
  const failedRequests: string[] = []
  // The live hosting contract serves bundles and fonts at the domain root.
  // Only allow emitted files; page and generated Markdown URLs stay mounted.
  const rootAssets = new Set(
    (await readdir(new URL('../dist/public/assets/', import.meta.url), { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => `/assets/${entry.name}`),
  )
  for (const font of await readdir(new URL('../dist/public/fonts/', import.meta.url), {
    recursive: true,
  })) {
    if (font.endsWith('.woff2')) rootAssets.add(`/fonts/${font}`)
  }
  for (const sticker of await readdir(new URL('../dist/public/stickers/', import.meta.url), {
    recursive: true,
  })) {
    if (sticker.endsWith('.svg')) rootAssets.add(`/stickers/${sticker}`)
  }

  context.on('page', (page) => {
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('response', (response) => {
      if (response.url().startsWith('https://tempo.xyz/') && response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`)
      }
    })
  })

  await context.route('https://tempo.xyz/**', async (route) => {
    const publicUrl = new URL(route.request().url())
    if (!/^\/developers(?:\/|$)/.test(publicUrl.pathname) && !rootAssets.has(publicUrl.pathname)) {
      await route.fulfill({ status: 404, body: 'Request escaped the /developers mount.' })
      return
    }

    // The outer website strips /developers. Vercel also normalizes Waku's
    // prefixed RSC destinations before forwarding them to the docs server.
    const pathname = (publicUrl.pathname.replace(/^\/developers/, '') || '/')
      .replace(/^\/RSC\/R\/developers\.txt$/, '/RSC/R/_root.txt')
      .replace(/^\/RSC\/R\/developers\//, '/RSC/R/')
    const localUrl = new URL(pathname + publicUrl.search, upstream)
    const response = await route.fetch({ url: localUrl.href, maxRedirects: 0 })
    await route.fulfill({ response })
  })

  return { errors, failedRequests }
}
