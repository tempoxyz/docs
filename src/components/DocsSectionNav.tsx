'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'waku'

type SectionNavItem = {
  id: 'overview' | 'build' | 'integrate' | 'protocol' | 'tools' | 'node'
  label: string
  href: string
  matches: string[]
}

const sectionNavItems: SectionNavItem[] = [
  {
    id: 'overview',
    label: 'Get Started',
    href: '/docs',
    matches: ['/docs', '/docs/guide/using-tempo-with-ai', '/docs/partners'],
  },
  {
    id: 'build',
    label: 'Build on Tempo',
    href: '/docs/build',
    matches: [
      '/docs/build',
      '/docs/guide/getting-funds',
      '/docs/guide/payments',
      '/docs/guide/issuance',
      '/docs/guide/stablecoin-dex',
      '/docs/guide/private-zones',
      '/docs/guide/machine-payments',
    ],
  },
  {
    id: 'integrate',
    label: 'Integrate Tempo',
    href: '/docs/quickstart/integrate-tempo',
    matches: [
      '/docs/ecosystem',
      '/docs/guide/bridge-bungee',
      '/docs/guide/bridge-layerzero',
      '/docs/guide/bridge-relay',
      '/docs/guide/tempo-transaction',
      '/docs/quickstart',
    ],
  },
  {
    id: 'protocol',
    label: 'Tempo Protocol',
    href: '/docs/protocol',
    matches: ['/docs/protocol'],
  },
  {
    id: 'tools',
    label: 'Tools & SDKs',
    href: '/docs/tools',
    matches: [
      '/api',
      '/docs/cli',
      '/docs/developer-tools',
      '/docs/hosted-services',
      '/docs/protocol/rpc',
      '/docs/sdk',
      '/docs/tools',
      '/docs/wallet',
    ],
  },
  {
    id: 'node',
    label: 'Run a Tempo Node',
    href: '/docs/guide/node',
    matches: ['/docs/changelog', '/docs/guide/node'],
  },
]

function pathMatches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isActive(pathname: string, item: SectionNavItem) {
  if (item.id === 'overview') return item.matches.includes(pathname)
  if (item.id === 'tools' && pathMatches(pathname, '/docs/protocol/rpc')) return true
  if (item.id === 'protocol' && pathMatches(pathname, '/docs/protocol/rpc')) return false
  return item.matches.some((prefix) => pathMatches(pathname, prefix))
}

export default function DocsSectionNav() {
  const { path } = useRouter()
  const pathname = path ?? '/'
  const navRef = useRef<HTMLElement | null>(null)
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null)
  const activeLabel = sectionNavItems.find((item) => isActive(pathname, item))?.label ?? null

  useEffect(() => {
    if (!activeLabel) return
    const nav = navRef.current
    const activeLink = activeLinkRef.current
    if (!nav || !activeLink) return

    const centeredLeft = activeLink.offsetLeft - nav.clientWidth / 2 + activeLink.offsetWidth / 2
    nav.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'instant' })
  }, [activeLabel])

  return (
    <div className="docs-section-nav border-line border-x border-b bg-surface-shell">
      <nav
        ref={navRef}
        aria-label="Documentation sections"
        className="flex h-[var(--tempo-docs-section-nav-height)] items-center overflow-x-auto px-3 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex min-w-max items-center gap-1">
          {sectionNavItems.map((item) => {
            const active = isActive(pathname, item)
            return (
              <li key={item.id}>
                <a
                  ref={(element) => {
                    if (active) activeLinkRef.current = element
                  }}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-8 items-center rounded-[4px] px-3 font-sans text-[13px] tracking-[0] transition-colors ${
                    active
                      ? 'bg-foreground/[0.06] text-foreground'
                      : 'text-foreground/50 hover:bg-foreground/[0.035] hover:text-foreground'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
