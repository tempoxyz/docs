import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import BotIcon from '~icons/lucide/bot'
import BracesIcon from '~icons/lucide/braces'
import CodeIcon from '~icons/lucide/code-xml'
import CoinsIcon from '~icons/lucide/coins'
import NetworkIcon from '~icons/lucide/network'
import ServerIcon from '~icons/lucide/server'
import WalletIcon from '~icons/lucide/wallet'
import { docsLinkCards } from '../lib/docs-link-cards'
import './DocsSetupCards.css'

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
    <div className="docs-setup-grid">
      {docsLinkCards[collection].map(({ title, description, icon, links }) => {
        const Icon = icons[icon]
        return (
          <section className="docs-setup-card" key={title}>
            <h3>
              <Icon aria-hidden="true" focusable="false" width="20" height="20" />
              {title}
            </h3>
            <p>{description}</p>
            <div className="docs-setup-links">
              {links.map(([label, href]) => (
                <a key={href} href={href}>
                  {label}
                  <ArrowUpRightIcon aria-hidden="true" focusable="false" width="16" height="16" />
                </a>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
