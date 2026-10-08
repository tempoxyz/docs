'use client'

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, Link as WakuLink } from 'waku'
import { tempoAgentSetupCommands } from '../lib/ai-install-commands'
import { DOCS_SEARCH_PARAM, docsSearchUrl } from '../lib/docs-search'
import { publicAssetPath } from '../lib/public-asset-path'
import { AmpLogo, ClaudeLogo, CodexLogo } from './AgentLogos'
import { AgentSetupCommand } from './AgentSetupCommand'
import {
  DocsResourceLinks,
  docsSections,
  getActiveDocsSection,
  specificationsSection,
} from './DocsSectionNav'
import './DocsNavigation.css'

const DOCS_BASE_PATH = '/docs'
const DEVELOPERS_BASE_PATH = '/developers'
const TEMPO_AI_GUIDE_URL = `${DOCS_BASE_PATH}/guide/using-tempo-with-ai`
const TEMPO_PLUGIN_URL = `${TEMPO_AI_GUIDE_URL}#install-tempo-plugins`

function isExternal(href: string) {
  return !href.startsWith('/') && !href.startsWith('#')
}

export function normalizeDocsPath(pathname: string) {
  const path = pathname || '/'
  if (path === DEVELOPERS_BASE_PATH) return '/'
  if (path.startsWith(`${DEVELOPERS_BASE_PATH}/`)) {
    return path.slice(DEVELOPERS_BASE_PATH.length) || '/'
  }
  return path
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
        maskImage: `url('${publicAssetPath('/stickers/sticker4/tempo.svg')}')`,
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskImage: `url('${publicAssetPath('/stickers/sticker4/tempo.svg')}')`,
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

function Chevron({ open }: { open: boolean }) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative disclosure icon; button exposes expanded state.
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`shrink-0 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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

// One install path per agent: the plugin bundles the MCP server and docs skill where
// supported, Amp gets the MCP server directly, and other agents get the skill.
const agentCommands = [
  {
    label: 'Codex',
    logo: <CodexLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    command: tempoAgentSetupCommands.codex,
  },
  {
    label: 'Claude Code',
    logo: <ClaudeLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    command: tempoAgentSetupCommands.claude,
  },
  {
    label: 'Amp',
    logo: <AmpLogo aria-hidden="true" className="size-3.5 shrink-0" />,
    command: tempoAgentSetupCommands.amp,
  },
  {
    label: 'Other',
    logo: null,
    command: tempoAgentSetupCommands.other,
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
    <div className="flex flex-wrap gap-1.5">
      {commands.map((item, index) => {
        const active = index === activeIndex
        return (
          <button
            key={item.label}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(index)}
            className={`inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 font-sans text-[12px] tracking-[0] transition-colors ${
              active
                ? 'bg-foreground/[0.06] text-foreground'
                : 'text-foreground/60 hover:bg-foreground/[0.03] hover:text-foreground/70'
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
        <span aria-hidden="true" className="select-none text-foreground/55">
          $
        </span>
        <span className="min-w-0">{children ?? <AgentSetupCommand command={command} />}</span>
      </code>
      <span
        className={`mt-1 shrink-0 transition-colors ${copied ? 'text-foreground' : 'text-foreground/55 group-hover/copy:text-foreground/70'}`}
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
        <Anchor
          href={href}
          onClick={onClick}
          className="relative flex min-w-0 flex-col gap-0.5 pr-5"
        >
          {external ? (
            <ArrowUpRight className="absolute top-0.5 right-0 size-3 text-foreground/55 transition-colors group-hover/item:text-foreground/60" />
          ) : null}
          <span className="font-sans text-[14px] text-foreground tracking-[0]">{label}</span>
          <span className="font-sans text-[13px] text-foreground/60 leading-[1.4] tracking-[0]">
            {desc}
          </span>
        </Anchor>
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
    <div className={desktop ? 'w-[520px] p-3' : 'pb-4 pl-3'}>
      {desktop ? (
        <p className="px-3 pt-2 pb-1.5 font-sans text-[13px] text-foreground/55 tracking-[0]">
          Connect your coding agent
        </p>
      ) : null}
      <div className="space-y-1">
        <AgentCommandSection
          href={TEMPO_PLUGIN_URL}
          label="Tempo Docs plugin"
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

  const path = normalizeDocsPath(pathname)
  const entries = sidebar as Record<string, SidebarNode[] | { items?: SidebarNode[] }>
  let bestKey: string | null = null
  for (const key of Object.keys(entries)) {
    if (path === key || path.startsWith(key === '/' ? '/' : `${key}/`)) {
      if (bestKey === null || key.length > bestKey.length) bestKey = key
    }
  }
  const entry = entries[bestKey ?? '/get-started'] ?? entries['/docs'] ?? Object.values(entries)[0]
  if (!entry) return []
  return Array.isArray(entry) ? entry : (entry.items ?? [])
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
      style={{ paddingLeft: depth > 1 ? `${(depth - 1) * 12 + 8}px` : undefined }}
      className={`-mx-2 flex min-h-8 items-center gap-2 rounded-[6px] px-2 py-1 font-sans text-[14px] tracking-[0] transition-colors ${
        active
          ? 'font-medium text-foreground hover:bg-foreground/[0.04]'
          : 'text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground'
      }`}
    >
      {active ? <ActiveSquare activeKey={`${pathname}#${activeAnchor ?? ''}`} /> : null}
      {node.text}
      {external ? <ArrowUpRight className="mt-0.5 size-3" /> : null}
    </Anchor>
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
            <div key={key} className={depth === 0 ? 'mt-5 first:mt-0' : 'mt-3'}>
              <p className="-mx-2 px-2 pb-2 font-normal font-sans text-[13px] text-foreground/60 leading-[1.3] tracking-[0]">
                {node.text}
              </p>
              <div
                className={
                  depth > 0
                    ? 'ml-2 flex flex-col gap-0 border-line border-l pl-3'
                    : 'flex flex-col gap-0'
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

        // Collapsible subgroup (e.g. "Make Payments"): expandable disclosure.
        const open = !node.collapsed || nodeContainsActive(node, pathname, activeAnchor)
        return (
          <details
            key={key}
            open={open}
            className="group/sb mt-1"
            style={{ paddingLeft: depth > 1 ? `${(depth - 1) * 12}px` : undefined }}
          >
            <summary className="-mx-2 flex min-h-8 cursor-pointer list-none items-center justify-between rounded-[6px] px-2 py-1 font-sans text-[14px] text-foreground/65 tracking-[0] transition-colors hover:bg-foreground/[0.04] hover:text-foreground [&::-webkit-details-marker]:hidden">
              {node.text}
              <Chevron open={open} />
            </summary>
            <div className="mt-1 ml-2 flex flex-col gap-0 border-line border-l pl-3">
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
    <div className="docs-header-brand">
      <WakuLink
        to="/"
        onClick={close}
        aria-label="Tempo documentation"
        className="docs-header-logo"
      >
        <TempoLogo className="h-[18px] w-[80px]" />
      </WakuLink>
    </div>
  )

  const destinations = (
    <div className="docs-header-destinations">
      <WakuLink
        to="/"
        onClick={close}
        aria-current={surface === 'docs' ? 'page' : undefined}
        className="docs-header-wordmark"
      >
        Docs
      </WakuLink>
      <WakuLink
        to="/blog"
        onClick={close}
        aria-current={surface === 'blog' ? 'page' : undefined}
        className="docs-header-wordmark"
      >
        Blog
      </WakuLink>
    </div>
  )

  return (
    <header className="docs-site-header">
      <nav className="docs-header-nav" aria-label="Developer navigation">
        {brand}
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search documentation"
          aria-keyshortcuts="Meta+K Control+K"
          className="docs-header-search"
          disabled={!mounted}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <SearchIcon />
            <span className="truncate">Search docs</span>
          </span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="docs-header-actions">
          {destinations}
          <div ref={agentMenuRef} className="docs-header-agent-menu">
            <button
              ref={agentTriggerRef}
              type="button"
              aria-expanded={agentsOpen}
              aria-controls="docs-agent-tools"
              onClick={() => setAgentsOpen((value) => !value)}
              className="docs-header-agent-trigger"
              disabled={!mounted}
            >
              Agent setup
              <Chevron open={agentsOpen} />
            </button>
            {agentsOpen ? (
              <div id="docs-agent-tools" className="docs-header-agent-panel">
                <AgentsPanel onNavigate={close} />
              </div>
            ) : null}
          </div>
        </div>
        <div className="docs-header-mobile-actions">
          {destinations}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search documentation"
            aria-keyshortcuts="Meta+K Control+K"
            disabled={!mounted}
            className="docs-header-icon-button"
          >
            <SearchIcon className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            disabled={!mounted}
            aria-expanded={open}
            aria-controls="docs-mobile-navigation"
            className="docs-header-icon-button"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      <dialog
        ref={mobileDialogRef}
        id="docs-mobile-navigation"
        className="docs-header-mobile-dialog"
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
        <div className="docs-header-mobile-top">
          {brand}
          <div className="docs-header-mobile-actions">
            {destinations}
            <button
              type="button"
              ref={mobileCloseRef}
              onClick={close}
              aria-label="Close menu"
              className="docs-header-icon-button"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="docs-header-mobile-body">
          <button type="button" onClick={openSearch} className="docs-header-mobile-search">
            <SearchIcon /> Search documentation
          </button>
          <nav aria-label="All documentation sections" className="docs-header-mobile-sections">
            <p className="docs-header-mobile-label">Explore the docs</p>
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
          <div className="docs-header-mobile-resources">
            <p className="docs-header-mobile-label">Tools</p>
            <DocsResourceLinks onNavigate={close} />
            <WakuLink
              to={specificationsSection.href}
              onClick={close}
              className="docs-header-mobile-utility-link"
              aria-current={
                activeSection?.id === 'protocol' || activeSection?.id === 'changelog'
                  ? 'page'
                  : undefined
              }
            >
              {specificationsSection.label}
            </WakuLink>
          </div>
          <details className="docs-header-mobile-agents">
            <summary>Agent setup</summary>
            <AgentsPanel variant="mobile" onNavigate={close} />
          </details>
          <ThemeSelect surface={surface} />
          <a href="https://tempo.xyz/" className="docs-header-mobile-website">
            Back to tempo.xyz <ArrowUpRight className="size-4" />
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
    <label className="docs-header-mobile-theme">
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
