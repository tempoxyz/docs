// biome-ignore-all lint/a11y/noSvgWithoutTitle: Header SVGs are decorative icons paired with labels or button text.
// biome-ignore-all lint/a11y/noStaticElementInteractions: The dropdown surface tracks hover/focus while child controls keep semantic roles.

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AmpLogo, ClaudeLogo, CodexLogo } from '../../../components/AgentLogos'
import { featurePath } from '../_lib/featurePaths'
import { TEMPO_SDK_DOCS_URL } from '../_lib/links'
import ArrowUpRight from './ArrowUpRight'
import MegaMenu, { type MegaLink, type MegaMenuData } from './MegaMenu'
import {
  ApiIcon,
  DocsIcon,
  ExplorerIcon,
  FaucetIcon,
  McpIcon,
  TerminalIcon,
  TokensIcon,
  TransactionsIcon,
  WalletIcon,
} from './menuIcons'
import SearchDialog from './SearchDialog'
import TempoLogo from './TempoLogo'

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
      title: 'Assets',
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
          href: '/docs',
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
          label: 'Faucet',
          desc: 'Get testnet tokens for development',
          href: '/docs/quickstart/faucet',
          icon: <FaucetIcon />,
        },
        {
          label: 'TIDX',
          desc: 'Raw indexer queries & event streams',
          href: '/docs/developer-tools/indexer',
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

const TEMPO_AI_GUIDE_URL = '/docs/guide/using-tempo-with-ai'
const TEMPO_DOCS_SKILL_URL = `${TEMPO_AI_GUIDE_URL}#docs-skill`
const TEMPO_PLUGIN_URL = `${TEMPO_AI_GUIDE_URL}#install-tempo-plugins`
const TEMPO_MCP_URL = 'https://mcp.tempo.xyz'

type MenuItem = { label: string; href: string; mega?: MegaMenuData }

function isExternal(href: string): boolean {
  return !href.startsWith('/') && !href.startsWith('#')
}

function pathMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function isActiveMenuItem(pathname: string, item: MenuItem): boolean {
  if (item.label === 'Build') {
    return pathname === '/' || pathname.startsWith('/build')
  }
  if (item.label === 'Resources') {
    return pathname === TEMPO_SDK_DOCS_URL || pathname.startsWith(`${TEMPO_SDK_DOCS_URL}/`)
  }
  return !isExternal(item.href) && pathMatches(pathname, item.href)
}

// 3x3 grid drawn as an SVG so all nine cells share identical geometry and stay
// evenly spaced at any size or device-pixel ratio (a div grid with gaps drifts
// from subpixel rounding at this small a scale). Cells are 3px on a 4px pitch.
function ActiveSquare({ activeKey }: { activeKey: string }) {
  return (
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

const menu: MenuItem[] = [
  { label: 'Build', href: '/#protocol', mega: protocolMenu },
  { label: 'Resources', href: '/docs', mega: developersMenu },
  { label: 'Performance', href: '/performance' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/docs' },
]

// Flatten a mega menu into its leaf links for the mobile accordion.
function megaLinks(data: MegaMenuData): MegaLink[] {
  return data.columns.flatMap((col) => col.items)
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
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

function CloseIcon() {
  return (
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

// The server URL is appended at render time so it can be color-highlighted.
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

function CopyIcon() {
  return (
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
        className={`mt-1 shrink-0 transition-colors ${
          copied ? 'text-foreground' : 'text-foreground/35 group-hover/copy:text-foreground/70'
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </button>
  )
}

function AgentCommandSection({
  href,
  label,
  desc,
  icon,
  onClick,
  children,
}: {
  href: string
  label: string
  desc: string
  icon: ReactNode
  onClick?: () => void
  children?: ReactNode
}) {
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
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <div className={desktop ? 'w-[520px] p-3' : 'pb-4'}>
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

          {/* Config block hangs under the item's text column (icon 40px + gap 12px). */}
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

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  // The mobile menu is a fixed overlay anchored just below the nav bar, so we
  // track the bar's height to offset it (and keep it correct across resizes).
  const [navH, setNavH] = useState(0)

  // Desktop dropdowns share one floating surface that morphs (slides &
  // resizes) between panels instead of closing and reopening.
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [geom, setGeom] = useState<{ x: number; w: number; h: number } | null>(null)
  // Geometry only animates when moving between two open panels; a fresh open
  // snaps into place and just fades in.
  const [morphing, setMorphing] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
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
  // Delay lets the pointer cross the gap between trigger and panel (and hop
  // between triggers) without the surface collapsing.
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
    const t = trigger.getBoundingClientRect()
    const b = header.getBoundingClientRect()
    const raw =
      activeMenu === 'For agents'
        ? t.right - b.left - w // right-align with its trigger
        : t.left - b.left + t.width / 2 - w / 2 // center under trigger
    const x = Math.round(Math.min(Math.max(raw, 12), b.width - w - 12))
    setMorphing(prevActive.current !== null)
    setGeom({ x, w, h })
    prevActive.current = activeMenu
  }, [activeMenu])

  // Measure the nav bar so the mobile overlay can fill from its bottom edge to
  // the bottom of the viewport (otherwise the page bleeds through beneath the
  // short menu list, which looks broken on taller/wider screens).
  useLayoutEffect(() => {
    const measure = () => setNavH(navRef.current?.offsetHeight ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Lock background scroll while the mobile menu is open.
  useLayoutEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Cmd/Ctrl+K toggles the in-page search dialog from anywhere on the marketing
  // site (parity with the docs).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((s) => !s)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

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

  return (
    <header ref={headerRef} className="relative z-20 border-line border-b">
      <nav ref={navRef} className="relative flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          onClick={close}
          aria-label="Tempo home"
          className="group flex items-center gap-3"
        >
          <TempoLogo className="h-[18px] w-[80px] text-foreground" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-16 lg:absolute lg:top-1/2 lg:left-1/2 lg:flex lg:-translate-x-1/2 lg:-translate-y-1/2">
          {menu.map((item) => {
            const external = isExternal(item.href)
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
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className={`shrink-0 text-foreground/40 transition-transform duration-200 ease-out ${
                      activeMenu === item.label ? 'rotate-180' : ''
                    }`}
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
                    ref={(el) => {
                      if (el) triggerRefs.current.set(item.label, el)
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
                  <a
                    href={item.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="relative flex items-center gap-1.5 font-sans text-[14px] text-foreground tracking-[0] transition-opacity hover:opacity-70"
                  >
                    {triggerContent}
                  </a>
                )}
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            title="Search documentation (⌘K)"
            className="grid size-9 place-items-center rounded-[4px] border border-line text-foreground/60 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <SearchIcon />
          </button>
          <button
            ref={(el) => {
              if (el) triggerRefs.current.set('For agents', el)
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
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className={`shrink-0 text-foreground/40 transition-transform duration-200 ease-out ${
                activeMenu === 'For agents' ? 'rotate-180' : ''
              }`}
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

        {/* Mobile actions */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => {
              close()
              setSearchOpen(true)
            }}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            className="grid size-8 place-items-center text-foreground"
          >
            <SearchIcon className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid size-8 place-items-center text-foreground"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Desktop dropdowns: one shared surface that slides & resizes between
          panels while their content crossfades. */}
      <div className="pointer-events-none absolute top-full left-0 z-50 hidden w-full lg:block">
        <div
          className={[
            'transition duration-200 ease-out will-change-[opacity,transform,filter] motion-reduce:transition-none',
            activeMenu
              ? 'translate-y-0 opacity-100 [filter:blur(0px)]'
              : '-translate-y-2 opacity-0 [filter:blur(8px)]',
          ].join(' ')}
        >
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onFocus={cancelClose}
            onBlur={scheduleClose}
            style={{ transform: `translateX(${geom?.x ?? 0}px)` }}
            className={[
              'w-max pt-3',
              activeMenu ? 'pointer-events-auto' : '',
              morphing
                ? 'transition-transform duration-200 ease-out motion-reduce:transition-none'
                : '',
            ].join(' ')}
          >
            <div
              style={{ width: geom?.w, height: geom?.h }}
              className={[
                'relative overflow-hidden rounded-md border border-line bg-surface-page shadow-2xl',
                morphing
                  ? 'transition-[width,height] duration-200 ease-out motion-reduce:transition-none'
                  : '',
              ].join(' ')}
            >
              {dropdowns.map(({ key, panel }) => (
                <div
                  key={key}
                  ref={(el) => {
                    if (el) panelRefs.current.set(key, el)
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

      {/* Mobile menu: a fixed overlay that fills from the nav bar down to the
          bottom of the viewport so page content never bleeds through beneath
          the menu list (which looked broken on taller/wider screens). */}
      <div
        style={{ top: navH }}
        className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-background transition duration-200 ease-out lg:hidden ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="flex flex-col px-5 pb-5">
          {menu.map((item) => {
            const external = isExternal(item.href)
            const active = isActiveMenuItem(pathname, item)
            return item.mega ? (
              <div key={item.label} className="border-line border-t">
                <button
                  type="button"
                  onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
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
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                    expanded === item.label ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-col gap-3 pb-4 pl-3">
                      {megaLinks(item.mega).map((sub) =>
                        !isExternal(sub.href) ? (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={close}
                            className="font-sans text-[15px] text-foreground/50 tracking-[0] transition-colors hover:text-foreground"
                          >
                            {sub.label}
                          </Link>
                        ) : (
                          <a
                            key={sub.label}
                            href={sub.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={close}
                            className="flex items-start gap-1.5 font-sans text-[15px] text-foreground/50 tracking-[0] transition-colors hover:text-foreground"
                          >
                            {sub.label}
                            <ArrowUpRight className="mt-0.5 size-3" />
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={item.label}
                href={item.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={close}
                className="flex items-center gap-1.5 border-line border-t py-4 font-sans text-[16px] text-foreground tracking-[0]"
              >
                {active ? <ActiveSquare activeKey={pathname} /> : null}
                {item.label}
              </a>
            )
          })}
          <div className="border-line border-t">
            <button
              type="button"
              onClick={() => setExpanded((e) => (e === 'For agents' ? null : 'For agents'))}
              aria-expanded={expanded === 'For agents'}
              className="flex w-full items-center justify-between py-4 font-sans text-[16px] text-foreground tracking-[0]"
            >
              For agents
              <Chevron open={expanded === 'For agents'} />
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                expanded === 'For agents' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <AgentsPanel variant="mobile" onNavigate={close} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
