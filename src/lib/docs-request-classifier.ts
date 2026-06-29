export type DocsRequestSurface =
  /** Root LLM indexes: /llms.txt and /llms-full.txt. */
  | 'llms'
  /** Markdown renderings of docs pages, requested with a .md suffix. */
  | 'markdown'
  /** Built-in Vocs MCP endpoint under /api/mcp. */
  | 'mcp'
  /** Agent skill entrypoint, currently /SKILL.md. */
  | 'skill'
  /** Standards discovery paths such as /.well-known/oauth-protected-resource. */
  | 'well_known'
  /** Human-readable docs pages without file extensions. */
  | 'docs'
  /** Static assets, unrelated APIs, and anything outside known docs surfaces. */
  | 'other'

export type DocsRequestAgentKind =
  /** Background crawler that may index content for future model/search use. */
  | 'crawler'
  /** Search/index fetcher used to power cited or search-grounded answers. */
  | 'search'
  /** User-triggered URL fetch from an AI product. */
  | 'user_fetch'
  /** Local or hosted coding-agent client, such as Claude Code MCP transport. */
  | 'developer_tool'
  /** AI-looking request without a more specific known client signal. */
  | 'unknown_ai'
  /** Ordinary browser/docs traffic that should not be server-side tracked here. */
  | 'human'

export type DocsRequestMatchSource =
  /** UA token documented by the crawler/vendor as an official bot/fetcher. */
  | 'official_ua'
  /** UA token observed or documented for developer clients, but not crawler-official. */
  | 'managed_list'
  /** Referer host belongs to a known AI product. */
  | 'ai_referrer'
  /** Unknown client requested a machine-readable agent surface. */
  | 'agent_surface'
  /** Unknown user agent without a known attribution rule. */
  | 'unknown_ua'
  /** No server-side agent signal matched. */
  | 'none'

export type DocsRequestClassification = {
  surface: DocsRequestSurface
  agent_family?: string
  agent_kind?: DocsRequestAgentKind
  match_source: DocsRequestMatchSource
  referer_host?: string
  shouldTrack: boolean
}

type UserAgentRule = {
  token: string
  agent_family: string
  agent_kind: Exclude<DocsRequestAgentKind, 'human' | 'unknown_ai'>
}

/** Official crawler/search/fetch user-agent tokens from provider documentation. */
const OFFICIAL_USER_AGENT_RULES: readonly UserAgentRule[] = [
  /** OpenAI search crawler for linking/citation surfaces. */
  { token: 'OAI-SearchBot', agent_family: 'openai', agent_kind: 'search' },
  /** OpenAI training/indexing crawler. */
  { token: 'GPTBot', agent_family: 'openai', agent_kind: 'crawler' },
  /** OpenAI user-triggered fetcher from ChatGPT browsing/actions. */
  { token: 'ChatGPT-User', agent_family: 'openai', agent_kind: 'user_fetch' },
  /** Anthropic search crawler for Claude search/citation surfaces. */
  { token: 'Claude-SearchBot', agent_family: 'anthropic', agent_kind: 'search' },
  /** Anthropic user-triggered fetcher from Claude. */
  { token: 'Claude-User', agent_family: 'anthropic', agent_kind: 'user_fetch' },
  /** Anthropic training/indexing crawler. */
  { token: 'ClaudeBot', agent_family: 'anthropic', agent_kind: 'crawler' },
  /** Perplexity background crawler. */
  { token: 'PerplexityBot', agent_family: 'perplexity', agent_kind: 'crawler' },
  /** Perplexity user-triggered fetcher. */
  { token: 'Perplexity-User', agent_family: 'perplexity', agent_kind: 'user_fetch' },
  /** Google Vertex AI crawler. */
  { token: 'Google-CloudVertexBot', agent_family: 'google', agent_kind: 'crawler' },
  /** Google generic crawler used by non-search products. */
  { token: 'GoogleOther', agent_family: 'google', agent_kind: 'crawler' },
  /** Google Search crawler. */
  { token: 'Googlebot', agent_family: 'google', agent_kind: 'search' },
]

/**
 * Developer-tool clients that are useful for docs analytics but are not
 * official crawler identities. Keep these prefix-like and sparse.
 */
