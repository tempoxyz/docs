'use client'

import { MdxPageContext } from 'vocs'
import { Link, useRouter } from 'waku'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import { docsResourceSections, docsSections } from '../lib/docs-sections'
import * as ui from './DocsFooter.recipes'
import { TempoMark } from './ToolLogos'

type FooterLink = { label: string; href: string }
type FooterColumn = { header: string; links: FooterLink[] }

const githubLink: FooterLink = { label: 'GitHub', href: 'https://github.com/tempoxyz' }
const xLink: FooterLink = { label: 'X', href: 'https://twitter.com/tempo' }
const tempoLink: FooterLink = { label: 'tempo.xyz', href: 'https://tempo.xyz' }
const consoleLink: FooterLink = { label: 'Console', href: 'https://console.tempo.xyz' }
const explorerLink: FooterLink = { label: 'Explorer', href: 'https://explore.tempo.xyz' }

const socialLinks = [githubLink, xLink]

// Products and Resources repeat the top bar, with its labels and landing routes; the API
// reference, which has no top-bar entry, closes Resources.
const columns: FooterColumn[] = [
  {
    header: 'Products',
    links: docsSections.map((section) => ({ label: section.label, href: section.href })),
  },
  {
    header: 'Resources',
    links: [
      ...docsResourceSections.map((section) => ({ label: section.label, href: section.href })),
      { label: 'API reference', href: '/docs/api' },
    ],
  },
  {
    header: 'Tempo',
    links: [
      tempoLink,
      consoleLink,
      { label: 'Wallet', href: 'https://wallet.tempo.xyz' },
      explorerLink,
      { label: 'MPP', href: 'https://mpp.dev' },
      { label: 'Mercator', href: 'https://mercator.sh' },
    ],
  },
]

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.href.startsWith('/'))
    return (
      <Link to={link.href} {...ui.link()}>
        {link.label}
      </Link>
    )
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" {...ui.link()}>
      {link.label}
      <ArrowUpRightIcon aria-hidden="true" width="12" height="12" {...ui.externalIcon()} />
      <span {...ui.visuallyHidden()}> (opens in a new tab)</span>
    </a>
  )
}

function LinkList({ links, className }: { links: FooterLink[]; className: string }) {
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.label}>
          <FooterLinkItem link={link} />
        </li>
      ))}
    </ul>
  )
}

/** Home and Not found (its frontmatter sets `footer: full`) have a footer; docs pages end at Previous / Next. */
function useShowsFooter() {
  const { path } = useRouter()
  const { frontmatter } = MdxPageContext.use()
  const pathname = (path ?? '/').replace(/^\/developers(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  return pathname === '/' || frontmatter?.footer === 'full'
}

/** The site footer on Home and Not found, rendered through the Vocs Footer slot. */
export default function DocsFooter() {
  const showsFooter = useShowsFooter()
  if (!showsFooter) return null
  const copyright = <span>© {new Date().getFullYear()} Tempo</span>

  return (
    <div
      className={`docs-site-footer ${ui.root().className} ${ui.full().className}`}
      data-variant="full"
    >
      <div {...ui.brand()}>
        <TempoMark aria-hidden="true" focusable="false" {...ui.mark()} />
        <p {...ui.tagline()}>Stablecoin payments infrastructure for developers, apps and agents.</p>
      </div>
      <nav aria-label="Footer" {...ui.columns()}>
        {columns.map((column) => (
          <div key={column.header} {...ui.column()}>
            <p {...ui.columnHeader()}>{column.header}</p>
            <LinkList links={column.links} className={ui.list().className} />
          </div>
        ))}
      </nav>
      <div {...ui.bottom()}>
        {copyright}
        <LinkList links={socialLinks} className={ui.inlineList().className} />
      </div>
    </div>
  )
}
