import ArrowLeftRightIcon from '~icons/lucide/arrow-left-right'
import BotIcon from '~icons/lucide/bot'
import LockKeyholeIcon from '~icons/lucide/lock-keyhole'
import TrendingUpIcon from '~icons/lucide/trending-up'
import WalletIcon from '~icons/lucide/wallet'

const icons = {
  accounts: WalletIcon,
  earn: TrendingUpIcon,
  agents: BotIcon,
  zones: LockKeyholeIcon,
  routes: ArrowLeftRightIcon,
}

export function DocsHomeProductIcon({ product }: { product: keyof typeof icons }) {
  const Icon = icons[product]
  return (
    <Icon
      className="tempo-docs-home-product-icon"
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      strokeWidth="1.75"
    />
  )
}
