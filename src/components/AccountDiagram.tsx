import type { ComponentType, ReactNode, SVGProps } from 'react'
import CrownIcon from '~icons/lucide/crown'
import InfinityIcon from '~icons/lucide/infinity'
import ReceiptIcon from '~icons/lucide/receipt'
import SlidersIcon from '~icons/lucide/sliders-horizontal'
import UserIcon from '~icons/lucide/user-round'
import WalletIcon from '~icons/lucide/wallet'
import WeightIcon from '~icons/lucide/weight'
import { accountDiagram } from './AccountDiagram.styles'
import { docsIcons } from './DocsIcon'

type IconName = keyof typeof docsIcons

/** Icons the anatomy diagrams need beyond the shared docs set. */
const anatomyIcons = {
  crown: CrownIcon,
  infinity: InfinityIcon,
  receipt: ReceiptIcon,
  sliders: SlidersIcon,
  user: UserIcon,
  wallet: WalletIcon,
  weight: WeightIcon,
}

type Glyph = IconName | keyof typeof anatomyIcons

const diagrams = {
  address: AccountAddress,
  signers: SignerApproval,
  'access-keys': AccessKeyBounds,
  login: LoginApproval,
  'account-types': AccountTypes,
  'single-key': SingleKeyAccount,
  configurable: ConfigurableAccount,
  keychain: KeychainAuthority,
}

/**
 * Account diagrams. `address`, `signers`, and `access-keys` are anatomy views: boxes for the parts
 * of each component, with fields, alternatives, and members inside. The rest are compact strips of
 * icon chips. All are drawn in HTML so they wrap at phone width and
 * follow the docs theme. The figure is one image to assistive technology; `alt` carries the full
 * description, and the Markdown export renders `alt` in its place.
 */
export function AccountDiagram({ name, alt }: { name: keyof typeof diagrams; alt: string }) {
  const Diagram = diagrams[name]
  return (
    <figure
      className={`account-diagram ${accountDiagram().className}`}
      data-diagram={name}
      role="img"
      aria-label={alt}
    >
      <div className="ad-canvas">
        <Diagram />
      </div>
    </figure>
  )
}

function Icon({ name }: { name: IconName }) {
  const Svg: ComponentType<SVGProps<SVGSVGElement>> = docsIcons[name]
  return (
    <Svg
      className="ad-icon"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      strokeWidth="1.75"
    />
  )
}

function Mark({ icon }: { icon: Glyph }) {
  const Svg: ComponentType<SVGProps<SVGSVGElement>> =
    icon in anatomyIcons
      ? anatomyIcons[icon as keyof typeof anatomyIcons]
      : docsIcons[icon as IconName]
  return (
    <Svg
      className="ad-icon"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      strokeWidth="1.75"
    />
  )
}

/** An icon and a one- or two-word label, with an optional trailing value or icon. */
function Chip({
  icon,
  label,
  value,
  tone,
}: {
  icon: IconName
  label: string
  value?: ReactNode
  tone?: 'strong' | 'quiet'
}) {
  return (
    <span className={tone ? `ad-chip ad-chip-${tone}` : 'ad-chip'}>
      <Icon name={icon} />
      {label}
      {value !== undefined && <span className="ad-value">{value}</span>}
    </span>
  )
}

/**
 * A joining glyph and the chip after it. They wrap together, so a line never ends on a glyph.
 */
function Then({ glyph = '→', children }: { glyph?: string; children: ReactNode }) {
  return (
    <span className="ad-then">
      <span className="ad-glyph">{glyph}</span>
      {children}
    </span>
  )
}

/** A titled box: the thing being described, with its parts inside. */
function Part({
  icon,
  title,
  tone,
  row,
  children,
}: {
  icon: Glyph
  title: string
  tone?: 'strong' | 'quiet'
  /** Lay the fields out in one wrapping line. */
  row?: boolean
  children?: ReactNode
}) {
  const className = ['ad-part', tone && `ad-part-${tone}`, row && 'ad-part-row']
  return (
    <div className={className.filter(Boolean).join(' ')}>
      <div className="ad-part-head">
        <Mark icon={icon} />
        {title}
      </div>
      {children !== undefined && <div className="ad-part-body">{children}</div>}
    </div>
  )
}

/** One attribute of a part, with its options or members to the right. */
function Field({ icon, label, children }: { icon: Glyph; label: string; children?: ReactNode }) {
  return (
    <div className="ad-field">
      <span className="ad-field-label">
        <Mark icon={icon} />
        {label}
      </span>
      {children !== undefined && <span className="ad-field-values">{children}</span>}
    </div>
  )
}

/** Mutually exclusive options, drawn as one segmented pill. */
function OneOf({ options }: { options: ReadonlyArray<string | [Glyph, string]> }) {
  return (
    <span className="ad-oneof">
      {options.map((option) => {
        const [icon, label] = typeof option === 'string' ? [undefined, option] : option
        return (
          <span className="ad-option" key={label}>
            {icon && <Mark icon={icon} />}
            {label}
          </span>
        )
      })}
    </span>
  )
}

/** Members a part has together. */
function AllOf({ items }: { items: ReadonlyArray<string> }) {
  return (
    <span className="ad-allof">
      {items.map((item) => (
        <span className="ad-tag" key={item}>
          {item}
        </span>
      ))}
    </span>
  )
}

