'use client'

import tempoWordmark from '@tempoxyz/ds/brand/logos/TempoLogoWordmark.svg?url&no-inline'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, Link as WakuLink } from 'waku'
import { cx as composeStyles } from 'zyzz'
import ChevronDownIcon from '~icons/lucide/chevron-down'
import { tempoAgentSetupCommands } from '../lib/ai-install-commands'
import { normalizeDocsPath, type SidebarNode } from '../lib/docs-sidebar'

export { normalizeDocsPath, resolveSidebarItems } from '../lib/docs-sidebar'

import { DOCS_SEARCH_PARAM, docsSearchUrl } from '../lib/docs-search'
import { publicAssetPath } from '../lib/public-asset-path'
import { navActiveSquare } from '../styles/surfaces.styles'
import { AmpLogo, ClaudeLogo, CodexLogo } from './AgentLogos'
import { AgentSetupCommand } from './AgentSetupCommand'
import * as ui from './DocsHeader.recipes'
import {
  docsHeaderActions,
  docsHeaderAgentMenu,
  docsHeaderAgentPanel,
  docsHeaderAgentTrigger,
  docsHeaderBrand,
  docsHeaderDestinations,
  docsHeaderIconButton,
  docsHeaderLogo,
  docsHeaderMobileActions,
  docsHeaderMobileAgents,
  docsHeaderMobileBody,
  docsHeaderMobileDialog,
  docsHeaderMobileLabel,
  docsHeaderMobileResources,
  docsHeaderMobileSearch,
  docsHeaderMobileSections,
  docsHeaderMobileTheme,
  docsHeaderMobileTop,
  docsHeaderMobileUtilityLink,
  docsHeaderMobileWebsite,
  docsHeaderNav,
  docsHeaderSearch,
  docsHeaderWordmark,
  docsSiteHeader,
} from './DocsNavigation.styles'
import {
  DocsApiDropdown,
  DocsResourceLinks,
  docsSections,
  docsUtilitySections,
  getActiveDocsSection,
} from './DocsSectionNav'

const DOCS_BASE_PATH = '/docs'
const TEMPO_AI_GUIDE_URL = `${DOCS_BASE_PATH}/guide/using-tempo-with-ai`
const TEMPO_PLUGIN_URL = `${TEMPO_AI_GUIDE_URL}#install-tempo-plugins`

function isExternal(href: string) {
  return !href.startsWith('/') && !href.startsWith('#')
}

export function usePathname() {
  const { path } = useRouter()
  const [pathname, setPathname] = useState(() => normalizeDocsPath(path ?? '/'))

  useLayoutEffect(() => {
    const update = () => setPathname(normalizeDocsPath(window.location.pathname))
    update()
    window.addEventListener('popstate', update)
    window.addEventListener('hashchange', update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener('hashchange', update)
    }
  }, [])

  useEffect(() => {
    if (path) setPathname(normalizeDocsPath(path))
  }, [path])

  return pathname
}

function Anchor({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <a {...props}>{children}</a>
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }
  return (
    <WakuLink {...props} to={href} unstable_prefetchOnEnter unstable_prefetchOnView>
      {children}
    </WakuLink>
  )
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 17 17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function TempoLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      {...ui.tempoLogoTextAppearance({
        image: `url('${publicAssetPath(tempoWordmark)}')`,
        className: ` ${ui.tempoLogoText().className} ${className ?? ''}`,
      })}
    />
  )
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
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

// The custom DocsHeader replaces Vocs' default top nav, whose hidden
// `[data-v-gutter-top]` container still mounts Vocs' built-in `<Search />`
// (it owns a global Cmd/Ctrl+K listener and the search dialog). Rather than
// importing that internal, unexported component, we re-expose the affordance by
// dispatching the same shortcut Vocs already handles. See src/styles/globals.ts
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

