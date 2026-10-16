import ArrowLeftRightIcon from '~icons/lucide/arrow-left-right'
import BotIcon from '~icons/lucide/bot'
import CodeXmlIcon from '~icons/lucide/code-xml'
import CoinsIcon from '~icons/lucide/coins'
import CreditCardIcon from '~icons/lucide/credit-card'
import FingerprintIcon from '~icons/lucide/fingerprint-pattern'
import KeyRoundIcon from '~icons/lucide/key-round'
import LifeBuoyIcon from '~icons/lucide/life-buoy'
import LockKeyholeIcon from '~icons/lucide/lock-keyhole'
import NetworkIcon from '~icons/lucide/network'
import RepeatIcon from '~icons/lucide/repeat'
import SendIcon from '~icons/lucide/send'
import ShieldCheckIcon from '~icons/lucide/shield-check'
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
  authentication: FingerprintIcon,
  approvals: ShieldCheckIcon,
  accessKeys: KeyRoundIcon,
  recovery: LifeBuoyIcon,
  build: CodeXmlIcon,
  money: CoinsIcon,
  card: CreditCardIcon,
  automations: RepeatIcon,
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
