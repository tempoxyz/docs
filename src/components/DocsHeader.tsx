'use client'

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useConfig } from 'vocs'
import { DOCS_SEARCH_PARAM } from '../lib/docs-search'
import { AmpLogo, ClaudeLogo, CodexLogo } from './AgentLogos'

type MegaLink = {
  label: string
  desc: string
  href: string
  icon: ReactNode
}

type MegaColumn = { title: string; items: MegaLink[] }
type MegaMenuData = { columns: MegaColumn[]; variant?: 'columns' | 'vertical' }
type MenuItem = { label: string; href: string; mega?: MegaMenuData }

const DOCS_BASE_PATH = '/docs'
const TEMPO_AI_GUIDE_URL = `${DOCS_BASE_PATH}/guide/using-tempo-with-ai`
const TEMPO_DOCS_SKILL_URL = `${TEMPO_AI_GUIDE_URL}#docs-skill`
const TEMPO_PLUGIN_URL = `${TEMPO_AI_GUIDE_URL}#install-tempo-plugins`
const TEMPO_MCP_URL = 'https://mcp.tempo.xyz'
const TEMPO_SDK_DOCS_URL = `${DOCS_BASE_PATH}/sdk`

function featurePath(slug: string) {
  const featurePaths: Record<string, string> = {
    transactions: '/build/tempo-transactions',
    tokens: '/build/tip20-tokens',
  }
  return featurePaths[slug] ?? '/build'
}

function isExternal(href: string) {
  return !href.startsWith('/') && !href.startsWith('#')
}

function normalizePath(pathname: string) {
  return pathname || '/'
}

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function usePathname() {
  const [pathname, setPathname] = useState('/')

  useLayoutEffect(() => {
    const update = () => setPathname(normalizePath(window.location.pathname))
    update()
    window.addEventListener('popstate', update)
    window.addEventListener('hashchange', update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener('hashchange', update)
    }
  }, [])

  return pathname
}

function isActiveMenuItem(pathname: string, item: MenuItem) {
  if (item.label === 'Build') return pathname === '/' || pathname.startsWith('/build')
  if (item.label === 'Resources')
    return pathname === '/docs/sdk' || pathname.startsWith('/docs/sdk/')
  if (item.label === 'Docs') return pathname === '/docs' || pathname.startsWith('/docs/')
  return !isExternal(item.href) && pathMatches(pathname, item.href)
}

function Anchor({
  href,
  children,
  onFocus,
  onPointerEnter,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <a {...props}>{children}</a>
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }
  return (
    <a
      {...props}
      href={href}
      onFocus={(event) => {
        prefetchPath(href)
        onFocus?.(event)
      }}
      onPointerEnter={(event) => {
        prefetchPath(href)
        onPointerEnter?.(event)
      }}
    >
      {children}
    </a>
  )
}

const prefetchedPaths = new Set<string>()

function appendLink(rel: string, href: string, attributes: Record<string, string> = {}) {
  if (typeof document === 'undefined') return
  const selector = `link[rel="${rel}"][href="${href}"]`
  if (document.head.querySelector(selector)) return

  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  for (const [name, value] of Object.entries(attributes)) {
    link.setAttribute(name, value)
  }
  document.head.appendChild(link)
}

function prefetchPath(href: string) {
  if (typeof document === 'undefined') return
  if (!href.startsWith('/') || prefetchedPaths.has(href)) return
  prefetchedPaths.add(href)

  appendLink('prefetch', href, { as: 'document' })
}

