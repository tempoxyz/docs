import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test } from 'vitest'

// Vocs decides which clients get a page as Markdown from one user-agent list,
// which also builds the Vercel route that serves Markdown in production.
// patches/vocs@2.12.0.patch adds Anthropic's user-triggered and search
// fetchers to it; this keeps the patch from being dropped on an upgrade.
const { prefersMarkdown } = (await import(
  pathToFileURL(path.resolve('node_modules/vocs/dist/internal/markdown-negotiation.js')).href
)) as {
  prefersMarkdown: (options: { pathname: string; userAgent?: string; accept?: string }) => boolean
}

test('serves Claude-User Markdown', () => {
  expect(
    prefersMarkdown({
      pathname: '/docs/accounts',
      userAgent:
        'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +claude-user@anthropic.com)',
      accept: '*/*',
    }),
  ).toBe(true)
})