// One install path per agent: the plugin bundles the MCP server and docs skill where
// supported; Skills and MCP expose the client-independent setup options.
const agentCommands = [
  {
    label: 'Codex',
    logo: <CodexLogo aria-hidden="true" className={ui.codexLogo().className} />,
    command: tempoAgentSetupCommands.codex,
  },
  {
    label: 'Claude Code',
    logo: <ClaudeLogo aria-hidden="true" className={ui.codexLogo().className} />,
    command: tempoAgentSetupCommands.claude,
  },
  {
    label: 'Amp',
    logo: <AmpLogo aria-hidden="true" className={ui.codexLogo().className} />,
    command: tempoAgentSetupCommands.amp,
  },
  {
    label: 'Skills',
    logo: null,
    command: tempoAgentSetupCommands.skills,
  },
  {
    label: 'MCP',
    logo: null,
    command: tempoAgentSetupCommands.mcp,
  },
]

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
            aria-pressed={active}
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
        <span {...ui.commandSnippetText2()}>
          {children ?? <AgentSetupCommand command={command} />}
        </span>
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
    <div {...ui.agentCommandSectionLayout({ className: 'group/item' })}>
      <div {...ui.agentCommandSectionLayout2()}>
        <span {...ui.agentCommandSectionText()}>{icon}</span>
        <Anchor href={href} onClick={onClick} className={ui.anchor().className}>
          {external ? <ArrowUpRight className={ui.arrowUpRight().className} /> : null}
          <span {...ui.agentCommandSectionText2()}>{label}</span>
          <span {...ui.agentCommandSectionText3()}>{desc}</span>
        </Anchor>
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
    } catch {}
  }

  return (
    <div className={desktop ? ui.agentsPanelLayout().className : ui.agentsPanelLayout2().className}>
      {desktop ? <p {...ui.agentsPanelDescription()}>Connect your coding agent</p> : null}
      <div {...ui.agentsPanelLayout3()}>
        <AgentCommandSection
          href={TEMPO_PLUGIN_URL}
          label="Tempo Docs"
          desc="Search and read Tempo documentation from your editor."
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
          {activeCommand.label === 'MCP' ? (
            <p {...ui.agentsPanelDescription2()}>
              Add this URL as an HTTP MCP server in your agent’s settings.
            </p>
          ) : null}
          <CommandSnippet
            command={activeCommand.command}
            copyLabel={
              activeCommand.label === 'MCP'
                ? 'Copy MCP server URL'
                : `Copy Tempo install command for ${activeCommand.label}`
            }
            copied={copied}
            onCopy={copyCommand}
          />
        </AgentCommandSection>
      </div>
    </div>
  )
}

function sidebarLinkIsActive(pathname: string, link: string, activeAnchor: string | null) {
  if (isExternal(link)) return false
  const [target, fragment] = link.split('#')
  const targetPath = normalizeDocsPath(target?.split('?')[0] || pathname).replace(/\/+$/, '')
  if (normalizeDocsPath(pathname).replace(/\/+$/, '') !== targetPath) return false
  if (!fragment) return activeAnchor === null

  try {
    return decodeURIComponent(fragment) === activeAnchor
  } catch {
    return fragment === activeAnchor
  }
}

function nodeContainsActive(
  node: SidebarNode,
  pathname: string,
  activeAnchor: string | null,
): boolean {
  if (node.link && sidebarLinkIsActive(pathname, node.link, activeAnchor)) return true
  return Boolean(node.items?.some((child) => nodeContainsActive(child, pathname, activeAnchor)))
}

function SidebarLeaf({
  node,
  pathname,
  activeAnchor,
  depth,
  onNavigate,
}: {
  node: SidebarNode
  pathname: string
  activeAnchor: string | null
  depth: number
  onNavigate: () => void
}) {
  const active = node.link ? sidebarLinkIsActive(pathname, node.link, activeAnchor) : false
  const external = node.link ? isExternal(node.link) : false
  return (
    <Anchor
      href={node.link ?? '#'}
      onClick={onNavigate}
      aria-current={active ? (node.link?.includes('#') ? 'location' : 'page') : undefined}
      {...ui.sidebarLeafAnchorAppearance({
        value0: depth > 1 ? `${(depth - 1) * 12 + 8}px` : '8px',
        className: ` ${ui.anchor2().className} ${
          active ? ui.anchor3().className : ui.anchor4().className
        }`,
      })}
    >
      {active ? <ActiveSquare activeKey={`${pathname}#${activeAnchor ?? ''}`} /> : null}
      {node.text}
      {external ? <ArrowUpRight className={ui.arrowUpRight2().className} /> : null}
    </Anchor>
  )
}

