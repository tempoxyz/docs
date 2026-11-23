import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, test } from 'vitest'

// Vocs decides which clients get a page as Markdown from one user-agent list,
// which also builds the Vercel route that serves Markdown in production.
// patches/vocs@2.12.0.patch adds Anthropic's user-triggered and search
// fetchers to it; this keeps the patch from being dropped on an upgrade.
const vocsRoot = path.resolve('node_modules/vocs')
const { aiUserAgents, prefersMarkdown } = (await import(
  pathToFileURL(path.join(vocsRoot, 'dist/internal/markdown-negotiation.js')).href
)) as {
  aiUserAgents: readonly string[]
  prefersMarkdown: (options: { pathname: string; userAgent?: string; accept?: string }) => boolean
}

// User agents as each service sends them, with the Accept header it sends.
const agents = {
  // Claude's web_fetch tool and claude.ai browsing.
  'Claude-User': {
    userAgent:
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +claude-user@anthropic.com)',
    accept: '*/*',
  },
  'Claude-SearchBot': {
    userAgent:
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +Claude-SearchBot@anthropic.com)',
    accept: '*/*',
  },
  ClaudeBot: {
    userAgent:
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    accept: '*/*',
  },
  'ChatGPT-User': {
    userAgent:
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  },
}

describe('Markdown negotiation', () => {
  for (const [name, headers] of Object.entries(agents)) {
    test(`serves ${name} Markdown`, () => {
      expect(aiUserAgents).toContain(name)
      expect(prefersMarkdown({ pathname: '/docs/accounts', ...headers })).toBe(true)
    })
  }

  test('keeps browsers and search engines on HTML', () => {
    for (const userAgent of [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    ])
      expect(
        prefersMarkdown({ pathname: '/docs/accounts', userAgent, accept: 'text/html,*/*;q=0.8' }),
      ).toBe(false)
  })
})
