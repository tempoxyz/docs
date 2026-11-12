import ArrowLeftRightIcon from '~icons/lucide/arrow-left-right'
import BotIcon from '~icons/lucide/bot'
import BracesIcon from '~icons/lucide/braces'
import CodeXmlIcon from '~icons/lucide/code-xml'
import CoinsIcon from '~icons/lucide/coins'
import CreditCardIcon from '~icons/lucide/credit-card'
import DropletIcon from '~icons/lucide/droplet'
import FingerprintIcon from '~icons/lucide/fingerprint-pattern'
import KeyRoundIcon from '~icons/lucide/key-round'
import LifeBuoyIcon from '~icons/lucide/life-buoy'
import LockKeyholeIcon from '~icons/lucide/lock-keyhole'
import NetworkIcon from '~icons/lucide/network'
import RepeatIcon from '~icons/lucide/repeat'
import SendIcon from '~icons/lucide/send'
import ShieldCheckIcon from '~icons/lucide/shield-check'
import SquareTerminalIcon from '~icons/lucide/square-terminal'
import TrendingUpIcon from '~icons/lucide/trending-up'
import WalletIcon from '~icons/lucide/wallet'
import { tempoDocsHomeIconTile, tempoDocsHomeProductIcon } from './DocsHome.styles'

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
  api: BracesIcon,
  faucet: DropletIcon,
  sdk: SquareTerminalIcon,
}

/** A product icon: 20 beside a card title, or 16 in a 32 icon tile (`tile`). */
export function DocsHomeProductIcon({
  product,
  tile = false,
}: {
  product: keyof typeof docsProductIcons
  tile?: boolean
}) {
  const Icon = docsProductIcons[product]
  if (tile)
    return (
      <span className={`tempo-docs-home-icon-tile ${tempoDocsHomeIconTile().className}`}>
        <Icon aria-hidden="true" focusable="false" width="16" height="16" strokeWidth="1.75" />
      </span>
    )
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
