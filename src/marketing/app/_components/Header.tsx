'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx as composeStyles } from 'zyzz'
import { AmpLogo, ClaudeLogo, CodexLogo } from '../../../components/AgentLogos'
import { tempoPluginInstallCommands } from '../../../lib/ai-install-commands'
import { navActiveSquare } from '../../../styles/surfaces.styles'
import { developersPath } from '../_lib/developersPaths'
import { featurePath } from '../_lib/featurePaths'
import { TEMPO_SDK_DOCS_URL } from '../_lib/links'
import ArrowUpRight from './ArrowUpRight'
import * as ui from './Header.recipes'
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

const TEMPO_DOCS_URL = '/docs'

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
          href: TEMPO_DOCS_URL,
          icon: <DocsIcon />,
        },
        {
          label: 'Tempo API',
          desc: 'APIs for stablecoin payment applications',
          href: '/docs/api',
          icon: <ApiIcon />,
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          label: 'Tempo Wallet',
          desc: 'A Tempo-first wallet',
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
          href: '/docs/api/indexer-api',
          icon: <ApiIcon />,
        },
        {
          label: 'Tempo Explorer',
          desc: 'Search blocks, txs & tokens',
          href: 'https://explorer.tempo.xyz',
          icon: <ExplorerIcon />,
        },
        {
          label: 'Wallet CLI',
          desc: 'Use Tempo Wallet from the command line for agents',
          href: '/docs/cli/wallet',
          icon: <TerminalIcon />,
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

const TEMPO_AI_GUIDE_URL = developersPath('/docs/guide/using-tempo-with-ai')
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
      aria-hidden="true"
      {...ui.activeSquareIcon({ className: `nav-active-square ${navActiveSquare().className}` })}
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
  { label: 'Build', href: `${developersPath('/')}#protocol`, mega: protocolMenu },
  { label: 'Resources', href: developersPath('/docs'), mega: developersMenu },
  { label: 'Performance', href: developersPath('/performance') },
  { label: 'Blog', href: developersPath('/blog') },
  { label: 'Docs', href: TEMPO_DOCS_URL },
]