function SidebarDisclosure({
  node,
  pathname,
  activeAnchor,
  depth,
  onNavigate,
}: {
  node: SidebarNode
  pathname: string
  activeAnchor: string | null
  depth: number
  onNavigate: () => void
}) {
  const containsActivePage = nodeContainsActive(node, pathname, activeAnchor)
  const [open, setOpen] = useState(() => !node.collapsed || containsActivePage)

  // Match the desktop sidebar: reveal newly selected pages while preserving
  // groups the reader has opened themselves.
  useEffect(() => {
    if (containsActivePage) setOpen(true)
  }, [containsActivePage])

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      {...ui.sidebarDisclosureDetailsAppearance({
        value0: depth > 1 ? `${(depth - 1) * 12}px` : '0px',
        className: ui.sidebarDisclosureDetails({ className: 'group/sb' }).className,
      })}
    >
      <summary {...ui.sidebarDisclosureSummary()}>
        {node.text}
        <Chevron open={open} />
      </summary>
      <div {...ui.sidebarDisclosureLayout()}>
        <SidebarNodes
          nodes={node.items ?? []}
          pathname={pathname}
          activeAnchor={activeAnchor}
          depth={depth + 1}
          onNavigate={onNavigate}
        />
      </div>
    </details>
  )
}

export function SidebarNodes({
  nodes,
  pathname,
  activeAnchor,
  depth,
  onNavigate,
}: {
  nodes: SidebarNode[]
  pathname: string
  activeAnchor: string | null
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
              activeAnchor={activeAnchor}
              depth={depth}
              onNavigate={onNavigate}
            />
          )
        }

        // Non-collapsible section (e.g. "Build on Tempo"): a heading + children.
        if (node.collapsed === undefined) {
          return (
            <div
              key={key}
              className={
                depth === 0 ? ui.sidebarNodesLayout().className : ui.sidebarNodesLayout2().className
              }
            >
              <p {...ui.sidebarNodesDescription()}>{node.text}</p>
              <div
                className={
                  depth > 0
                    ? ui.sidebarNodesLayout3().className
                    : ui.sidebarNodesLayout4().className
                }
              >
                <SidebarNodes
                  nodes={node.items ?? []}
                  pathname={pathname}
                  activeAnchor={activeAnchor}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          )
        }

        return (
          <SidebarDisclosure
            key={key}
            node={node}
            pathname={pathname}
            activeAnchor={activeAnchor}
            depth={depth}
            onNavigate={onNavigate}
          />
        )
      })}
    </>
  )
}