const MANAGED_CLIENT_USER_AGENT_RULES: readonly UserAgentRule[] = [
  /** Claude Code CLI HTTP/MCP transport, versioned as claude-code/<version> (cli). */
  { token: 'claude-code/', agent_family: 'anthropic', agent_kind: 'developer_tool' },
  /** Proposed/forked Codex MCP UA; current Codex may omit UA on remote MCP requests. */
  { token: 'codex-mcp-client/', agent_family: 'openai', agent_kind: 'developer_tool' },
  /** Common Codex MCP workaround UA set manually via http_headers. */
  { token: 'codex-mcp/', agent_family: 'openai', agent_kind: 'developer_tool' },
  /** Common JavaScript HTTP client used by local agents and scripts. */
  { token: 'axios/', agent_family: 'http_client', agent_kind: 'developer_tool' },
  /** Node.js fetch-like HTTP client used by local agents and scripts. */
  { token: 'node-fetch/', agent_family: 'http_client', agent_kind: 'developer_tool' },
  /** Node.js HTTP client used by local agents and scripts. */
  { token: 'got/', agent_family: 'http_client', agent_kind: 'developer_tool' },
  /** Node.js HTTP client used by local agents and scripts. */
  { token: 'got ', agent_family: 'http_client', agent_kind: 'developer_tool' },
  /** CLI HTTP client often used by agents and docs-ingestion scripts. */
  { token: 'curl/', agent_family: 'http_client', agent_kind: 'developer_tool' },
  /** Python HTTP client often used by agents and docs-ingestion scripts. */
  { token: 'python-requests/', agent_family: 'http_client', agent_kind: 'developer_tool' },
  /** Python HTTP client often used by async agents and docs-ingestion scripts. */
  { token: 'aiohttp/', agent_family: 'http_client', agent_kind: 'developer_tool' },
  /** Go default HTTP client used by command-line tooling and agents. */
  { token: 'Go-http-client/', agent_family: 'http_client', agent_kind: 'developer_tool' },
]

/** AI product hosts that can refer humans into the docs after an answer/citation. */
const AI_REFERRER_HOSTS = [
  /** ChatGPT web app and shared conversations. */
  'chatgpt.com',
  /** Claude web app. */
  'claude.ai',
  /** Perplexity answer pages. */
  'perplexity.ai',
  /** Gemini web app. */
  'gemini.google.com',
  /** Microsoft Copilot web app. */
  'copilot.microsoft.com',
  /** Poe bot/chat pages. */
  'poe.com',
]

export function classifyDocsRequest(input: {
  path: string
  userAgent?: string
  referer?: string
}): DocsRequestClassification {
  const surface = classifySurface(input.path)
  const userAgentMatch = matchUserAgent(input.userAgent)
  const refererHost = getRefererHost(input.referer)
  const hasAiReferrer = refererHost ? isAiReferrerHost(refererHost) : false
  const isAgentSurface = surface !== 'docs' && surface !== 'other'

  if (userAgentMatch) {
    return {
      ...userAgentMatch,
      surface,
      referer_host: refererHost,
      shouldTrack: true,
    }
  }

  if (hasAiReferrer) {
    return {
      agent_kind: 'unknown_ai',
      match_source: 'ai_referrer',
      referer_host: refererHost,
      surface,
      shouldTrack: true,
    }
  }

  if (isAgentSurface) {
    return {
      match_source: 'agent_surface',
      referer_host: refererHost,
      surface,
      shouldTrack: true,
    }
  }

  if (surface === 'docs' && isUnknownUserAgent(input.userAgent)) {
    return {
      agent_family: 'unknown_client',
      agent_kind: 'unknown_ai',
      match_source: 'unknown_ua',
      referer_host: refererHost,
      surface,
      shouldTrack: true,
    }
  }

  return {
    agent_kind: 'human',
    match_source: 'none',
    referer_host: refererHost,
    surface,
    shouldTrack: false,
  }
}

function classifySurface(path: string): DocsRequestSurface {
  const pathname = path.toLowerCase()

  if (pathname === '/llms.txt' || pathname === '/llms-full.txt') return 'llms'
  if (pathname === '/api/mcp' || pathname.startsWith('/api/mcp/')) return 'mcp'
  if (pathname === '/skill.md') return 'skill'
  if (pathname.startsWith('/.well-known/')) return 'well_known'
  if (pathname.endsWith('.md')) return 'markdown'
  if (isDocsPage(pathname)) return 'docs'
  return 'other'
}

function isDocsPage(pathname: string) {
  const lastSegment = pathname.split('/').pop() ?? ''
  return !lastSegment.includes('.')
}

function matchUserAgent(userAgent = '') {
  const normalizedUserAgent = userAgent.toLowerCase()
  const officialRule = OFFICIAL_USER_AGENT_RULES.find((candidate) =>
    normalizedUserAgent.includes(candidate.token.toLowerCase()),
  )

  if (officialRule) return formatUserAgentMatch(officialRule, 'official_ua')

  const managedRule = MANAGED_CLIENT_USER_AGENT_RULES.find((candidate) =>
    normalizedUserAgent.includes(candidate.token.toLowerCase()),
  )

  if (managedRule) return formatUserAgentMatch(managedRule, 'managed_list')
}

function isUnknownUserAgent(userAgent = '') {
  return !userAgent.toLowerCase().includes('mozilla/5.0')
}

function formatUserAgentMatch(rule: UserAgentRule, matchSource: 'official_ua' | 'managed_list') {
  return {
    agent_family: rule.agent_family,
    agent_kind: rule.agent_kind,
    match_source: matchSource,
  }
}

function getRefererHost(referer?: string) {
  if (!referer) return

  try {
    return new URL(referer).hostname.toLowerCase()
  } catch {
    return
  }
}

function isAiReferrerHost(host: string) {
  return AI_REFERRER_HOSTS.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))
}