function warmMarketingApp() {
  prefetchPath('/')
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative external-link icon.
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M7 17 17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function TempoLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block bg-current ${className ?? ''}`}
      style={{
        aspectRatio: '102.461 / 23.2394',
        maskImage: "url('/stickers/sticker4/tempo.svg')",
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskImage: "url('/stickers/sticker4/tempo.svg')",
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative mega-menu icon.
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

function TransactionsIcon() {
  return (
    <Glyph>
      <path d="M7 8h10M14 5l3 3-3 3" />
      <path d="M17 16H7M10 13l-3 3 3 3" />
    </Glyph>
  )
}

function TokensIcon() {
  return (
    <Glyph>
      <circle cx="9.5" cy="12" r="4.5" />
      <circle cx="14.5" cy="12" r="4.5" />
    </Glyph>
  )
}

function DocsIcon() {
  return (
    <Glyph>
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Glyph>
  )
}

function WalletIcon() {
  return (
    <Glyph>
      <rect x="4" y="6.5" width="16" height="12" rx="2.5" />
      <path d="M4 9.5h12a2 2 0 0 1 2 2" />
      <circle cx="16.5" cy="12.5" r="1" />
    </Glyph>
  )
}

function ApiIcon() {
  return (
    <Glyph>
      <path d="M9 5c-2 0-2 2-2 3.4 0 1.4-.4 2.6-2 2.6 1.6 0 2 1.2 2 2.6C7 17 7 19 9 19" />
      <path d="M15 5c2 0 2 2 2 3.4 0 1.4.4 2.6 2 2.6-1.6 0-2 1.2-2 2.6C17 17 17 19 15 19" />
    </Glyph>
  )
}

function ExplorerIcon() {
  return (
    <Glyph>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m15 15 4 4" />
      <path d="M8.5 11h5M11 8.5v5" />
    </Glyph>
  )
}

function McpIcon() {
  return (
    <Glyph>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 7V4M15 7V4M9 20v-3M15 20v-3M7 9H4M7 15H4M20 9h-3M20 15h-3" />
    </Glyph>
  )
}

function TerminalIcon() {
  return (
    <Glyph>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10l2.5 2.5L8 15M13 15h3" />
    </Glyph>
  )
}

const protocolMenu: MegaMenuData = {
  variant: 'vertical',
  columns: [
    {
      title: 'Transactions',
      items: [
        {
          label: 'Tempo Transactions',
          desc: 'Flexible transactions for batching, fee sponsorship, scheduling, and more',
          href: featurePath('transactions'),
          icon: <TransactionsIcon />,
        },
      ],
    },
    {
      title: 'Assets & privacy',
      items: [
        {
          label: 'TIP-20 tokens',
          desc: 'Stablecoin-first token standard for payments',
          href: featurePath('tokens'),
          icon: <TokensIcon />,
        },
      ],
    },
  ],
}

const developersMenu: MegaMenuData = {
  columns: [
    {
      title: 'Documentation',
      items: [
        {
          label: 'Docs',
          desc: 'Guides, references & quickstart',
          href: DOCS_BASE_PATH,
          icon: <DocsIcon />,
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          label: 'Wallet',
          desc: 'A Tempo-first wallet for your agents',
          href: 'https://wallet.tempo.xyz',
          icon: <WalletIcon />,
        },
        {
          label: 'TIDX',
          desc: 'Raw indexer queries & event streams',
          href: `${DOCS_BASE_PATH}/developer-tools/indexer`,
          icon: <ApiIcon />,
        },
        {
          label: 'Tempo Explorer',
          desc: 'Search blocks, txs & tokens',
          href: 'https://explorer.tempo.xyz',
          icon: <ExplorerIcon />,
        },
      ],
    },
    {
      title: 'Libraries',
      items: [
        {
          label: 'MPP',
          desc: 'Open protocol for agentic payments',
          href: 'https://mpp.dev/',
          icon: <McpIcon />,
        },
        {
          label: 'SDKs',
          desc: 'TypeScript, Rust, Go & Foundry',
          href: TEMPO_SDK_DOCS_URL,
          icon: <TerminalIcon />,
        },
      ],
    },
  ],
}

const menu: MenuItem[] = [
  { label: 'Build', href: '/#protocol', mega: protocolMenu },
  { label: 'Resources', href: `${DOCS_BASE_PATH}/guide`, mega: developersMenu },
  { label: 'Performance', href: '/performance' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: DOCS_BASE_PATH },
]

function ActiveSquare({ activeKey }: { activeKey: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative active-state indicator.
    <svg
      key={activeKey}
      viewBox="0 0 11 11"
      aria-hidden
      className="nav-active-square size-[11px] shrink-0 text-foreground/70"
    >
      {[0, 4, 8].flatMap((y) =>
        [0, 4, 8].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={3} height={3} fill="currentColor" />
        )),
      )}
    </svg>
  )
}

function MegaItem({ link }: { link: MegaLink }) {
  const external = isExternal(link.href)
  return (
    <Anchor
      href={link.href}
      className="group/item relative flex items-start gap-3 rounded-[4px] px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]"
    >
      {external ? (
        <ArrowUpRight className="absolute top-2.5 right-3 size-3 text-foreground/35 transition-colors group-hover/item:text-foreground/60" />
      ) : null}
      <span className="grid size-[34px] shrink-0 place-items-center bg-surface-input text-foreground">
        {link.icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-sans text-[14px] text-foreground tracking-[0]">{link.label}</span>
        <span className="font-sans text-[13px] text-foreground/45 leading-[1.4] tracking-[0]">
          {link.desc}
        </span>
      </span>
    </Anchor>
  )
}

function MegaMenu({ data }: { data: MegaMenuData }) {
  const columns = data.columns

  if (data.variant === 'vertical') {
    return (
      <div className="w-[360px] p-3">
        <ul className="flex flex-col gap-1">
          {columns
            .flatMap((column) => column.items)
            .map((item) => (
              <li key={item.label}>
                <MegaItem link={item} />
              </li>
            ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex w-max gap-1 p-3">
      {columns.map((column) => {
        return (
          <div key={column.title} className="w-[224px]">
            <ul>
              {column.items.map((item) => (
                <li key={item.label}>
                  <MegaItem link={item} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function MenuIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Button provides the accessible label.
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Button provides the accessible label.
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className ?? ''}`}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