export default function DocsHeader({ surface = 'docs' }: { surface?: 'docs' | 'blog' }) {
  const router = useRouter()
  const pathname = usePathname()
  const activeSection = getActiveDocsSection(pathname)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [agentsOpen, setAgentsOpen] = useState(false)
  const agentMenuRef = useRef<HTMLDivElement | null>(null)
  const agentTriggerRef = useRef<HTMLButtonElement | null>(null)
  const mobileDialogRef = useRef<HTMLDialogElement | null>(null)
  const mobileCloseRef = useRef<HTMLButtonElement | null>(null)

  const close = () => {
    setOpen(false)
    setAgentsOpen(false)
  }

  const openSearch = () => {
    mobileDialogRef.current?.close()
    close()
    if (surface === 'blog') router.push(docsSearchUrl())
    else requestAnimationFrame(openDocsSearch)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (surface !== 'blog') return
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        router.push(docsSearchUrl())
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [surface, router])

  // Close menus after navigation, including browser back/forward.
  useEffect(() => {
    setOpen(false)
    setAgentsOpen(false)
  }, [pathname])

  useEffect(() => {
    const dialog = mobileDialogRef.current
    if (!dialog) return
    if (!open) {
      dialog.close()
      return
    }
    dialog.showModal()
    mobileCloseRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // A resized desktop viewport must not retain an invisible modal.
    const desktop = window.matchMedia('(min-width: 1080px)')
    const onResize = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener('change', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      desktop.removeEventListener('change', onResize)
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!agentsOpen) return
    const closeWhenOutside = (event: Event) => {
      if (!agentMenuRef.current?.contains(event.target as Node)) setAgentsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAgentsOpen(false)
        agentTriggerRef.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1080px)')
    const onResize = () => {
      if (!desktop.matches) setAgentsOpen(false)
    }
    document.addEventListener('pointerdown', closeWhenOutside)
    document.addEventListener('focusin', closeWhenOutside)
    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('pointerdown', closeWhenOutside)
      document.removeEventListener('focusin', closeWhenOutside)
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onResize)
    }
  }, [agentsOpen])

  // Open search when arriving from the website with ?search=1.
  useEffect(() => {
    if (surface === 'blog') return
    const params = new URLSearchParams(window.location.search)
    if (!params.has(DOCS_SEARCH_PARAM)) return
    params.delete(DOCS_SEARCH_PARAM)
    const query = params.toString()
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    )
    openDocsSearchWhenReady()
  }, [surface])

  const brand = (
    <div className={`docs-header-brand ${docsHeaderBrand().className}`}>
      <WakuLink
        to="/"
        onClick={close}
        aria-label="Tempo documentation"
        className={`docs-header-logo ${docsHeaderLogo().className}`}
      >
        <TempoLogo className={ui.tempoLogo().className} />
      </WakuLink>
    </div>
  )

  const destinations = (
    <div className={`docs-header-destinations ${docsHeaderDestinations().className}`}>
      <WakuLink
        to="/"
        onClick={close}
        aria-current={surface === 'docs' ? 'page' : undefined}
        className={`docs-header-wordmark ${docsHeaderWordmark().className}`}
      >
        Docs
      </WakuLink>
      <WakuLink
        to="/blog"
        onClick={close}
        aria-current={surface === 'blog' ? 'page' : undefined}
        className={`docs-header-wordmark ${docsHeaderWordmark().className}`}
      >
        Blog
      </WakuLink>
    </div>
  )

  return (
    <header className={`docs-site-header ${docsSiteHeader().className}`}>
      <nav
        className={`docs-header-nav ${docsHeaderNav().className}`}
        aria-label="Developer navigation"
      >
        {brand}
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search documentation"
          aria-keyshortcuts="Meta+K Control+K"
          className={`docs-header-search ${docsHeaderSearch().className}`}
          disabled={!mounted}
        >
          <span {...ui.docsHeaderText()}>
            <SearchIcon />
            <span {...ui.docsHeaderText2()}>Search docs</span>
          </span>
          <kbd>⌘ K</kbd>
        </button>
        <div className={`docs-header-actions ${docsHeaderActions().className}`}>
          {destinations}
          <div
            ref={agentMenuRef}
            className={`docs-header-agent-menu ${docsHeaderAgentMenu().className}`}
          >
            <button
              ref={agentTriggerRef}
              type="button"
              aria-expanded={agentsOpen}
              aria-controls="docs-agent-tools"
              onClick={() => setAgentsOpen((value) => !value)}
              className={`docs-header-agent-trigger ${docsHeaderAgentTrigger().className}`}
              disabled={!mounted}
            >
              Agent setup
              <Chevron open={agentsOpen} />
            </button>
            {agentsOpen ? (
              <div
                id="docs-agent-tools"
                className={`docs-header-agent-panel ${docsHeaderAgentPanel().className}`}
              >
                <AgentsPanel onNavigate={close} />
              </div>
            ) : null}
          </div>
        </div>
        <div className={`docs-header-mobile-actions ${docsHeaderMobileActions().className}`}>
          {destinations}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            disabled={!mounted}
            className={`docs-header-icon-button ${docsHeaderIconButton().className}`}
          >
            <SearchIcon className={ui.searchIcon().className} />
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            disabled={!mounted}
            aria-expanded={open}
            aria-controls="docs-mobile-navigation"
            className={`docs-header-icon-button ${docsHeaderIconButton().className}`}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      <dialog
        ref={mobileDialogRef}
        id="docs-mobile-navigation"
        className={`docs-header-mobile-dialog ${docsHeaderMobileDialog().className}`}
        aria-label="Documentation navigation"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault()
            event.stopPropagation()
            openSearch()
          }
        }}
      >
        <div className={`docs-header-mobile-top ${docsHeaderMobileTop().className}`}>
          {brand}
          <div className={`docs-header-mobile-actions ${docsHeaderMobileActions().className}`}>
            {destinations}
            <button
              type="button"
              ref={mobileCloseRef}
              onClick={close}
              aria-label="Close menu"
              className={`docs-header-icon-button ${docsHeaderIconButton().className}`}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className={`docs-header-mobile-body ${docsHeaderMobileBody().className}`}>
          <button
            type="button"
            onClick={openSearch}
            className={`docs-header-mobile-search ${docsHeaderMobileSearch().className}`}
          >
            <SearchIcon /> Search documentation
          </button>
          <nav
            aria-label="All documentation sections"
            className={`docs-header-mobile-sections ${docsHeaderMobileSections().className}`}
          >
            <p className={`docs-header-mobile-label ${docsHeaderMobileLabel().className}`}>
              Explore the docs
            </p>
            {docsSections.map((section) => (
              <WakuLink
                key={section.id}
                to={section.href}
                onClick={close}
                aria-current={activeSection?.id === section.id ? 'page' : undefined}
              >
                {section.label}
                <span aria-hidden="true">↗</span>
              </WakuLink>
            ))}
          </nav>
          <div className={`docs-header-mobile-resources ${docsHeaderMobileResources().className}`}>
            <p className={`docs-header-mobile-label ${docsHeaderMobileLabel().className}`}>
              Resources
            </p>
            {docsUtilitySections.map((section) =>
              section.id === 'tools' ? (
                <DocsApiDropdown
                  key={section.id}
                  active={activeSection?.id === section.id}
                  mobile
                  onNavigate={close}
                />
              ) : (
                <WakuLink
                  key={section.id}
                  to={section.href}
                  onClick={close}
                  className={`docs-header-mobile-utility-link ${docsHeaderMobileUtilityLink().className}`}
                  aria-current={activeSection?.id === section.id ? 'page' : undefined}
                >
                  {section.label}
                  <span aria-hidden="true">↗</span>
                </WakuLink>
              ),
            )}
            <DocsResourceLinks onNavigate={close} />
          </div>
          <details className={`docs-header-mobile-agents ${docsHeaderMobileAgents().className}`}>
            <summary>
              Agent setup
              <ChevronDownIcon aria-hidden="true" width="14" height="14" />
            </summary>
            <AgentsPanel variant="mobile" onNavigate={close} />
          </details>
          <ThemeSelect surface={surface} />
          <a
            href="https://tempo.xyz/"
            className={`docs-header-mobile-website ${docsHeaderMobileWebsite().className}`}
          >
            Back to tempo.xyz <ArrowUpRight className={ui.arrowUpRight3().className} />
          </a>
        </div>
      </dialog>
    </header>
  )
}