// Flatten a mega menu into its leaf links for the mobile accordion.
function megaLinks(data: MegaMenuData): MegaLink[] {
  return data.columns.flatMap((col) => col.items)
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
      aria-hidden="true"
      className={` ${ui.searchIconIcon().className} ${className ?? ''}`}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
      aria-hidden="true"
      {...ui.gearIconIcon()}
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
      aria-hidden="true"
      {...composeStyles(ui.chevronIcon(), !!open && ui.chevronIcon2())}
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

// One install path per agent: the plugin bundles the MCP server and docs skill where
// supported, Amp gets the MCP server directly, and other agents get the skill.
const agentCommands = [
  {
    label: 'Claude',
    logo: <ClaudeLogo aria-hidden="true" className={ui.claudeLogo().className} />,
    command: tempoPluginInstallCommands.claude,
  },
  {
    label: 'Codex',
    logo: <CodexLogo aria-hidden="true" className={ui.claudeLogo().className} />,
    command: tempoPluginInstallCommands.codex,
  },
  {
    label: 'Amp',
    logo: <AmpLogo aria-hidden="true" className={ui.claudeLogo().className} />,
    command: `amp mcp add --transport http tempo ${TEMPO_MCP_URL}`,
  },
  {
    label: 'Other',
    logo: null,
    command: 'npx skills add tempoxyz/plugins --skill docs',
  },
]

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    <div {...ui.commandTabsLayout()}>
      {commands.map((item, index) => {
        const active = index === activeIndex
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect(index)}
            {...composeStyles(
              ui.commandTabsButton(),
              !!active && ui.commandTabsButton2(),
              !active && ui.commandTabsButton3(),
            )}
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
      {...ui.commandSnippetButton({ className: 'group/copy' })}
    >
      <code {...ui.code()}>
        <span aria-hidden="true" {...ui.commandSnippetText()}>
          $
        </span>
        <span {...ui.commandSnippetText2()}>{children ?? command}</span>
      </code>
      <span
        {...composeStyles(
          ui.commandSnippetText3(),
          !!copied && ui.commandSnippetText4(),
          !copied && ui.commandSnippetText5(),
        )}
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
    <div {...ui.agentCommandSectionLayout({ className: 'group/item' })}>
      <div {...ui.agentCommandSectionLayout2()}>
        <span {...ui.agentCommandSectionText()}>{icon}</span>
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          onClick={onClick}
          {...ui.agentCommandSectionLink()}
        >
          {external ? <ArrowUpRight className={ui.arrowUpRight().className} /> : null}
          <span {...ui.agentCommandSectionText2()}>{label}</span>
          <span {...ui.agentCommandSectionText3()}>{desc}</span>
        </a>
      </div>
      {children ? <div {...ui.agentCommandSectionLayout3()}>{children}</div> : null}
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
  const [activeCommandIndex, setActiveCommandIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const activeCommand = agentCommands[activeCommandIndex]

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <div className={desktop ? ui.agentsPanelLayout().className : ui.agentsPanelLayout2().className}>
      {desktop ? <p {...ui.agentsPanelDescription()}>Use Tempo with AI</p> : null}

      <div {...ui.agentsPanelLayout3()}>
        <AgentCommandSection
          href={TEMPO_PLUGIN_URL}
          label="Tempo for your agent"
          desc="Give your agent search and read tools for Tempo docs"
          icon={<McpIcon />}
          onClick={onNavigate}
        >
          <CommandTabs
            commands={agentCommands}
            activeIndex={activeCommandIndex}
            onSelect={(index) => {
              setActiveCommandIndex(index)
              setCopied(false)
            }}
          />
          <CommandSnippet
            command={activeCommand.command}
            copyLabel={`Copy Tempo install command for ${activeCommand.label}`}
            copied={copied}
            onCopy={copyCommand}
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
    <header ref={headerRef} {...ui.headerHeader()}>
      <nav ref={navRef} {...ui.nav()}>
        <Link
          href="/"
          onClick={close}
          aria-label="Tempo home"
          className={ui.link({ className: 'group' }).className}
        >
          <TempoLogo className={ui.tempoLogo().className} />
        </Link>

        {/* Desktop nav */}
        <ul {...ui.headerList()}>
          {menu.map((item) => {
            const external = isExternal(item.href)
            const active = isActiveMenuItem(pathname, item)
            const triggerContent = (
              <>
                {active ? (
                  <span {...ui.headerText()}>
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
                    aria-hidden="true"
                    {...composeStyles(
                      ui.headerIcon(),
                      !!(activeMenu === item.label) && ui.chevronIcon2(),
                    )}
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
                    {...ui.headerButton()}
                  >
                    {triggerContent}
                  </button>
                ) : (
                  <a
                    href={item.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    {...ui.headerButton()}
                  >
                    {triggerContent}
                  </a>
                )}
              </li>
            )
          })}
        </ul>

        <div {...ui.headerLayout()}>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            title="Search documentation (⌘K)"
            {...ui.headerButton2()}
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
            {...ui.headerButton3()}
          >
            <GearIcon />
            For agents
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              {...composeStyles(
                ui.headerIcon(),
                !!(activeMenu === 'For agents') && ui.chevronIcon2(),
              )}
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
        <div {...ui.headerLayout2()}>
          <button
            type="button"
            onClick={() => {
              close()
              setSearchOpen(true)
            }}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            {...ui.headerButton4()}
          >
            <SearchIcon className={ui.searchIcon().className} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            {...ui.headerButton4()}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Desktop dropdowns: one shared surface that slides & resizes between
          panels while their content crossfades. */}
      <div {...ui.headerLayout3()}>
        <div
          className={[
            ui.headerLayoutState().className,
            activeMenu ? ui.headerLayoutState2().className : ui.headerLayoutState3().className,
          ].join(' ')}
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Delegates hover/focus containment to the interactive menu links. */}
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onFocus={cancelClose}
            onBlur={scheduleClose}
            {...ui.headerLayoutAppearance({
              value0: `translateX(${geom?.x ?? 0}px)`,
              className: [
                ui.headerLayoutState4().className,
                activeMenu ? ui.headerLayoutState5().className : '',
                morphing ? ui.headerLayoutState6().className : '',
              ].join(' '),
            })}
          >
            <div
              {...ui.headerLayoutAppearance2({
                value0: geom ? `${geom.w}px` : 'auto',
                value1: geom ? `${geom.h}px` : 'auto',
                className: [
                  ui.headerLayoutState7().className,
                  morphing ? ui.headerLayoutState8().className : '',
                ].join(' '),
              })}
            >
              {dropdowns.map(({ key, panel }) => (
                <div
                  key={key}
                  ref={(el) => {
                    if (el) panelRefs.current.set(key, el)
                    else panelRefs.current.delete(key)
                  }}
                  {...composeStyles(
                    ui.headerLayout4(),
                    !!(activeMenu === key) && ui.headerLayout5(),
                    !(activeMenu === key) && ui.headerLayout6(),
                  )}
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
        {...ui.headerLayoutAppearance3({
          value0: `${navH}px`,
          className: ` ${ui.headerLayout7().className} ${
            open ? ui.headerLayout8().className : ui.headerLayout9().className
          }`,
        })}
      >
        <div {...ui.headerLayout10()}>
          {menu.map((item) => {
            const external = isExternal(item.href)
            const active = isActiveMenuItem(pathname, item)
            return item.mega ? (
              <div key={item.label} {...ui.headerLayout11()}>
                <button
                  type="button"
                  onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                  aria-expanded={expanded === item.label}
                  {...ui.headerButton5()}
                >
                  <span {...ui.headerText2()}>
                    {active ? <ActiveSquare activeKey={pathname} /> : null}
                    {item.label}
                  </span>
                  <Chevron open={expanded === item.label} />
                </button>
                <div
                  {...composeStyles(
                    ui.headerLayout12(),
                    !!(expanded === item.label) && ui.headerLayout13(),
                    !(expanded === item.label) && ui.headerLayout14(),
                  )}
                >
                  <div {...ui.headerLayout15()}>
                    <div {...ui.headerLayout16()}>
                      {megaLinks(item.mega).map((sub) =>
                        !isExternal(sub.href) ? (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={close}
                            className={ui.link2().className}
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
                            {...ui.headerLink()}
                          >
                            {sub.label}
                            <ArrowUpRight className={ui.arrowUpRight2().className} />
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
                {...ui.headerLink2()}
              >
                {active ? <ActiveSquare activeKey={pathname} /> : null}
                {item.label}
              </a>
            )
          })}
          <div {...ui.headerLayout11()}>
            <button
              type="button"
              onClick={() => setExpanded((e) => (e === 'For agents' ? null : 'For agents'))}
              aria-expanded={expanded === 'For agents'}
              {...ui.headerButton5()}
            >
              For agents
              <Chevron open={expanded === 'For agents'} />
            </button>
            <div
              {...composeStyles(
                ui.headerLayout12(),
                !!(expanded === 'For agents') && ui.headerLayout13(),
                !(expanded === 'For agents') && ui.headerLayout14(),
              )}
            >
              <div {...ui.headerLayout15()}>
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
