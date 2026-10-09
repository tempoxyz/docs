import Link from 'next/link'
import SimpleIconsGithub from '~icons/simple-icons/github'
import SimpleIconsX from '~icons/simple-icons/x'
import { developersPath } from '../_lib/developersPaths'
import { featurePath } from '../_lib/featurePaths'
import { TEMPO_SDK_DOCS_URL } from '../_lib/links'
import EdgeMarkers from './EdgeMarkers'
import * as ui from './Footer.recipes'
import Reveal from './Reveal'
import TempoLogo from './TempoLogo'
import ThemeToggle from './ThemeToggle'

type FooterLink = {
  label: string
  href: string
}
type FooterColumn = { header: string; links: FooterLink[] }

const footerLinkClassName = ui.footerStateState().className

const CONTACT_URL = 'https://tempo.xyz/contact'
const GITHUB_URL = 'https://github.com/tempoxyz'
const X_URL = 'https://twitter.com/tempo'

function FooterLinkItem({ link }: { link: FooterLink }) {
  return link.href.startsWith('/') ? (
    <Link href={link.href} className={footerLinkClassName}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={footerLinkClassName}>
      {link.label}
    </a>
  )
}

const columns: FooterColumn[] = [
  {
    header: 'Protocol',
    links: [
      { label: 'Transactions', href: featurePath('transactions') },
      { label: 'TIP-20 tokens', href: featurePath('tokens') },
    ],
  },
  {
    header: 'Documentation',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Tempo API', href: '/docs/api' },
      { label: 'Payments guide', href: '/docs/guide/payments' },
      { label: 'Token issuance', href: '/docs/guide/issuance' },
    ],
  },
  {
    header: 'Tools',
    links: [
      { label: 'Tempo CLI', href: '/docs/wallet' },
      { label: 'TIDX', href: '/docs/api/indexer-api' },
      { label: 'Tempo Explorer', href: 'https://explorer.tempo.xyz' },
      { label: 'Tempo Faucet', href: 'https://faucet.tempo.xyz' },
    ],
  },
  {
    header: 'Libraries',
    links: [
      { label: 'MPP', href: 'https://mpp.dev/' },
      { label: 'SDKs', href: TEMPO_SDK_DOCS_URL },
      { label: 'GitHub', href: 'https://github.com/tempoxyz' },
    ],
  },
  {
    header: 'For agents',
    links: [
      {
        label: 'Tempo Docs skill',
        href: `${developersPath('/docs/guide/using-tempo-with-ai')}#docs-skill`,
      },
      { label: 'Tempo MCP server', href: developersPath('/docs/guide/using-tempo-with-ai') },
      {
        label: 'Setup docs',
        href: developersPath('/docs/guide/using-tempo-with-ai'),
      },
    ],
  },
  {
    header: 'Resources',
    links: [
      { label: 'Blog', href: developersPath('/blog') },
      { label: 'Performance', href: developersPath('/performance') },
      { label: 'Open source', href: developersPath('/#open-source') },
      { label: 'Contact', href: CONTACT_URL },
    ],
  },
]

const socialLinks = [
  { label: 'GitHub', href: GITHUB_URL, Icon: SimpleIconsGithub },
  { label: 'X', href: X_URL, Icon: SimpleIconsX },
]

export default function Footer() {
  return (
    <footer {...ui.footerFooter()}>
      <EdgeMarkers wideOnly />
      <Reveal>
        <div {...ui.footerLayout()}>
          <div {...ui.footerLayout2()}>
            <Link href="/" aria-label="Tempo home" className={ui.link().className}>
              <TempoLogo className={ui.tempoLogo().className} />
            </Link>
            <p {...ui.footerDescription()}>
              Stablecoin payments infrastructure for developers, apps, and agents building on Tempo.
            </p>
            <div {...ui.footerLayout3()}>
              <Link href="/" className={ui.link2().className}>
                © {new Date().getFullYear()} Tempo
              </Link>
              <a href="https://tempo.xyz" target="_blank" rel="noopener noreferrer" {...ui.link2()}>
                tempo.xyz
              </a>
            </div>
            <div {...ui.footerLayout4()}>
              <nav {...ui.nav()} aria-label="Social links">
                {socialLinks.map(({ label, href, Icon }, index) => (
                  <div key={label} {...ui.footerLayout5()}>
                    {index !== 0 && <span {...ui.footerText()} aria-hidden="true" />}
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      {...ui.footerLink()}
                    >
                      <Icon className={ui.icon().className} />
                    </a>
                  </div>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </div>

          <nav aria-label="Footer" {...ui.nav2()}>
            {columns.map((col) => (
              <div key={col.header} {...ui.footerLayout6()}>
                <p {...ui.footerDescription2()}>{col.header}</p>
                <ul {...ui.footerList()}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Reveal>
    </footer>
  )
}
