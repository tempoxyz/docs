import { expect, test } from '@playwright/test'
import {
  classifyDocsRequest,
  type DocsRequestAgentKind,
  type DocsRequestMatchSource,
  type DocsRequestSurface,
} from '../src/lib/docs-request-classifier'

type ClassificationCase = {
  name: string
  input: Parameters<typeof classifyDocsRequest>[0]
  expected: {
    agent_family?: string
    agent_kind?: DocsRequestAgentKind
    match_source: DocsRequestMatchSource
    shouldTrack: boolean
    surface: DocsRequestSurface
  }
}

const cases: ClassificationCase[] = [
  {
    name: 'OpenAI search crawler',
    input: { path: '/guide/payments', userAgent: 'Mozilla/5.0; OAI-SearchBot/1.0' },
    expected: {
      agent_family: 'openai',
      agent_kind: 'search',
      match_source: 'official_ua',
      shouldTrack: true,
      surface: 'docs',
    },
  },
  {
    name: 'Anthropic user fetcher',
    input: { path: '/guide/payments.md', userAgent: 'Claude-User/1.0' },
    expected: {
      agent_family: 'anthropic',
      agent_kind: 'user_fetch',
      match_source: 'official_ua',
      shouldTrack: true,
      surface: 'markdown',
    },
  },
  {
    name: 'Perplexity crawler',
    input: { path: '/llms-full.txt', userAgent: 'PerplexityBot/1.0' },
    expected: {
      agent_family: 'perplexity',
      agent_kind: 'crawler',
      match_source: 'official_ua',
      shouldTrack: true,
      surface: 'llms',
    },
  },
  {
    name: 'Google crawler',
    input: { path: '/.well-known/ai-plugin.json', userAgent: 'Google-CloudVertexBot' },
    expected: {
      agent_family: 'google',
      agent_kind: 'crawler',
      match_source: 'official_ua',
      shouldTrack: true,
      surface: 'well_known',
    },
  },
  {
    name: 'Claude Code MCP client',
    input: { path: '/api/mcp', userAgent: 'claude-code/1.0.0 (cli)' },
    expected: {
      agent_family: 'anthropic',
      agent_kind: 'developer_tool',
      match_source: 'managed_list',
      shouldTrack: true,
      surface: 'mcp',
    },
  },
  {
    name: 'Codex MCP client',
    input: { path: '/api/mcp', userAgent: 'codex-mcp-client/0.1.0' },
    expected: {
      agent_family: 'openai',
      agent_kind: 'developer_tool',
      match_source: 'managed_list',
      shouldTrack: true,
      surface: 'mcp',
    },
  },
  {
    name: 'Axios docs page request',
    input: { path: '/docs/api/authentication', userAgent: 'axios/1.7.9' },
    expected: {
      agent_family: 'http_client',
      agent_kind: 'developer_tool',
      match_source: 'managed_list',
      shouldTrack: true,
      surface: 'docs',
    },
  },
  {
    name: 'Got markdown request',
    input: {
      path: '/docs/api/authentication.md',
      userAgent: 'got (https://github.com/sindresorhus/got)',
    },
    expected: {
      agent_family: 'http_client',
      agent_kind: 'developer_tool',
      match_source: 'managed_list',
      shouldTrack: true,
      surface: 'markdown',
    },
  },
  {
    name: 'Python Requests docs page request',
    input: { path: '/docs/guide/payments/send-a-payment', userAgent: 'python-requests/2.32.3' },
    expected: {
      agent_family: 'http_client',
      agent_kind: 'developer_tool',
      match_source: 'managed_list',
      shouldTrack: true,
      surface: 'docs',
    },
  },
  {
    name: 'Go HTTP client llms request',
    input: { path: '/llms.txt', userAgent: 'Go-http-client/2.0' },
    expected: {
      agent_family: 'http_client',
      agent_kind: 'developer_tool',
      match_source: 'managed_list',
      shouldTrack: true,
      surface: 'llms',
    },
  },
  {
    name: 'AI referrer',
    input: { path: '/guide/payments', referer: 'https://chatgpt.com/c/abc' },
    expected: {
      agent_kind: 'unknown_ai',
      match_source: 'ai_referrer',
      shouldTrack: true,
      surface: 'docs',
    },
  },
  {
    name: 'MCP surface with unknown user agent',
    input: { path: '/api/mcp', userAgent: 'UnknownAgent/1.0' },
    expected: {
      match_source: 'agent_surface',
      shouldTrack: true,
      surface: 'mcp',
    },
  },
  {
    name: 'skill surface with curl client',
    input: { path: '/SKILL.md', userAgent: 'curl/8.0' },
    expected: {
      agent_family: 'http_client',
      agent_kind: 'developer_tool',
      match_source: 'managed_list',
      shouldTrack: true,
      surface: 'skill',
    },
  },
  {
    name: 'unknown non-browser docs page request',
    input: { path: '/docs/api/authentication', userAgent: 'CustomFetcher/0.1' },
    expected: {
      agent_family: 'unknown_client',
      agent_kind: 'unknown_ai',
      match_source: 'unknown_ua',
      shouldTrack: true,
      surface: 'docs',
    },
  },
  {
    name: 'missing user agent docs page request',
    input: { path: '/docs/api/authentication' },
    expected: {
      agent_family: 'unknown_client',
      agent_kind: 'unknown_ai',
      match_source: 'unknown_ua',
      shouldTrack: true,
      surface: 'docs',
    },
  },
  {
    name: 'normal human docs page',
    input: {
      path: '/guide/payments',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
    },
    expected: {
      agent_kind: 'human',
      match_source: 'none',
      shouldTrack: false,
      surface: 'docs',
    },
  },
]

for (const item of cases) {
  test(`classifies docs request: ${item.name}`, () => {
    expect(classifyDocsRequest(item.input)).toMatchObject(item.expected)
  })
}
