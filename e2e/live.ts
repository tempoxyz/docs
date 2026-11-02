import { test as base } from '@playwright/test'
import { installAuthenticatedRpc } from './rpc'

export { expect, type Locator, type Page } from '@playwright/test'

export const test = base.extend<{ authenticatedRpc: undefined }>({
  authenticatedRpc: [
    async ({ context }, use) => {
      const key = process.env.TEMPO_RPC_API_KEY?.trim()
      if (key) await installAuthenticatedRpc(context, key)
      await use(undefined)
    },
    { auto: true },
  ],
})