function AccountAddress() {
  return (
    <Part icon="document" title="Address" tone="strong">
      <div className="ad-choice">
        <span className="ad-choice-label">One of</span>
        <div className="ad-choice-options">
          <Part icon="user" title="Single-key (EOA)">
            <Field icon="accessKey" label="Key" />
          </Part>
          <Part icon="sliders" title="Configurable">
            <Field icon="team" label="Signers">
              <span className="ad-tag">
                <Mark icon="weight" />
                Weight
              </span>
            </Field>
            <Field icon="threshold" label="Threshold" />
          </Part>
        </div>
      </div>
      <div className="ad-shared">
        <Field icon="wallet" label="TIP-20 balances" />
        <Field icon="accessKey" label="Access keys" />
        <Field icon="receipt" label="Fee token" />
      </div>
    </Part>
  )
}

function SignerApproval() {
  return (
    <div className="ad-tree">
      <Part icon="addSigner" title="Signer" tone="strong">
        <Field icon="weight" label="Weight" />
        <Field icon="rules" label="Type">
          <OneOf
            options={[
              ['accessKey', 'Private key'],
              ['device', 'Device key'],
              ['passkey', 'Passkey'],
              ['login', 'OIDC login'],
            ]}
          />
        </Field>
      </Part>
      <span className="ad-stem" />
      <span className="ad-sum">
        <span className="ad-tag">
          <Mark icon="weight" />Σ Weights
        </span>
        <span className="ad-glyph">≥</span>
        <span className="ad-tag ad-tag-strong">
          <Mark icon="threshold" />
          Threshold
        </span>
      </span>
    </div>
  )
}

function AccessKeyBounds() {
  return (
    <div className="ad-variants">
      <Part icon="accessKey" title="Access key" tone="strong">
        <Field icon="passkey" label="Key type">
          <OneOf options={['Passkey', 'P-256', 'secp256k1']} />
        </Field>
        <Field icon="limit" label="Spending limits">
          <AllOf items={['Per TIP-20 token']} />
          <OneOf options={['Once', 'Per period']} />
        </Field>
        <Field icon="expiry" label="Expiry" />
        <Field icon="contract" label="Scopes">
          <AllOf items={['Contracts', 'Functions', 'Recipients']} />
        </Field>
      </Part>
      <Part icon="crown" title="Admin access key" tone="quiet" row>
        <Field icon="infinity" label="No limits" />
        <Field icon="accessKey" label="Manages access keys" />
      </Part>
    </div>
  )
}

function LoginApproval() {
  return (
    <div className="ad-strip">
      <Chip icon="device" label="Device" value={<Icon name="accessKey" />} tone="strong" />
      <Then>
        <Chip icon="login" label="ID token" tone="quiet" />
      </Then>
      <Then>
        <Chip icon="verified" label="Proof" tone="quiet" />
      </Then>
      <Then>
        <Chip icon="approved" label="Tempo" />
      </Then>
    </div>
  )
}

function AccountTypes() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="accessKey" label="Single key" />
        <Then>
          <Chip icon="upgrade" label="Upgrade" tone="quiet" />
        </Then>
        <Then>
          <Chip icon="threshold" label="Configurable" />
        </Then>
      </div>
      <div className="ad-strip">
        <Chip
          icon="rules"
          label="Account Keychain"
          value={<Icon name="accessKey" />}
          tone="strong"
        />
      </div>
      <div className="ad-strip ad-strip-note">
        <span className="ad-note">Access keys for both</span>
      </div>
    </div>
  )
}

function SingleKeyAccount() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="accessKey" label="Root key" tone="strong" />
        <Then>
          <Chip icon="document" label="Address" />
        </Then>
        <Then glyph="+">
          <Chip icon="accessKey" label="Access keys" tone="quiet" />
        </Then>
      </div>
      <div className="ad-strip ad-strip-note">
        <Chip icon="upgrade" label="Upgrade" tone="quiet" />
        <span className="ad-note">Same address · version 1</span>
      </div>
    </div>
  )
}

function ConfigurableAccount() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="rules" label="Configuration" value="v0" />
        <Then>
          <Chip icon="document" label="Address" tone="strong" />
        </Then>
      </div>
      <div className="ad-strip">
        <Chip icon="team" label="Owner signatures" />
        <Then glyph="+">
          <Chip icon="rules" label="Configuration" />
        </Then>
        <Then>
          <Chip icon="verified" label="Hash match" tone="quiet" />
        </Then>
        <Then>
          <Chip icon="approved" label="Executes" tone="strong" />
        </Then>
      </div>
    </div>
  )
}

function KeychainAuthority() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="team" label="Account" />
        <Then>
          <Chip icon="accessKey" label="Access key" tone="strong" />
        </Then>
        <Then>
          <span className="ad-group">
            <Chip icon="limit" label="Limit" />
            <Chip icon="expiry" label="Expiry" />
            <Chip icon="contract" label="Scopes" />
          </span>
        </Then>
      </div>
      <div className="ad-strip ad-strip-note">
        <Chip icon="revoke" label="Revoke" tone="quiet" />
        <span className="ad-note">Permanent per key</span>
      </div>
    </div>
  )
}
