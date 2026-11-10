'use client'

import { Link } from 'waku'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import { publicAssetPath } from '../lib/public-asset-path'
import * as ui from './DocsFooter.recipes'
import { TempoMark } from './ToolLogos'

type FooterLink = { label: string; href: string; file?: boolean }
type FooterColumn = { header: string; links: FooterLink[] }

const columns: FooterColumn[] = [
  {
    header: 'Docs',
    links: [
      { label: 'Get started', href: '/get-started' },
      { label: 'Tempo EVM', href: '/docs/development' },
      { label: 'Operate', href: '/docs/guide/node' },
      { label: 'API reference', href: '/docs/api' },
      { label: 'SDKs & CLI', href: '/docs/sdk' },
      { label: 'Guides', href: '/docs/resources/guides' },
      { label: 'Partners', href: '/docs/partners' },
    ],
  },
  {
    header: 'Products',
    links: [
      { label: 'Accounts', href: '/docs/accounts' },
      { label: 'Earn', href: '/docs/earn' },
      { label: 'Routes', href: '/docs/routes' },
      { label: 'Zones', href: '/docs/zones' },
      { label: 'Machine Payments', href: '/docs/agents' },
    ],
  },
  {
    header: 'Tools',
    links: [
      { label: 'Testnet faucet', href: '/docs/quickstart/faucet' },
      { label: 'Network details', href: '/docs/quickstart/connection-details' },
      { label: 'Changelog', href: '/docs/changelog' },
      { label: 'Tempo Explorer', href: 'https://explore.tempo.xyz' },
    ],
  },
  {
    header: 'For agents',
    links: [
      { label: 'Agent setup', href: '/docs/guide/using-tempo-with-ai' },
      { label: 'Docs skill', href: '/SKILL.md', file: true },
      { label: 'llms.txt', href: '/llms.txt', file: true },
    ],
  },
  {
    header: 'Tempo',
    links: [
      { label: 'tempo.xyz', href: 'https://tempo.xyz' },
      { label: 'Console', href: 'https://console.tempo.xyz' },
      { label: 'Wallet', href: 'https://wallet.tempo.xyz' },
      { label: 'MPP', href: 'https://mpp.dev' },
      { label: 'Mercator', href: 'https://mercator.sh' },
      { label: 'Contact', href: 'https://tempo.xyz/contact' },
    ],
  },
]

const socialLinks: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/tempoxyz' },
  { label: 'X', href: 'https://twitter.com/tempo' },
]

function FooterLinkItem({ link, className }: { link: FooterLink; className: string }) {
  if (link.file)
    return (
      <a href={publicAssetPath(link.href)} className={className}>
        {link.label}
      </a>
    )
  if (link.href.startsWith('/'))
    return (
      <Link to={link.href} className={className}>
        {link.label}
      </Link>
    )
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
      <ArrowUpRightIcon aria-hidden="true" width="12" height="12" {...ui.externalIcon()} />
      <span {...ui.visuallyHidden()}> (opens in a new tab)</span>
    </a>
  )
}

/** Site footer for every docs page: a black band in both themes, under the article. */
export default function DocsFooter() {
  const linkClassName = ui.link().className
  return (
    <div className={`docs-footer ${ui.band().className}`}>
      <div className={`docs-footer-inner ${ui.inner().className}`}>
        <div {...ui.brand()}>
          <TempoMark aria-hidden="true" focusable="false" {...ui.mark()} />
          <p {...ui.tagline()}>
            Stablecoin payments infrastructure for developers, apps and agents.
          </p>
        </div>
        <nav aria-label="Footer" {...ui.columns()}>
          {columns.map((column) => (
            <div key={column.header} {...ui.column()}>
              <p {...ui.columnHeader()}>{column.header}</p>
              <ul {...ui.list()}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} className={linkClassName} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div {...ui.bottom()}>
          <span>© {new Date().getFullYear()} Tempo</span>
          {socialLinks.map((link) => (
            <FooterLinkItem key={link.label} link={link} className={ui.bottomLink().className} />
          ))}
        </div>
      </div>
    </div>
  )
}
