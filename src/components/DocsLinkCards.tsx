import BotIcon from '~icons/lucide/bot'
import BracesIcon from '~icons/lucide/braces'
import CodeIcon from '~icons/lucide/code-xml'
import CoinsIcon from '~icons/lucide/coins'
import NetworkIcon from '~icons/lucide/network'
import ServerIcon from '~icons/lucide/server'
import WalletIcon from '~icons/lucide/wallet'
import { docsLinkCards } from '../lib/docs-link-cards'
import {
  docsSetupCard,
  docsSetupGrid,
  docsSetupLink,
  docsSetupLinkChevron,
  docsSetupLinks,
} from './DocsSetupCards.styles'

const icons = {
  network: NetworkIcon,
  code: CodeIcon,
  api: BracesIcon,
  agent: BotIcon,
  wallet: WalletIcon,
  tokens: CoinsIcon,
  server: ServerIcon,
}

export function DocsLinkCards({ collection }: { collection: keyof typeof docsLinkCards }) {
  return (
    <div className={`docs-setup-grid ${docsSetupGrid().className}`}>
      {docsLinkCards[collection].map(({ title, description, icon, links }) => {
        const Icon = icons[icon]
        return (
          <section className={`docs-setup-card ${docsSetupCard().className}`} key={title}>
            <h3>
              <Icon aria-hidden="true" focusable="false" width="20" height="20" />
              {title}
            </h3>
            <p>{description}</p>
            <div className={`docs-setup-links ${docsSetupLinks().className}`}>
              {links.map(([label, href]) => (
                <a key={href} href={href} className={docsSetupLink().className}>
                  {label}
                  <svg
                    viewBox="0 0 30.45 53"
                    aria-hidden="true"
                    className={docsSetupLinkChevron().className}
                  >
                    <path
                      d="M2.79 2.79 26.5 26.5 2.79 50.21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7.9"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
