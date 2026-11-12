'use client'

import { MdxPageContext } from 'vocs'
import { Link, useRouter } from 'waku'
import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import { docsAreas, getDocsSectionById } from '../lib/docs-sections'
import * as ui from './DocsFooter.recipes'
import { TempoMark } from './ToolLogos'

type FooterLink = { label: string; href: string }
type FooterColumn = { header: string; links: FooterLink[] }

export type DocsFooterVariant = 'compact' | 'full'

const githubLink: FooterLink = { label: 'GitHub', href: 'https://github.com/tempoxyz' }
const xLink: FooterLink = { label: 'X', href: 'https://twitter.com/tempo' }
const tempoLink: FooterLink = { label: 'tempo.xyz', href: 'https://tempo.xyz' }
const consoleLink: FooterLink = { label: 'Console', href: 'https://console.tempo.xyz' }
const explorerLink: FooterLink = { label: 'Explorer', href: 'https://explore.tempo.xyz' }

const compactLinks = [tempoLink, consoleLink, explorerLink, githubLink, xLink]
const socialLinks = [githubLink, xLink]

// The Docs, Reference and Resources columns are the top-bar tabs and their sections, so the
// footer keeps the nav's labels and landing routes. Home has no sections and no column.
const columns: FooterColumn[] = [
  ...docsAreas
    .filter((area) => area.sections.length > 0)
    .map((area) => ({
      header: area.label,
      links: area.sections.flatMap((id) => {
        const section = getDocsSectionById(id)
        return section ? [{ label: section.label, href: section.href }] : []
      }),
    })),
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

/** Full on Home and Not found (its frontmatter sets `footer: full`), Compact on docs pages. */
function useFooterVariant(): DocsFooterVariant {
  const { path } = useRouter()
  const { frontmatter } = MdxPageContext.use()
  const pathname = (path ?? '/').replace(/^\/developers(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  return pathname === '/' || frontmatter?.footer === 'full' ? 'full' : 'compact'
}

/** The site footer under every page, rendered through the Vocs Footer slot. */
export default function DocsFooter({ variant }: { variant?: DocsFooterVariant }) {
  const routeVariant = useFooterVariant()
  const type = variant ?? routeVariant
  const copyright = <span>© {new Date().getFullYear()} Tempo</span>

  if (type === 'compact')
    return (
      <div className={`docs-site-footer ${ui.root().className}`} data-variant="compact">
        <div {...ui.compact()}>
          {copyright}
          <nav aria-label="Footer">
            <LinkList links={compactLinks} className={ui.inlineList().className} />
          </nav>
        </div>
      </div>
    )

  return (
    <div className={`docs-site-footer ${ui.root().className} ${ui.full().className}`} data-variant="full">
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