function ThemeSelect({ surface }: { surface: 'docs' | 'blog' }) {
  const [theme, setTheme] = useState('system')
  useEffect(() => {
    const sync = () => setTheme(localStorage.getItem('vocs-theme') ?? 'system')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-vocs-theme'],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (surface !== 'blog') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const selected = localStorage.getItem('vocs-theme') ?? 'system'
      const resolved = selected === 'system' ? (media.matches ? 'dark' : 'light') : selected
      document.documentElement.dataset.vocsTheme = resolved
      document.documentElement.style.colorScheme = resolved
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [surface])

  return (
    <label className={`docs-header-mobile-theme ${docsHeaderMobileTheme().className}`}>
      <span>Appearance</span>
      <select
        aria-label="Color theme"
        value={theme}
        onChange={(event) => {
          const selected = event.target.value
          const label = selected.charAt(0).toUpperCase() + selected.slice(1)
          const control = document.querySelector<HTMLElement>(
            `[data-v-sidebar-footer-content] [role="radio"][aria-label="${label} theme"]`,
          )
          if (control) control.click()
          else {
            localStorage.setItem('vocs-theme', selected)
            const resolved =
              selected === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light'
                : selected
            document.documentElement.dataset.vocsTheme = resolved
            document.documentElement.style.colorScheme = resolved
          }
          setTheme(selected)
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  )
}
