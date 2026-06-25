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
      '/docs/api',
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
    <>
      <style>{`
        @media (width >= 1024px) {
          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(300px, 460px) minmax(0, 1fr) !important;
            align-items: center !important;
            gap: 12px !important;
            padding-inline: 20px !important;
          }

          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) > ul {
            display: none !important;
          }

          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) > a[aria-label='Tempo home'] {
            min-width: 0;
          }

          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) > div {
            grid-column: 3;
            justify-self: end;
            gap: 20px !important;
          }

          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) > div > button:first-child {
            position: absolute;
            top: 50%;
            left: 50%;
            display: flex !important;
            width: min(460px, calc(100vw - 560px));
            min-width: 300px;
            height: 40px;
            transform: translate(-50%, -50%);
            justify-content: space-between;
            border-radius: 6px;
            background: var(--background);
            padding-inline: 14px;
            color: color-mix(in srgb, var(--foreground) 55%, transparent);
            font-size: 0 !important;
            box-shadow: 0 1px 1px rgb(0 0 0 / 0.03);
          }

          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) > div > button:first-child::after {
            content: 'Search docs...';
            order: 1;
            margin-right: auto;
            font-size: 14px;
          }

          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) > div > button:first-child svg {
            order: 0;
          }

          body:has(.docs-section-nav) nav:has(> a[aria-label='Tempo home']) > div > button:first-child kbd {
            order: 2;
            background: var(--surface-input);
            font-size: 11px !important;
          }
        }

        @media (width >= 1080px) {
          .docs-section-nav {
            right: max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5)) !important;
            left: max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5)) !important;
          }

          [data-layout][data-v-sidebar] > [data-v-gutter-left] {
            padding-top: var(--vocs-spacing-topNav) !important;
          }
        }
      `}</style>
      <div className="docs-section-nav border-line border-x border-b bg-surface-shell">
        <nav
          ref={navRef}
          aria-label="Documentation sections"
          className="flex h-[var(--tempo-docs-section-nav-height)] items-stretch overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex min-w-max items-stretch gap-8">
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
                    className={`flex h-full items-center border-b-2 pt-0.5 font-normal font-sans text-[14px] tracking-[0] transition-colors ${
                      active
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-foreground/50 hover:text-foreground'
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
    </>
  )
}
