import ArrowLeftRightIcon from '~icons/lucide/arrow-left-right'
import BotIcon from '~icons/lucide/bot'
import LockKeyholeIcon from '~icons/lucide/lock-keyhole'
import NetworkIcon from '~icons/lucide/network'
import SendIcon from '~icons/lucide/send'
import TrendingUpIcon from '~icons/lucide/trending-up'
import WalletIcon from '~icons/lucide/wallet'
import { tempoDocsHomeProductIcon } from './DocsHome.styles'

export const docsProductIcons = {
  accounts: WalletIcon,
  network: NetworkIcon,
  payments: SendIcon,
  earn: TrendingUpIcon,
  agents: BotIcon,
  zones: LockKeyholeIcon,
  routes: ArrowLeftRightIcon,
}

export function DocsHomeProductIcon({ product }: { product: keyof typeof docsProductIcons }) {
  const Icon = docsProductIcons[product]
  return (
    <Icon
      className={`tempo-docs-home-product-icon ${tempoDocsHomeProductIcon().className}`}
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      strokeWidth="1.75"
    />
  )
}
