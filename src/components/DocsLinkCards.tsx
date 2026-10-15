import ArrowUpRightIcon from '~icons/lucide/arrow-up-right'
import BotIcon from '~icons/lucide/bot'
import BracesIcon from '~icons/lucide/braces'
import CodeIcon from '~icons/lucide/code-xml'
import CoinsIcon from '~icons/lucide/coins'
import InboxIcon from '~icons/lucide/inbox'
import KeyIcon from '~icons/lucide/key'
import KeyRoundIcon from '~icons/lucide/key-round'
import NetworkIcon from '~icons/lucide/network'
import RotateCcwKeyIcon from '~icons/lucide/rotate-ccw-key'
import ServerIcon from '~icons/lucide/server'
import ShieldCheckIcon from '~icons/lucide/shield-check'
import WalletIcon from '~icons/lucide/wallet'
import { docsLinkCards } from '../lib/docs-link-cards'
import { docsSetupCard, docsSetupGrid, docsSetupLinks } from './DocsSetupCards.styles'

const icons = {
  network: NetworkIcon,
  code: CodeIcon,
  api: BracesIcon,
  agent: BotIcon,
  wallet: WalletIcon,
  tokens: CoinsIcon,
  server: ServerIcon,
  keyRound: KeyRoundIcon,
  shield: ShieldCheckIcon,
  key: KeyIcon,
  rotateKey: RotateCcwKeyIcon,
  inbox: InboxIcon,
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