// The custom DocsHeader replaces Vocs' default top nav, whose hidden
// `[data-v-gutter-top]` container still mounts Vocs' built-in `<Search />`
// (it owns a global Cmd/Ctrl+K listener and the search dialog). Rather than
// importing that internal, unexported component, we re-expose the affordance by
// dispatching the same shortcut Vocs already handles. See src/pages/_root.css
// where the gutter is hidden, and node_modules/vocs Search.tsx for the listener.
//
// Returns true when Vocs handled the shortcut (it calls `preventDefault`, so
// `dispatchEvent` returns false). The shortcut *toggles* the dialog, so callers
// must only dispatch once per intended open.
function dispatchDocsSearchShortcut() {
  if (typeof document === 'undefined') return false
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    code: 'KeyK',
    bubbles: true,
    cancelable: true,
    // Vocs checks `metaKey || ctrlKey`, so set both and skip platform detection.
    metaKey: true,
    ctrlKey: true,
  })
  return !document.dispatchEvent(event)
}

function openDocsSearch() {
  if (!dispatchDocsSearchShortcut() && import.meta.env.DEV) {
    console.warn(
      'Vocs search did not handle Cmd/Ctrl+K. Verify the hidden Vocs top-nav search is still mounted (showTopNav/showSearch).',
    )
  }
}

// Used when arriving from the marketing site via `?search` (see lib/docs-search):
// the Vocs Search instance may not have attached its keydown listener yet on the
// first paint, so retry across a few frames until the dialog opens. We stop on
// the first success to avoid the toggle re-closing it.
function openDocsSearchWhenReady(attempt = 0) {
  if (dispatchDocsSearchShortcut()) return
  if (attempt >= 30) {
    if (import.meta.env.DEV) {
      console.warn('Vocs search did not open after navigation; the search instance never mounted.')
    }
    return
  }
  requestAnimationFrame(() => openDocsSearchWhenReady(attempt + 1))
}

function CloseIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Button provides the accessible label.
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GearIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative icon next to visible text.
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2.1 2.1 0 1 1-2.97 2.97l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2.1 2.1 0 1 1-4.2 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2.1 2.1 0 1 1-2.97-2.97l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2.1 2.1 0 1 1 0-4.2h.09A1.7 1.7 0 0 0 4.6 8.74a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2.1 2.1 0 1 1 2.97-2.97l.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10.14 2.7V2.6a2.1 2.1 0 1 1 4.2 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2.1 2.1 0 1 1 2.97 2.97l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.09a2.1 2.1 0 1 1 0 4.2h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative disclosure icon; button exposes expanded state.
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`shrink-0 text-foreground/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Parent copy button provides the accessible label.
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="5.25"
        y="5.25"
        width="8.5"
        height="8.5"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M10.75 3.25V3C10.75 1.9 9.85 1 8.75 1H3C1.9 1 1 1.9 1 3V8.75C1 9.85 1.9 10.75 3 10.75H3.25"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Parent copy button provides the accessible label.
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8.5L6.5 12L13 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const mcpCommands = [
  {
    label: 'Claude',
    logo: <ClaudeLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    prefix: 'claude mcp add --transport http tempo ',
  },
  {
    label: 'Codex',
    logo: <CodexLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    prefix: 'codex mcp add tempo --url ',
  },
  {
    label: 'Amp',
    logo: <AmpLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    prefix: 'amp mcp add --transport http tempo ',
  },
]

const pluginCommands = [
  {
    label: 'Codex',
    logo: <CodexLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    command: 'codex plugin marketplace add tempoxyz/docs\ncodex plugin add tempo@docs',
  },
  {
    label: 'Claude',
    logo: <ClaudeLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    command: 'claude plugin marketplace add tempoxyz/docs\nclaude plugin install tempo@claude',
  },
]

const docsSkillCommand = 'npx skills add tempoxyz/docs'

function CommandTabs({
  commands,
  activeIndex,
  onSelect,
}: {
  commands: { label: string; logo: ReactNode }[]
  activeIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {commands.map((item, index) => {
        const active = index === activeIndex
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect(index)}
            className={`inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 font-sans text-[12px] tracking-[0] transition-colors ${
              active
                ? 'bg-foreground/[0.06] text-foreground'
                : 'text-foreground/40 hover:bg-foreground/[0.03] hover:text-foreground/70'
            }`}
          >
            {item.logo}
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function CommandSnippet({
  command,
  copyLabel,
  copied,
  onCopy,
  children,
}: {
  command: string
  copyLabel: string
  copied: boolean
  onCopy: (command: string) => void
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(command)}
      aria-label={copyLabel}
      className="group/copy flex min-h-[48px] w-full items-start gap-3 rounded-[4px] bg-foreground/[0.035] px-3 py-2.5 text-left transition-colors hover:bg-foreground/[0.06]"
    >
      <code className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] gap-2 whitespace-pre-wrap break-words font-mono text-[12px] text-foreground leading-[1.55]">
        <span aria-hidden="true" className="select-none text-foreground/35">
          $
        </span>
        <span className="min-w-0">{children ?? command}</span>
      </code>
      <span
        className={`mt-1 shrink-0 transition-colors ${copied ? 'text-foreground' : 'text-foreground/35 group-hover/copy:text-foreground/70'}`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </button>
  )
}

function AgentCommandSection(props: {
  href: string
  label: string
  desc: string
  icon: ReactNode
  onClick?: () => void
  children?: ReactNode
}) {
  const { href, label, desc, icon, onClick, children } = props
  const external = isExternal(href)

  return (
    <div className="group/item rounded-[4px] px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]">
      <div className="flex items-start gap-3">
        <span className="grid size-[34px] shrink-0 place-items-center bg-surface-input text-foreground">
          {icon}
        </span>
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          onClick={onClick}
          className="relative flex min-w-0 flex-col gap-0.5 pr-5"
        >
          {external ? (
            <ArrowUpRight className="absolute top-0.5 right-0 size-3 text-foreground/35 transition-colors group-hover/item:text-foreground/60" />
          ) : null}
          <span className="font-sans text-[14px] text-foreground tracking-[0]">{label}</span>
          <span className="font-sans text-[13px] text-foreground/45 leading-[1.4] tracking-[0]">
            {desc}
          </span>
        </a>
      </div>
      {children ? <div className="mt-3 ml-[52px] space-y-3">{children}</div> : null}
    </div>
  )
}

function AgentsPanel({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}) {
  const desktop = variant === 'desktop'
  const [activeMcpCommandIndex, setActiveMcpCommandIndex] = useState(0)
  const [activePluginCommandIndex, setActivePluginCommandIndex] = useState(0)
  const [copiedCommandKey, setCopiedCommandKey] = useState<string | null>(null)
  const activeMcpCommand = mcpCommands[activeMcpCommandIndex]
  const activePluginCommand = pluginCommands[activePluginCommandIndex]

  const copyCommand = async (key: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedCommandKey(key)
      setTimeout(() => {
        setCopiedCommandKey((current) => (current === key ? null : current))
      }, 1500)
    } catch {}
  }

  return (
    <div className={desktop ? 'w-[520px] p-3' : 'pb-4 pl-3'}>
      {desktop ? (
        <p className="px-3 pt-2 pb-1.5 font-sans text-[13px] text-foreground/35 tracking-[0]">
          Use Tempo with AI
        </p>
      ) : null}
      <div className="space-y-1">
        <div className="rounded-[4px] px-3 py-2.5">
          <div className="flex items-start gap-3">
            <span className="grid size-[34px] shrink-0 place-items-center bg-surface-input text-foreground">
              <McpIcon />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-sans text-[14px] text-foreground tracking-[0]">
                Tempo MCP server
              </span>
              <span className="font-sans text-[13px] text-foreground/45 leading-[1.4] tracking-[0]">
                Give agents search and read tools for Tempo docs
              </span>
            </span>
          </div>
          <div className="mt-3 ml-[52px] space-y-3">
            <CommandTabs
              commands={mcpCommands}
              activeIndex={activeMcpCommandIndex}
              onSelect={(index) => {
                setActiveMcpCommandIndex(index)
                setCopiedCommandKey(null)
              }}
            />
            <CommandSnippet
              command={activeMcpCommand.prefix + TEMPO_MCP_URL}
              copyLabel="Copy Tempo MCP install command"
              copied={copiedCommandKey === 'mcp'}
              onCopy={(command) => copyCommand('mcp', command)}
            >
              {activeMcpCommand.prefix}
              <span className="text-foreground/65">{TEMPO_MCP_URL}</span>
            </CommandSnippet>
          </div>
        </div>
        <AgentCommandSection
          href={TEMPO_PLUGIN_URL}
          label="Tempo plugin"
          desc="Install MCP, workflow skills, and editor metadata"
          icon={<TerminalIcon />}
          onClick={onNavigate}
        >
          <CommandTabs
            commands={pluginCommands}
            activeIndex={activePluginCommandIndex}
            onSelect={(index) => {
              setActivePluginCommandIndex(index)
              setCopiedCommandKey(null)
            }}
          />
          <CommandSnippet
            command={activePluginCommand.command}
            copyLabel="Copy Tempo plugin install commands"
            copied={copiedCommandKey === 'plugin'}
            onCopy={(command) => copyCommand('plugin', command)}
          />
        </AgentCommandSection>
        <AgentCommandSection
          href={TEMPO_DOCS_SKILL_URL}
          label="Tempo Docs skill"
          desc="Add docs, examples, and source context"
          icon={<DocsIcon />}
          onClick={onNavigate}
        >
          <CommandSnippet
            command={docsSkillCommand}
            copyLabel="Copy Tempo Docs skill install command"
            copied={copiedCommandKey === 'docs-skill'}
            onCopy={(command) => copyCommand('docs-skill', command)}
          />
        </AgentCommandSection>
      </div>
    </div>
  )
}

function megaLinks(data: MegaMenuData) {
  return data.columns.flatMap((column) => column.items)
}

type SidebarNode = {
  text?: string
  link?: string
  collapsed?: boolean
  items?: SidebarNode[]
}

// The docs sidebar is configured in vocs.config.ts (keyed by path). Resolve the
// entry that best matches the current path so the mobile menu mirrors the
// desktop sidebar.
export function resolveSidebarItems(sidebar: unknown, pathname: string): SidebarNode[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar as SidebarNode[]
  if (typeof sidebar !== 'object') return []

  const entries = sidebar as Record<string, SidebarNode[] | { items?: SidebarNode[] }>
  let bestKey: string | null = null
  for (const key of Object.keys(entries)) {
    if (pathname === key || pathname.startsWith(key === '/' ? '/' : `${key}/`)) {
      if (bestKey === null || key.length > bestKey.length) bestKey = key
    }
  }
  const entry = entries[bestKey ?? '/docs'] ?? Object.values(entries)[0]
  if (!entry) return []
  return Array.isArray(entry) ? entry : (entry.items ?? [])
}

// Vocs treats a sidebar link as active only on an exact path match (ignoring
// trailing slashes), so an index link like `/docs` doesn't light up on every
// sub-page.
function pathIsExact(pathname: string, link: string) {
  return pathname.replace(/\/+$/, '') === link.replace(/\/+$/, '')
}

function nodeContainsActive(node: SidebarNode, pathname: string): boolean {
  if (node.link && pathIsExact(pathname, node.link)) return true
  return Boolean(node.items?.some((child) => nodeContainsActive(child, pathname)))
}

function SidebarLeaf({
  node,
  pathname,
  depth,
  onNavigate,
}: {
  node: SidebarNode
  pathname: string
  depth: number
  onNavigate: () => void
}) {
  const active = node.link ? pathIsExact(pathname, node.link) : false
  const external = node.link ? isExternal(node.link) : false
  return (
    <Anchor
      href={node.link ?? '#'}
      onClick={onNavigate}
      style={{ paddingLeft: depth > 1 ? `${(depth - 1) * 12}px` : undefined }}
      className={`flex items-center gap-1.5 py-2 font-sans text-[15px] tracking-[0] transition-colors ${
        active ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'
      }`}
    >
      {active ? <ActiveSquare activeKey={pathname} /> : null}
      {node.text}
      {external ? <ArrowUpRight className="mt-0.5 size-3" /> : null}
    </Anchor>
  )
}

export function SidebarNodes({
  nodes,
  pathname,
  depth,
  onNavigate,
}: {
  nodes: SidebarNode[]
  pathname: string
  depth: number
  onNavigate: () => void
}) {
  return (
    <>
      {nodes.map((node, i) => {
        const key = `${node.text ?? node.link ?? 'node'}-${i}`
        const hasChildren = Array.isArray(node.items) && node.items.length > 0

        // Leaf link.
        if (!hasChildren) {
          return (
            <SidebarLeaf
              key={key}
              node={node}
              pathname={pathname}
              depth={depth}
              onNavigate={onNavigate}
            />
          )
        }

        // Non-collapsible section (e.g. "Build on Tempo"): a heading + children.
        if (node.collapsed === undefined) {
          return (
            <div key={key} className={depth === 0 ? 'mt-5 first:mt-0' : 'mt-2'}>
              <p className="py-2 font-sans text-[15px] text-foreground tracking-[0]">{node.text}</p>
              <SidebarNodes
                nodes={node.items ?? []}
                pathname={pathname}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            </div>
          )
        }

        // Collapsible subgroup (e.g. "Make Payments"): expandable disclosure.
        const open = !node.collapsed || nodeContainsActive(node, pathname)
        return (
          <details
            key={key}
            open={open}
            className="group/sb"
            style={{ paddingLeft: depth > 1 ? `${(depth - 1) * 12}px` : undefined }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-sans text-[15px] text-foreground/50 tracking-[0] transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
              {node.text}
              <Chevron open={false} />
            </summary>
            <SidebarNodes
              nodes={node.items ?? []}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          </details>
        )
      })}
    </>
  )
}

export default function DocsHeader() {
  const pathname = usePathname()
  const config = useConfig()
  const docsSidebarItems = resolveSidebarItems(config?.sidebar, pathname)
  const showApiLogo = pathname === '/api' || pathname.startsWith('/api/')
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [geom, setGeom] = useState<{ x: number; w: number; h: number } | null>(null)
  const [morphing, setMorphing] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const triggerRefs = useRef(new Map<string, HTMLElement>())
  const panelRefs = useRef(new Map<string, HTMLDivElement>())
  const prevActive = useRef<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const openMenu = (key: string) => {
    cancelClose()
    setActiveMenu(key)
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }

  useLayoutEffect(() => {
    if (!activeMenu) {
      prevActive.current = null
      return
    }
    const panel = panelRefs.current.get(activeMenu)
    const trigger = triggerRefs.current.get(activeMenu)
    const header = headerRef.current
    if (!panel || !trigger || !header) return
    const w = panel.offsetWidth
    const h = panel.offsetHeight
    const triggerRect = trigger.getBoundingClientRect()
    const headerRect = header.getBoundingClientRect()
    const raw =
      activeMenu === 'For agents'
        ? triggerRect.right - headerRect.left - w
        : triggerRect.left - headerRect.left + triggerRect.width / 2 - w / 2
    const x = Math.round(Math.min(Math.max(raw, 12), headerRect.width - w - 12))
    setMorphing(prevActive.current !== null)
    setGeom({ x, w, h })
    prevActive.current = activeMenu
  }, [activeMenu])

  const dropdowns: { key: string; panel: ReactNode }[] = [
    ...menu.flatMap((item) =>
      item.mega ? [{ key: item.label, panel: <MegaMenu data={item.mega} /> }] : [],
    ),
    { key: 'For agents', panel: <AgentsPanel /> },
  ]

  const close = () => {
    setOpen(false)
    setExpanded(null)
  }

  const openSearch = () => {
    cancelClose()
    setActiveMenu(null)
    close()
    openDocsSearch()
  }

  useEffect(() => {
    warmMarketingApp()
  }, [])

  // Open the search dialog when arriving from the marketing site's search CTA
  // (which navigates to `/docs?search=1`). Strip the param so refresh/back
  // doesn't reopen it.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (!params.has(DOCS_SEARCH_PARAM)) return
    params.delete(DOCS_SEARCH_PARAM)
    const query = params.toString()
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    )
    openDocsSearchWhenReady()
  }, [])

  return (
    <header className="docs-site-header fixed top-0 right-0 left-0 z-[60] bg-background">
      <div className="w-full border-line border-x bg-surface-shell">
        <nav
          ref={headerRef}
          className="relative flex items-center justify-between border-line border-b px-5 py-4"
        >
          <a
            href="/"
            onClick={close}
            onFocus={warmMarketingApp}
            onPointerEnter={warmMarketingApp}
            className="group flex h-9 items-center text-foreground"
            aria-label="Tempo home"
          >
            {showApiLogo ? (
              <span className="flex items-center gap-2">
                <TempoLogo className="h-[18px] w-[80px]" />
                <span
                  aria-hidden
                  className="flex h-[18px] items-center bg-[#2b2b2b] px-[5px] font-mono text-[12px] text-[#b2b2b2] leading-none tracking-[0]"
                >
                  API
                </span>
              </span>
            ) : (
              <TempoLogo className="h-[18px] w-[80px]" />
            )}
          </a>

          <ul className="hidden items-center gap-16 lg:absolute lg:top-1/2 lg:left-1/2 lg:flex lg:-translate-x-1/2 lg:-translate-y-1/2">
            {menu.map((item) => {
              const active = isActiveMenuItem(pathname, item)
              const triggerContent = (
                <>
                  {active ? (
                    <span className="absolute top-1/2 -left-[17px] -translate-y-1/2">
                      <ActiveSquare activeKey={pathname} />
                    </span>
                  ) : null}
                  {item.label}
                  {item.mega ? (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative disclosure icon; button exposes expanded state.
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      className={`shrink-0 text-foreground/40 transition-transform duration-200 ease-out ${activeMenu === item.label ? 'rotate-180' : ''}`}
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </>
              )

              return (
                <li
                  key={item.label}
                  onMouseEnter={item.mega ? () => openMenu(item.label) : scheduleClose}
                  onMouseLeave={item.mega ? scheduleClose : undefined}
                >
                  {item.mega ? (
                    <button
                      ref={(element) => {
                        if (element) triggerRefs.current.set(item.label, element)
                        else triggerRefs.current.delete(item.label)
                      }}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={activeMenu === item.label}
                      onFocus={() => openMenu(item.label)}
                      onBlur={scheduleClose}
                      className="relative flex items-center gap-1.5 font-sans text-[14px] text-foreground tracking-[0] transition-opacity hover:opacity-70"
                    >
                      {triggerContent}
                    </button>
                  ) : (
                    <Anchor
                      href={item.href}
                      className="relative flex items-center gap-1.5 font-sans text-[14px] text-foreground tracking-[0] transition-opacity hover:opacity-70"
                    >
                      {triggerContent}
                    </Anchor>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search documentation"
              aria-keyshortcuts="Meta+K Control+K"
              className="flex h-9 items-center gap-2 rounded-[4px] border border-line px-4 font-sans text-[14px] text-foreground/60 tracking-[0] transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <SearchIcon />
              Search
              <kbd className="ml-1 rounded-[3px] border border-line px-1.5 py-0.5 font-sans text-[11px] text-foreground/45">
                ⌘K
              </kbd>
            </button>
            <button
              ref={(element) => {
                if (element) triggerRefs.current.set('For agents', element)
                else triggerRefs.current.delete('For agents')
              }}
              type="button"
              aria-haspopup="true"
              aria-expanded={activeMenu === 'For agents'}
              onMouseEnter={() => openMenu('For agents')}
              onMouseLeave={scheduleClose}
              onFocus={() => openMenu('For agents')}
              onBlur={scheduleClose}
              className="flex h-9 items-center gap-2 rounded-[4px] border border-line px-4 font-sans text-[14px] text-foreground tracking-[0] transition-colors hover:bg-foreground/[0.04]"
            >
              <GearIcon />
              For agents
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: Decorative disclosure icon; button exposes expanded state. */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className={`shrink-0 text-foreground/40 transition-transform duration-200 ease-out ${activeMenu === 'For agents' ? 'rotate-180' : ''}`}
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search documentation"
              aria-keyshortcuts="Meta+K Control+K"
              className="grid size-8 place-items-center text-foreground"
            >
              <SearchIcon className="size-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid size-8 place-items-center text-foreground"
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
      </div>

      <div className="pointer-events-none absolute top-full right-0 left-0 z-50 hidden lg:block">
        <div className="w-full">
          <div
            className={`transition duration-200 ease-out will-change-[opacity,transform,filter] motion-reduce:transition-none ${
              activeMenu
                ? 'translate-y-0 opacity-100 [filter:blur(0px)]'
                : '-translate-y-2 opacity-0 [filter:blur(8px)]'
            }`}
          >
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Hover bridge keeps the shared menu surface open. */}
            <div
              role="presentation"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              onFocus={cancelClose}
              onBlur={scheduleClose}
              style={{ transform: `translateX(${geom?.x ?? 0}px)` }}
              className={`w-max pt-3 ${activeMenu ? 'pointer-events-auto' : ''} ${morphing ? 'transition-transform duration-200 ease-out motion-reduce:transition-none' : ''}`}
            >
              <div
                style={{ width: geom?.w, height: geom?.h }}
                className={`relative overflow-hidden rounded-md border border-line bg-surface-page shadow-2xl ${
                  morphing
                    ? 'transition-[width,height] duration-200 ease-out motion-reduce:transition-none'
                    : ''
                }`}
              >
                {dropdowns.map(({ key, panel }) => (
                  <div
                    key={key}
                    ref={(element) => {
                      if (element) panelRefs.current.set(key, element)
                      else panelRefs.current.delete(key)
                    }}
                    className={`absolute top-0 left-0 w-max transition-opacity duration-150 ease-out motion-reduce:transition-none ${
                      activeMenu === key ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  >
                    {panel}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute top-full right-0 left-0 z-40 origin-top transition duration-200 ease-out lg:hidden ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="flex h-[calc(100dvh-var(--vocs-spacing-topNav,65px))] w-full flex-col overflow-y-auto border-line border-x border-b bg-background px-5 pb-5">
          {menu.map((item) => {
            const active = isActiveMenuItem(pathname, item)
            // The "Docs" item is the entry point to the docs sidebar: on docs
            // pages it expands inline to reveal the page tree instead of being a
            // plain link, matching the mega-menu accordion pattern.
            const isDocsEntry = item.label === 'Docs' && docsSidebarItems.length > 0
            if (isDocsEntry) {
              return (
                <div key={item.label} className="border-line border-t">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((value) => (value === item.label ? null : item.label))
                    }
                    aria-expanded={expanded === item.label}
                    className="flex w-full items-center justify-between py-4 font-sans text-[16px] text-foreground tracking-[0]"
                  >
                    <span className="flex items-center gap-2">
                      {active ? <ActiveSquare activeKey={pathname} /> : null}
                      {item.label}
                    </span>
                    <Chevron open={expanded === item.label} />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${expanded === item.label ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="flex flex-col pb-2 pl-3">
                        <SidebarNodes
                          nodes={docsSidebarItems}
                          pathname={pathname}
                          depth={0}
                          onNavigate={close}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
            return item.mega ? (
              <div key={item.label} className="border-line border-t">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => (value === item.label ? null : item.label))}
                  aria-expanded={expanded === item.label}
                  className="flex w-full items-center justify-between py-4 font-sans text-[16px] text-foreground tracking-[0]"
                >
                  <span className="flex items-center gap-2">
                    {active ? <ActiveSquare activeKey={pathname} /> : null}
                    {item.label}
                  </span>
                  <Chevron open={expanded === item.label} />
                </button>
                <div
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${expanded === item.label ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-col gap-3 pb-4 pl-3">
                      {megaLinks(item.mega).map((sub) => (
                        <Anchor
                          key={sub.label}
                          href={sub.href}
                          onClick={close}
                          className="flex items-start gap-1.5 font-sans text-[15px] text-foreground/50 tracking-[0] transition-colors hover:text-foreground"
                        >
                          {sub.label}
                          {isExternal(sub.href) ? <ArrowUpRight className="mt-0.5 size-3" /> : null}
                        </Anchor>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Anchor
                key={item.label}
                href={item.href}
                onClick={close}
                className="flex items-start gap-1.5 border-line border-t py-4 font-sans text-[16px] text-foreground tracking-[0]"
              >
                {active ? <ActiveSquare activeKey={pathname} /> : null}
                {item.label}
              </Anchor>
            )
          })}
          <div className="border-line border-t">
            <button
              type="button"
              onClick={() => setExpanded((value) => (value === 'For agents' ? null : 'For agents'))}
              aria-expanded={expanded === 'For agents'}
              className="flex w-full items-center justify-between py-4 font-sans text-[16px] text-foreground tracking-[0]"
            >
              For agents
              <Chevron open={expanded === 'For agents'} />
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${expanded === 'For agents' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="min-h-0 overflow-hidden">
                <AgentsPanel variant="mobile" onNavigate={close} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
