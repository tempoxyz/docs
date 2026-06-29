import Link from 'next/link'
import SimpleIconsGithub from '~icons/simple-icons/github'
import SimpleIconsX from '~icons/simple-icons/x'
import { developersPath } from '../_lib/developersPaths'
import { featurePath } from '../_lib/featurePaths'
import { TEMPO_SDK_DOCS_URL } from '../_lib/links'
import EdgeMarkers from './EdgeMarkers'
import Reveal from './Reveal'
import TempoLogo from './TempoLogo'
import ThemeToggle from './ThemeToggle'

type FooterLink = {
  label: string
  href: string
}
type FooterColumn = { header: string; links: FooterLink[] }

const footerLinkClassName =
  'font-sans text-[14px] tracking-[0] text-foreground/50 transition-colors hover:text-foreground'

const CONTACT_URL = 'https://tempo.xyz/contact'
const GITHUB_URL = 'https://github.com/tempoxyz'
const X_URL = 'https://twitter.com/tempo'
const TEMPO_DOCS_URL = 'https://docs.tempo.xyz/docs'

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
      { label: 'Docs', href: TEMPO_DOCS_URL },
      { label: 'Payments guide', href: '/docs/guide/payments' },
      { label: 'Token issuance', href: '/docs/guide/issuance' },
    ],
  },
  {
    header: 'Tools',
    links: [
      { label: 'Tempo CLI', href: '/docs/wallet' },
      { label: 'TIDX', href: '/docs/developer-tools/indexer' },
      { label: 'Tempo Explorer', href: 'https://explorer.tempo.xyz' },
      { label: 'Tempo Faucet', href: 'https://faucet.tempo.xyz' },
    ],
  },
  {
    header: 'Libraries',
    links: [
      { label: 'MPP', href: 'https://github.com/tempoxyz/mpp' },
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
      { label: 'Open source', href: `${developersPath('/')}#open-source` },
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
    <footer className="relative border-line border-y">
      <EdgeMarkers wideOnly />
      <Reveal>
        <div className="grid gap-12 px-5 py-12 lg:grid-cols-[minmax(220px,1fr)_2fr] lg:gap-16 lg:px-8 lg:py-16">
          <div className="flex max-w-[320px] flex-col gap-4">
            <Link href="/" aria-label="Tempo home" className="flex items-center gap-2">
              <TempoLogo className="h-[18px] w-[80px] text-foreground" />
            </Link>
            <p className="font-sans text-[15px] text-foreground/55 leading-[1.6] tracking-[0]">
              Stablecoin payments infrastructure for developers, apps, and agents building on Tempo.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[14px] text-foreground/50 tracking-[0]">
              <Link href="/" className="transition-colors hover:text-foreground">
                © {new Date().getFullYear()} Tempo
              </Link>
              <a
                href="https://tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                tempo.xyz
              </a>
            </div>
            <div className="mt-6 flex items-center gap-6 lg:mt-auto lg:pt-12">
              <nav className="flex h-9 items-center" aria-label="Social links">
                {socialLinks.map(({ label, href, Icon }, index) => (
                  <div key={label} className="flex items-center">
                    {index !== 0 && <span className="mx-2 h-4 w-px bg-line" aria-hidden />}
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex size-9 items-center justify-center text-foreground/45 transition-colors hover:text-foreground"
                    >
                      <Icon className="size-[19px]" />
                    </a>
                  </div>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.header} className="flex flex-col gap-4">
                <p className="font-sans text-[14px] text-foreground tracking-[0]">{col.header}</p>
                <ul className="flex flex-col gap-3">
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
