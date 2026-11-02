import BadgeCheckIcon from '~icons/lucide/badge-check'
import BanIcon from '~icons/lucide/ban'
import BotIcon from '~icons/lucide/bot'
import Building2Icon from '~icons/lucide/building-2'
import CircleArrowUpIcon from '~icons/lucide/circle-arrow-up'
import CircleCheckIcon from '~icons/lucide/circle-check'
import CircleUserRoundIcon from '~icons/lucide/circle-user-round'
import CircleXIcon from '~icons/lucide/circle-x'
import CoinsIcon from '~icons/lucide/coins'
import DoorOpenIcon from '~icons/lucide/door-open'
import EyeOffIcon from '~icons/lucide/eye-off'
import FileCodeIcon from '~icons/lucide/file-code'
import FingerprintIcon from '~icons/lucide/fingerprint-pattern'
import IdCardIcon from '~icons/lucide/id-card'
import KeyRoundIcon from '~icons/lucide/key-round'
import LaptopIcon from '~icons/lucide/laptop'
import LifeBuoyIcon from '~icons/lucide/life-buoy'
import MailIcon from '~icons/lucide/mail'
import MessageSquareTextIcon from '~icons/lucide/message-square-text'
import RadioTowerIcon from '~icons/lucide/radio-tower'
import RefreshCwIcon from '~icons/lucide/refresh-cw'
import ScaleIcon from '~icons/lucide/scale'
import SendIcon from '~icons/lucide/send'
import ServerIcon from '~icons/lucide/server'
import ShieldCheckIcon from '~icons/lucide/shield-check'
import SmartphoneIcon from '~icons/lucide/smartphone'
import TimerIcon from '~icons/lucide/timer'
import UsbIcon from '~icons/lucide/usb'
import UserRoundPlusIcon from '~icons/lucide/user-round-plus'
import UsersIcon from '~icons/lucide/users'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

/** Inline icons for account concepts, so tables and steps read at a glance. */
export const docsIcons = {
  accessKey: KeyRoundIcon,
  addSigner: UserRoundPlusIcon,
  agent: BotIcon,
  approved: CircleCheckIcon,
  contract: FileCodeIcon,
  denied: CircleXIcon,
  device: SmartphoneIcon,
  document: IdCardIcon,
  email: MailIcon,
  expiry: TimerIcon,
  export: DoorOpenIcon,
  hardwareKey: UsbIcon,
  laptop: LaptopIcon,
  limit: CoinsIcon,
  login: CircleUserRoundIcon,
  passkey: FingerprintIcon,
  payment: SendIcon,
  private: EyeOffIcon,
  provider: Building2Icon,
  recovery: LifeBuoyIcon,
  relay: RadioTowerIcon,
  revoke: BanIcon,
  rotate: RefreshCwIcon,
  rules: ShieldCheckIcon,
  server: ServerIcon,
  sms: MessageSquareTextIcon,
  team: UsersIcon,
  threshold: ScaleIcon,
  upgrade: CircleArrowUpIcon,
  verified: BadgeCheckIcon,
}

export function DocsIcon({ name }: { name: keyof typeof docsIcons }) {
  const Icon = docsIcons[name]
  return (
    <Icon
      {...docsInlineIcon({ className: 'docs-inline-icon' })}
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      strokeWidth="1.75"
    />
  )
}

/** Sits on the text baseline, a small gap before the label it marks. */
const docsInlineIcon = style({
  display: 'inline-block',
  width: '16px',
  height: '16px',
  marginInlineEnd: tokens.spacing['2'],
  verticalAlign: '-3px',
  color: tokens.color.foreground,
  flexShrink: 0,
})
